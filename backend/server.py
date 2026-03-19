from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Easypay Configuration (PRODUCTION credentials)
EASYPAY_ACCOUNT_ID = os.environ.get('EASYPAY_ACCOUNT_ID')
EASYPAY_API_KEY = os.environ.get('EASYPAY_API_KEY')
EASYPAY_BASE_URL = os.environ.get('EASYPAY_BASE_URL', 'https://api.easypay.pt/2.0')

# Emergent LLM Key for AI Assistant
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Payment Models
class OrderItem(BaseModel):
    description: str
    quantity: int
    value: float

class CustomerData(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None

class CheckoutRequest(BaseModel):
    value: float
    currency: str = "EUR"
    items: List[OrderItem]
    customer: CustomerData
    payment_methods: Optional[List[str]] = ["cc", "mb", "mbw"]
    order_id: Optional[str] = None

class PaymentRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    easypay_id: Optional[str] = None
    easypay_session: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    amount: float
    currency: str = "EUR"
    status: str = "pending"
    payment_method: Optional[str] = None
    items: List[dict] = []
    order_id: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

# ==================== EASYPAY PAYMENT ENDPOINTS ====================

@api_router.post("/checkout/create-session")
async def create_checkout_session(request: CheckoutRequest):
    """Create a new checkout session with Easypay"""
    
    try:
        # Generate unique order key
        order_key = request.order_id or f"order-{uuid.uuid4().hex[:12]}"
        
        # Prepare Easypay request payload
        easypay_payload = {
            "type": ["single"],
            "payment": {
                "methods": request.payment_methods,
                "type": "sale",
                "currency": request.currency,
                "capture": {
                    "descriptive": f"Obelisco Radical - Servicos Eletricos"
                }
            },
            "order": {
                "items": [
                    {
                        "description": item.description,
                        "quantity": item.quantity,
                        "key": f"item-{idx}",
                        "value": item.value
                    }
                    for idx, item in enumerate(request.items)
                ],
                "key": order_key,
                "value": request.value
            },
            "customer": {
                "name": request.customer.name,
                "email": request.customer.email,
                "phone": request.customer.phone or ""
            }
        }
        
        logger.info(f"Creating Easypay checkout session for order: {order_key}")
        
        # Make request to Easypay API
        async with httpx.AsyncClient() as http_client:
            response = await http_client.post(
                f"{EASYPAY_BASE_URL}/checkout",
                json=easypay_payload,
                headers={
                    "AccountId": EASYPAY_ACCOUNT_ID,
                    "ApiKey": EASYPAY_API_KEY,
                    "Content-Type": "application/json"
                },
                timeout=30.0
            )
            
            logger.info(f"Easypay response status: {response.status_code}")
            logger.info(f"Easypay response body: {response.text[:500]}")
            
            if response.status_code not in [200, 201]:
                logger.error(f"Easypay API error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to create checkout session: {response.text}"
                )
            
            response_text = response.text
            if not response_text or response_text.strip() == "":
                logger.error("Easypay returned empty response")
                raise HTTPException(
                    status_code=500,
                    detail="Payment gateway returned empty response"
                )
            
            easypay_response = response.json()
            logger.info(f"Easypay checkout created: {easypay_response.get('id')}")
        
        # Store payment in database
        payment_record = PaymentRecord(
            easypay_id=easypay_response.get("id"),
            easypay_session=easypay_response.get("session"),
            customer_name=request.customer.name,
            customer_email=request.customer.email,
            customer_phone=request.customer.phone,
            amount=request.value,
            currency=request.currency,
            status="pending",
            items=[item.model_dump() for item in request.items],
            order_id=order_key
        )
        
        doc = payment_record.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.payments.insert_one(doc)
        
        return {
            "success": True,
            "id": easypay_response.get("id"),
            "session": easypay_response.get("session"),
            "config": easypay_response.get("config"),
            "manifest": easypay_response.get("session"),  # For SDK compatibility
            "payment_id": payment_record.id
        }
        
    except httpx.RequestError as e:
        logger.error(f"Request error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Connection error with payment gateway"
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@api_router.get("/checkout/payment-methods")
async def get_payment_methods():
    """Get available payment methods"""
    return {
        "methods": [
            {
                "code": "cc",
                "name": "Cartao de Credito",
                "description": "Visa e Mastercard",
                "icon": "credit-card"
            },
            {
                "code": "mbw",
                "name": "MB Way",
                "description": "Pagamento movel portugues",
                "icon": "mobile"
            },
            {
                "code": "mb",
                "name": "Multibanco",
                "description": "Referencia Multibanco",
                "icon": "bank"
            }
        ]
    }

@api_router.get("/payments/{payment_id}")
async def get_payment_details(payment_id: str):
    """Get payment details by ID"""
    
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    
    if not payment:
        # Try to find by easypay_id
        payment = await db.payments.find_one({"easypay_id": payment_id}, {"_id": 0})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

@api_router.post("/payments/{payment_id}/update-status")
async def update_payment_status(payment_id: str, status: str):
    """Update payment status"""
    
    result = await db.payments.update_one(
        {"$or": [{"id": payment_id}, {"easypay_id": payment_id}]},
        {
            "$set": {
                "status": status,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"success": True, "status": status}

@api_router.post("/webhooks/easypay")
async def handle_easypay_webhook(request: Request):
    """Handle incoming Easypay webhook notifications"""
    
    try:
        payload = await request.json()
        
        event_id = payload.get("id")
        event_type = payload.get("type")
        event_status = payload.get("status")
        order_key = payload.get("key")
        
        logger.info(f"Received Easypay webhook: type={event_type}, status={event_status}, order={order_key}")
        
        # Store webhook event
        webhook_doc = {
            "id": str(uuid.uuid4()),
            "event_id": event_id,
            "event_type": event_type,
            "status": event_status,
            "order_key": order_key,
            "payload": payload,
            "processed": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.webhook_events.insert_one(webhook_doc)
        
        # Update payment status based on event
        new_status = "pending"
        if event_type == "capture" and event_status == "success":
            new_status = "paid"
        elif event_type == "authorisation" and event_status == "success":
            new_status = "authorized"
        elif event_status == "failed":
            new_status = "failed"
        
        # Update payment in database
        await db.payments.update_one(
            {"order_id": order_key},
            {
                "$set": {
                    "status": new_status,
                    "payment_method": payload.get("method"),
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }
            }
        )
        
        # Mark webhook as processed
        await db.webhook_events.update_one(
            {"event_id": event_id},
            {"$set": {"processed": True}}
        )
        
        logger.info(f"Payment {order_key} updated to status: {new_status}")
        
        return {"status": "ok"}
        
    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process webhook")

@api_router.get("/payments")
async def list_payments(limit: int = 50):
    """List recent payments"""
    
    payments = await db.payments.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"payments": payments, "count": len(payments)}

# ==================== ELECTRICAL ASSISTANT AI ====================

class ChatMessage(BaseModel):
    message: str

ELECTRICAL_ASSISTANT_SYSTEM = """Voce e o assistente virtual da Obelisco Radical Eletricidade, uma empresa de servicos eletricos na Grande Lisboa, Portugal.

Seu papel e:
1. Ouvir os problemas eletricos dos clientes
2. Fazer perguntas de esclarecimento quando necessario
3. Identificar o tipo de servico necessario
4. Recomendar a solucao adequada
5. Informar sobre urgencia e tempo estimado

Servicos disponiveis:
- Instalacoes Eletricas (desde EUR50) - instalacoes completas para casas, apartamentos e empresas
- Iluminacao Interior e Exterior (desde EUR27.50) - projetos LED, iluminacao decorativa
- Manutencao e Reparacao (desde EUR37) - diagnostico e reparacao de falhas
- Quadros Eletricos (desde EUR150) - instalacao e substituicao de quadros
- Cablagem Estruturada (desde EUR95) - infraestrutura para energia e dados
- Seguranca e Inspecao (desde EUR110) - avaliacao tecnica e melhorias

Taxa de deslocacao: EUR35

Sempre seja:
- Profissional e amigavel
- Claro e objetivo
- Preocupado com a seguranca do cliente
- Util em identificar a urgencia do problema

Se o problema parecer urgente (cheiro de queimado, faiscas, falta total de energia), alerte o cliente para desligar o disjuntor principal e contactar imediatamente pelo WhatsApp: +351 911 132 401

Responda sempre em portugues de Portugal."""

@api_router.post("/electrical-assistant")
async def electrical_assistant(request: ChatMessage):
    """AI-powered electrical assistant chat endpoint"""
    
    try:
        if not EMERGENT_LLM_KEY:
            raise HTTPException(status_code=500, detail="LLM API key not configured")
        
        # Create chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"electrical-assistant-{uuid.uuid4().hex[:8]}",
            system_message=ELECTRICAL_ASSISTANT_SYSTEM
        ).with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_message = UserMessage(text=request.message)
        
        # Get AI response
        response_text = await chat.send_message(user_message)
        
        # Determine urgency and service recommendation based on keywords
        urgency = "low"
        service = None
        estimated_time = None
        
        message_lower = request.message.lower()
        
        # Check for urgency indicators
        if any(word in message_lower for word in ["faisca", "cheiro", "queimado", "fumaca", "fogo", "emergencia", "urgente"]):
            urgency = "high"
        elif any(word in message_lower for word in ["nao funciona", "parou", "sem luz", "apagou"]):
            urgency = "medium"
        
        # Identify service type
        if any(word in message_lower for word in ["instalar", "instalacao", "nova", "novo"]):
            service = "Instalacoes Eletricas"
            estimated_time = "2-4 horas"
        elif any(word in message_lower for word in ["luz", "lampada", "iluminacao", "led"]):
            service = "Iluminacao Interior e Exterior"
            estimated_time = "1-2 horas"
        elif any(word in message_lower for word in ["quadro", "disjuntor", "fusivel"]):
            service = "Quadros Eletricos"
            estimated_time = "2-3 horas"
        elif any(word in message_lower for word in ["cabo", "fio", "tomada", "rede"]):
            service = "Cablagem Estruturada"
            estimated_time = "2-4 horas"
        elif any(word in message_lower for word in ["inspecao", "vistoria", "seguranca", "certificado"]):
            service = "Seguranca e Inspecao"
            estimated_time = "1-2 horas"
        else:
            service = "Manutencao e Reparacao"
            estimated_time = "1-3 horas"
        
        # Build response
        result = {
            "response": response_text,
            "recommendation": {
                "service": service,
                "description": f"Com base no seu problema, recomendamos o servico de {service}.",
                "urgency": urgency,
                "estimatedTime": estimated_time
            }
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Electrical assistant error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao processar mensagem: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
