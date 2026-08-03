from fastapi import FastAPI, APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage
import httpx
import stripe
import resend
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request as GoogleRequest

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Stripe Configuration
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# Resend Email Configuration
RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = 'obeliscoradical@gmail.com'
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# Emergent LLM Key for AI Assistant
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Google Calendar Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')
GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar']

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

class StripeCheckoutRequest(BaseModel):
    amount: float
    currency: str = "EUR"
    items: List[OrderItem]
    customer: CustomerData
    origin_url: str
    order_id: Optional[str] = None
    metadata: Optional[dict] = None

class PaymentRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stripe_session_id: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: Optional[str] = None
    amount: float
    currency: str = "EUR"
    status: str = "pending"
    payment_status: str = "pending"
    payment_method: Optional[str] = None
    items: List[dict] = []
    order_id: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Subscription Models
class SubscriptionRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    plan_id: str
    plan_name: str
    billing_cycle: str = "monthly"  # monthly or annual
    amount: float
    currency: str = "EUR"
    status: str = "active"
    hours_included: int = 0
    hours_used: float = 0.0
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Intervention Request Model
class InterventionRequest(BaseModel):
    subscription_id: str
    customer_email: str
    description: str
    urgency: str = "normal"  # normal, urgent
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    address: Optional[str] = None

class InterventionRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subscription_id: str
    customer_email: str
    customer_name: str
    description: str
    urgency: str = "normal"
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    address: Optional[str] = None
    hours_estimated: float = 1.0
    hours_used: float = 0.0
    status: str = "pending"  # pending, scheduled, in_progress, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Plan hours mapping
PLAN_HOURS = {
    "essencial": 3,
    "preventivo": 6,
    "total": 12
}

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

# ==================== EMAIL FUNCTIONS ====================

async def send_email_async(to_email: str, subject: str, html_content: str):
    """Send email using Resend (async wrapper)"""
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY not configured, skipping email")
        return None
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        result = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to_email}: {result.get('id')}")
        return result
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return None

async def send_welcome_email(customer_name: str, customer_email: str, plan_name: str, amount: float, billing_cycle: str):
    """Send welcome email to new subscriber"""
    cycle_text = "mensal" if billing_cycle == "monthly" else "anual"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #fff; padding: 40px; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #facc15; margin: 0;">Obelisco Care</h1>
            <p style="color: #a1a1aa; margin-top: 5px;">Bem-vindo ao seu plano de manutencao</p>
        </div>
        
        <p style="color: #fff;">Ola <strong>{customer_name}</strong>,</p>
        
        <p style="color: #d4d4d8;">Obrigado por subscrever o plano <strong style="color: #facc15;">{plan_name}</strong>!</p>
        
        <div style="background: #27272a; border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0; color: #a1a1aa;">Detalhes da subscricao:</p>
            <p style="margin: 10px 0 0; font-size: 24px; color: #facc15; font-weight: bold;">{amount:.0f} EUR/{cycle_text}</p>
        </div>
        
        <p style="color: #d4d4d8;">Agora pode aceder ao seu painel de cliente para:</p>
        <ul style="color: #d4d4d8;">
            <li>Ver as suas horas disponiveis</li>
            <li>Pedir intervencoes tecnicas</li>
            <li>Consultar o historico de pagamentos</li>
        </ul>
        
        <p style="color: #d4d4d8;">Qualquer duvida, contacte-nos:</p>
        <p style="color: #facc15;">WhatsApp: +351 911 132 401</p>
        <p style="color: #facc15;">Email: obeliscoradical@gmail.com</p>
        
        <p style="color: #71717a; font-size: 12px; margin-top: 30px; text-align: center;">
            Obelisco Radical Unipessoal Lda - Servicos Eletricos na Grande Lisboa
        </p>
    </div>
    """
    await send_email_async(customer_email, f"Bem-vindo ao Obelisco Care - Plano {plan_name}", html)

async def send_admin_notification(notification_type: str, customer_name: str, customer_email: str, details: dict):
    """Send notification to admin about new subscription/purchase"""
    if notification_type == "subscription":
        subject = f"Nova Subscricao: {details.get('plan_name')} - {customer_name}"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #fff; padding: 40px; border-radius: 16px;">
            <h2 style="color: #22c55e;">Nova Subscricao Obelisco Care</h2>
            
            <div style="background: #27272a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> {customer_name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {customer_email}</p>
                <p style="margin: 5px 0;"><strong>Telefone:</strong> {details.get('phone', 'N/A')}</p>
                <p style="margin: 5px 0;"><strong>Plano:</strong> <span style="color: #facc15;">{details.get('plan_name')}</span></p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> {details.get('amount', 0):.0f} EUR/{details.get('billing_cycle', 'mes')}</p>
            </div>
            
            <p style="color: #71717a; font-size: 12px;">Notificacao automatica do site Obelisco Radical</p>
        </div>
        """
    elif notification_type == "purchase":
        subject = f"Nova Compra: {details.get('amount', 0):.2f} EUR - {customer_name}"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #fff; padding: 40px; border-radius: 16px;">
            <h2 style="color: #22c55e;">Nova Compra no Site</h2>
            
            <div style="background: #27272a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> {customer_name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {customer_email}</p>
                <p style="margin: 5px 0;"><strong>Telefone:</strong> {details.get('phone', 'N/A')}</p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> <span style="color: #facc15;">{details.get('amount', 0):.2f} EUR</span></p>
                <p style="margin: 5px 0;"><strong>Servicos:</strong></p>
                <ul style="color: #d4d4d8;">
                    {"".join([f"<li>{item.get('description', 'Item')}</li>" for item in details.get('items', [])])}
                </ul>
            </div>
            
            <p style="color: #71717a; font-size: 12px;">Notificacao automatica do site Obelisco Radical</p>
        </div>
        """
    elif notification_type == "intervention":
        subject = f"Novo Pedido de Intervencao: {customer_name}"
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #18181b; color: #fff; padding: 40px; border-radius: 16px;">
            <h2 style="color: #f59e0b;">Novo Pedido de Intervencao</h2>
            
            <div style="background: #27272a; border-radius: 12px; padding: 20px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> {customer_name}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {customer_email}</p>
                <p style="margin: 5px 0;"><strong>Plano:</strong> {details.get('plan_name', 'N/A')}</p>
                <p style="margin: 5px 0;"><strong>Urgencia:</strong> <span style="color: {'#ef4444' if details.get('urgency') == 'urgent' else '#22c55e'};">{details.get('urgency', 'normal').upper()}</span></p>
                <p style="margin: 5px 0;"><strong>Data preferida:</strong> {details.get('preferred_date', 'Nao especificada')}</p>
                <p style="margin: 5px 0;"><strong>Hora preferida:</strong> {details.get('preferred_time', 'Nao especificada')}</p>
                <p style="margin: 5px 0;"><strong>Morada:</strong> {details.get('address', 'Nao especificada')}</p>
                <p style="margin: 5px 0;"><strong>Descricao:</strong></p>
                <p style="color: #d4d4d8; background: #3f3f46; padding: 10px; border-radius: 8px;">{details.get('description', 'Sem descricao')}</p>
            </div>
            
            <p style="color: #71717a; font-size: 12px;">Notificacao automatica do site Obelisco Radical</p>
        </div>
        """
    else:
        return
    
    await send_email_async(ADMIN_EMAIL, subject, html)

# ==================== STRIPE PAYMENT ENDPOINTS ====================

@api_router.get("/stripe/config")
async def get_stripe_config():
    """Get Stripe publishable key for frontend"""
    return {"publishable_key": STRIPE_PUBLISHABLE_KEY}

@api_router.post("/stripe/create-checkout-session")
async def create_stripe_checkout_session(request: StripeCheckoutRequest):
    """Create a Stripe Checkout Session"""
    
    try:
        order_key = request.order_id or f"order-{uuid.uuid4().hex[:12]}"
        
        # Convert amount to cents (Stripe uses smallest currency unit)
        amount_cents = int(request.amount * 100)
        
        # Build line items for Stripe
        line_items = []
        for item in request.items:
            line_items.append({
                "price_data": {
                    "currency": request.currency.lower(),
                    "product_data": {
                        "name": item.description,
                    },
                    "unit_amount": int(item.value / item.quantity * 100),
                },
                "quantity": item.quantity,
            })
        
        # Create Stripe Checkout Session
        session = stripe.checkout.Session.create(
            line_items=line_items,
            mode="payment",
            success_url=f"{request.origin_url}?payment_success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{request.origin_url}?payment_cancelled=true",
            customer_email=request.customer.email,
            metadata={
                "order_id": order_key,
                "customer_name": request.customer.name,
                "customer_phone": request.customer.phone or "",
                **(request.metadata or {})
            },
        )
        
        logger.info(f"Stripe session created: {session.id}")
        
        # Store payment record in database
        payment_record = PaymentRecord(
            stripe_session_id=session.id,
            customer_name=request.customer.name,
            customer_email=request.customer.email,
            customer_phone=request.customer.phone,
            amount=request.amount,
            currency=request.currency,
            status="initiated",
            payment_status="pending",
            items=[item.model_dump() for item in request.items],
            order_id=order_key,
            metadata=request.metadata
        )
        
        doc = payment_record.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        doc['updated_at'] = doc['updated_at'].isoformat()
        
        await db.payments.insert_one(doc)
        
        return {
            "success": True,
            "session_id": session.id,
            "checkout_url": session.url,
            "payment_id": payment_record.id,
            "order_id": order_key
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

class SubscriptionRequest(BaseModel):
    lookup_key: str
    customer_email: str
    customer_name: str
    customer_phone: Optional[str] = None
    origin_url: str

@api_router.post("/stripe/create-subscription-session")
async def create_subscription_session(request: SubscriptionRequest):
    """Create a Stripe Checkout Session for subscription"""
    
    try:
        # Get price by lookup key
        prices = stripe.Price.list(lookup_keys=[request.lookup_key], active=True, limit=1).data
        if not prices:
            raise HTTPException(status_code=404, detail=f"Price not found: {request.lookup_key}")
        
        price = prices[0]
        
        # Create Stripe Checkout Session for subscription
        session = stripe.checkout.Session.create(
            line_items=[{"price": price.id, "quantity": 1}],
            mode="subscription",
            success_url=f"{request.origin_url}?subscription_success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{request.origin_url}?subscription_cancelled=true",
            customer_email=request.customer_email,
            metadata={
                "customer_name": request.customer_name,
                "customer_phone": request.customer_phone or "",
                "plan": request.lookup_key,
            },
        )
        
        logger.info(f"Subscription session created: {session.id} for plan {request.lookup_key}")
        
        # Store subscription record in database
        subscription_doc = {
            "id": str(uuid.uuid4()),
            "stripe_session_id": session.id,
            "customer_name": request.customer_name,
            "customer_email": request.customer_email,
            "customer_phone": request.customer_phone,
            "plan": request.lookup_key,
            "amount": price.unit_amount / 100,
            "currency": price.currency.upper(),
            "status": "initiated",
            "payment_status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
        
        await db.subscriptions.insert_one(subscription_doc)
        
        return {
            "success": True,
            "session_id": session.id,
            "checkout_url": session.url,
            "plan": request.lookup_key,
            "amount": price.unit_amount / 100,
            "currency": price.currency.upper()
        }
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@api_router.get("/stripe/plans")
async def get_subscription_plans():
    """Get available subscription plans with monthly and annual options"""
    plans = [
        {
            "id": "essencial",
            "name": "Essencial",
            "tagline": "Suporte para o dia a dia da sua operacao",
            "hours_included": 3,
            "pricing": {
                "monthly": {"lookup_key": "essencial_monthly", "price": 349, "interval": "mes"},
                "annual": {"lookup_key": "essencial_annual", "price": 3490, "interval": "ano", "savings": 698}
            },
            "currency": "EUR",
            "features": [
                "Ate 3 horas de intervencao tecnica/mes",
                "Deslocacao incluida na Grande Lisboa",
                "Prioridade de resposta: ate 48h uteis",
                "1 visita preventiva semestral",
                "Apoio telefonico e diagnostico remoto",
                "5% de desconto em horas adicionais",
                "Relatorio tecnico semestral"
            ],
            "ideal_for": "Ideal para pequenas empresas, lojas e escritorios"
        },
        {
            "id": "preventivo",
            "name": "Preventivo",
            "tagline": "Prevencao que evita custos e paragens",
            "hours_included": 6,
            "pricing": {
                "monthly": {"lookup_key": "preventivo_monthly", "price": 699, "interval": "mes"},
                "annual": {"lookup_key": "preventivo_annual", "price": 6990, "interval": "ano", "savings": 1398}
            },
            "currency": "EUR",
            "features": [
                "Ate 6 horas de intervencao tecnica/mes",
                "Deslocacao incluida na Grande Lisboa",
                "Prioridade de resposta: ate 24h uteis",
                "2 visitas preventivas por ano",
                "Manutencao preventiva programada",
                "10% de desconto em horas adicionais",
                "Relatorio tecnico trimestral"
            ],
            "ideal_for": "Ideal para empresas e edificios que pretendem reduzir avarias e custos"
        },
        {
            "id": "total",
            "name": "Total",
            "tagline": "Cobertura completa, tranquilidade total",
            "hours_included": 12,
            "popular": True,
            "pricing": {
                "monthly": {"lookup_key": "total_monthly", "price": 1290, "interval": "mes"},
                "annual": {"lookup_key": "total_annual", "price": 12900, "interval": "ano", "savings": 2580}
            },
            "currency": "EUR",
            "features": [
                "Ate 12 horas de intervencao tecnica/mes",
                "Deslocacao incluida na Grande Lisboa",
                "Prioridade de resposta: ate 8h uteis",
                "2 visitas preventivas trimestrais",
                "Manutencao preventiva e corretiva",
                "Consultoria tecnica e pequenas melhorias",
                "15% de desconto em horas adicionais",
                "Relatorio tecnico mensal"
            ],
            "ideal_for": "Ideal para empresas, condominios e operacoes criticas"
        }
    ]
    return {"plans": plans}

@api_router.get("/stripe/session/{session_id}")
async def get_stripe_session_status(session_id: str):
    """Get Stripe session status"""
    try:
        # First check our database
        record = await db.payments.find_one({"stripe_session_id": session_id}, {"_id": 0})
        
        # Also check Stripe directly for the latest status
        try:
            session = stripe.checkout.Session.retrieve(session_id)
            stripe_status = session.payment_status
            
            # Update our database if Stripe says paid
            if stripe_status == "paid" and record and record.get("payment_status") != "paid":
                await db.payments.update_one(
                    {"stripe_session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {
                        "status": "completed",
                        "payment_status": "paid",
                        "stripe_payment_intent_id": session.payment_intent,
                        "updated_at": datetime.now(timezone.utc).isoformat()
                    }}
                )
                record = await db.payments.find_one({"stripe_session_id": session_id}, {"_id": 0})
        except stripe.error.StripeError as e:
            logger.error(f"Stripe session retrieve error: {str(e)}")
        
        if not record:
            raise HTTPException(status_code=404, detail="Session not found")
        
        return {
            "session_id": session_id,
            "status": record.get("status", "pending"),
            "payment_status": record.get("payment_status", "pending"),
            "amount": record.get("amount"),
            "currency": record.get("currency")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting session status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        logger.error(f"Invalid payload: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    event_type = event["type"]
    obj = event["data"]["object"]
    
    logger.info(f"Received Stripe webhook: {event_type}")
    
    # Store webhook event
    webhook_doc = {
        "id": str(uuid.uuid4()),
        "event_id": event.get("id"),
        "event_type": event_type,
        "payload": event,
        "processed": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.stripe_webhook_events.insert_one(webhook_doc)
    
    # Handle different event types
    if event_type == "checkout.session.completed":
        session_id = obj.get("id")
        payment_status = obj.get("payment_status", "paid")
        mode = obj.get("mode", "payment")
        metadata = obj.get("metadata", {})
        customer_email = obj.get("customer_email", "")
        customer_name = metadata.get("customer_name", "Cliente")
        customer_phone = metadata.get("customer_phone", "")
        
        if mode == "subscription":
            # Handle subscription checkout completed
            subscription_id = obj.get("subscription")
            customer_id = obj.get("customer")
            plan = metadata.get("plan", "")
            
            # Determine plan details
            plan_id = plan.replace("_monthly", "").replace("_annual", "")
            billing_cycle = "annual" if "_annual" in plan else "monthly"
            hours = PLAN_HOURS.get(plan_id, 3)
            
            # Get subscription details from Stripe
            try:
                stripe_sub = stripe.Subscription.retrieve(subscription_id)
                current_period_start = datetime.fromtimestamp(stripe_sub.current_period_start, tz=timezone.utc)
                current_period_end = datetime.fromtimestamp(stripe_sub.current_period_end, tz=timezone.utc)
                amount = stripe_sub.plan.amount / 100
            except Exception:
                current_period_start = datetime.now(timezone.utc)
                current_period_end = current_period_start + timedelta(days=30 if billing_cycle == "monthly" else 365)
                amount = 0
            
            # Create/update subscription record
            sub_record = {
                "id": str(uuid.uuid4()),
                "stripe_subscription_id": subscription_id,
                "stripe_customer_id": customer_id,
                "customer_email": customer_email,
                "customer_name": customer_name,
                "customer_phone": customer_phone,
                "plan_id": plan_id,
                "plan_name": plan_id.capitalize(),
                "billing_cycle": billing_cycle,
                "amount": amount,
                "currency": "EUR",
                "status": "active",
                "hours_included": hours,
                "hours_used": 0.0,
                "current_period_start": current_period_start.isoformat(),
                "current_period_end": current_period_end.isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
            }
            
            await db.subscriptions.update_one(
                {"stripe_subscription_id": subscription_id},
                {"$set": sub_record},
                upsert=True
            )
            
            logger.info(f"Subscription created: {subscription_id} for {customer_email}")
            
            # Send welcome email and admin notification
            await send_welcome_email(customer_name, customer_email, plan_id.capitalize(), amount, billing_cycle)
            await send_admin_notification("subscription", customer_name, customer_email, {
                "plan_name": plan_id.capitalize(),
                "amount": amount,
                "billing_cycle": "mes" if billing_cycle == "monthly" else "ano",
                "phone": customer_phone
            })
        else:
            # Handle one-time payment
            await db.payments.update_one(
                {"stripe_session_id": session_id, "payment_status": {"$ne": "paid"}},
                {"$set": {
                    "status": "completed",
                    "payment_status": payment_status,
                    "stripe_payment_intent_id": obj.get("payment_intent"),
                    "payment_method": "card",
                    "updated_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Get payment record for notification
            payment_record = await db.payments.find_one({"stripe_session_id": session_id}, {"_id": 0})
            if payment_record:
                await send_admin_notification("purchase", customer_name, customer_email, {
                    "amount": payment_record.get("amount", 0),
                    "phone": customer_phone,
                    "items": payment_record.get("items", [])
                })
            
            logger.info(f"Payment completed for session: {session_id}")
        
    elif event_type == "customer.subscription.updated":
        subscription_id = obj.get("id")
        status = obj.get("status")
        
        current_period_start = datetime.fromtimestamp(obj.get("current_period_start", 0), tz=timezone.utc)
        current_period_end = datetime.fromtimestamp(obj.get("current_period_end", 0), tz=timezone.utc)
        
        # Reset hours at period start
        update_data = {
            "status": status,
            "current_period_start": current_period_start.isoformat(),
            "current_period_end": current_period_end.isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Check if it's a new billing period (reset hours)
        existing = await db.subscriptions.find_one({"stripe_subscription_id": subscription_id}, {"_id": 0})
        if existing:
            old_period_start = existing.get("current_period_start", "")
            if old_period_start != current_period_start.isoformat():
                update_data["hours_used"] = 0.0
                logger.info(f"Reset hours for subscription: {subscription_id}")
        
        await db.subscriptions.update_one(
            {"stripe_subscription_id": subscription_id},
            {"$set": update_data}
        )
        
    elif event_type == "customer.subscription.deleted":
        subscription_id = obj.get("id")
        await db.subscriptions.update_one(
            {"stripe_subscription_id": subscription_id},
            {"$set": {
                "status": "cancelled",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        logger.info(f"Subscription cancelled: {subscription_id}")
        
    elif event_type == "checkout.session.expired":
        session_id = obj.get("id")
        await db.payments.update_one(
            {"stripe_session_id": session_id},
            {"$set": {
                "status": "expired",
                "payment_status": "expired",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
    elif event_type == "charge.refunded":
        payment_intent_id = obj.get("payment_intent")
        await db.payments.update_one(
            {"stripe_payment_intent_id": payment_intent_id},
            {"$set": {
                "status": "refunded",
                "payment_status": "refunded",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
    
    # Mark webhook as processed
    await db.stripe_webhook_events.update_one(
        {"event_id": event.get("id")},
        {"$set": {"processed": True}}
    )
    
    return {"status": "ok"}

# ==================== CUSTOMER PORTAL ENDPOINTS ====================

@api_router.get("/customer/subscriptions")
async def get_customer_subscriptions(email: str):
    """Get all subscriptions for a customer by email"""
    subscriptions = await db.subscriptions.find(
        {"customer_email": email, "status": {"$in": ["active", "past_due", "trialing"]}},
        {"_id": 0}
    ).to_list(100)
    
    return {"subscriptions": subscriptions}

@api_router.get("/customer/subscription/{subscription_id}")
async def get_subscription_details(subscription_id: str):
    """Get detailed subscription info including hours used/available"""
    sub = await db.subscriptions.find_one(
        {"$or": [{"id": subscription_id}, {"stripe_subscription_id": subscription_id}]},
        {"_id": 0}
    )
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subscricao nao encontrada")
    
    # Get interventions for this subscription
    interventions = await db.interventions.find(
        {"subscription_id": sub.get("id")},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    hours_included = sub.get("hours_included", 0)
    hours_used = sub.get("hours_used", 0)
    hours_available = max(0, hours_included - hours_used)
    
    return {
        "subscription": sub,
        "hours": {
            "included": hours_included,
            "used": hours_used,
            "available": hours_available
        },
        "interventions": interventions
    }

@api_router.post("/customer/portal-session")
async def create_portal_session(email: str, return_url: str):
    """Create Stripe Customer Portal session for managing subscription"""
    try:
        # Find customer in our DB
        sub = await db.subscriptions.find_one(
            {"customer_email": email, "status": "active"},
            {"_id": 0}
        )
        
        if not sub or not sub.get("stripe_customer_id"):
            raise HTTPException(status_code=404, detail="Nenhuma subscricao ativa encontrada")
        
        # Create portal session
        session = stripe.billing_portal.Session.create(
            customer=sub["stripe_customer_id"],
            return_url=return_url
        )
        
        return {"url": session.url}
    
    except stripe.error.StripeError as e:
        logger.error(f"Stripe portal error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

@api_router.post("/customer/intervention")
async def request_intervention(request: InterventionRequest):
    """Create a new intervention request"""
    
    # Find subscription
    sub = await db.subscriptions.find_one(
        {"$or": [{"id": request.subscription_id}, {"stripe_subscription_id": request.subscription_id}]},
        {"_id": 0}
    )
    
    if not sub:
        raise HTTPException(status_code=404, detail="Subscricao nao encontrada")
    
    if sub.get("status") != "active":
        raise HTTPException(status_code=400, detail="Subscricao nao esta ativa")
    
    # Check available hours
    hours_available = sub.get("hours_included", 0) - sub.get("hours_used", 0)
    if hours_available <= 0:
        raise HTTPException(status_code=400, detail="Sem horas disponiveis. Contacte-nos para horas adicionais.")
    
    # Create intervention record
    intervention = InterventionRecord(
        subscription_id=sub.get("id"),
        customer_email=request.customer_email,
        customer_name=sub.get("customer_name", ""),
        description=request.description,
        urgency=request.urgency,
        preferred_date=request.preferred_date,
        preferred_time=request.preferred_time,
        address=request.address
    )
    
    doc = intervention.model_dump()
    doc["created_at"] = doc["created_at"].isoformat()
    doc["updated_at"] = doc["updated_at"].isoformat()
    
    await db.interventions.insert_one(doc)
    
    # Send admin notification
    await send_admin_notification("intervention", sub.get("customer_name", "Cliente"), request.customer_email, {
        "plan_name": sub.get("plan_name", ""),
        "urgency": request.urgency,
        "preferred_date": request.preferred_date,
        "preferred_time": request.preferred_time,
        "address": request.address,
        "description": request.description
    })
    
    logger.info(f"Intervention request created: {intervention.id}")
    
    return {
        "success": True,
        "intervention_id": intervention.id,
        "message": "Pedido de intervencao criado com sucesso. Entraremos em contacto brevemente."
    }

@api_router.get("/customer/interventions")
async def get_customer_interventions(email: str):
    """Get all interventions for a customer"""
    interventions = await db.interventions.find(
        {"customer_email": email},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"interventions": interventions}

@api_router.get("/customer/payments")
async def get_customer_payments(email: str):
    """Get payment history for a customer"""
    # Get one-time payments
    payments = await db.payments.find(
        {"customer_email": email, "payment_status": "paid"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    return {"payments": payments}

# Admin endpoint to update intervention hours
@api_router.post("/admin/intervention/{intervention_id}/complete")
async def complete_intervention(intervention_id: str, hours_used: float):
    """Mark intervention as completed and update hours used"""
    
    intervention = await db.interventions.find_one({"id": intervention_id}, {"_id": 0})
    if not intervention:
        raise HTTPException(status_code=404, detail="Intervencao nao encontrada")
    
    # Update intervention
    await db.interventions.update_one(
        {"id": intervention_id},
        {"$set": {
            "status": "completed",
            "hours_used": hours_used,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Update subscription hours
    await db.subscriptions.update_one(
        {"id": intervention.get("subscription_id")},
        {"$inc": {"hours_used": hours_used}}
    )
    
    return {"success": True, "message": f"Intervencao concluida com {hours_used} horas utilizadas"}

@api_router.get("/checkout/payment-methods")
async def get_payment_methods():
    """Get available payment methods"""
    return {
        "methods": [
            {
                "code": "card",
                "name": "Cartao de Credito/Debito",
                "description": "Visa, Mastercard, American Express",
                "icon": "credit-card"
            },
            {
                "code": "transfer",
                "name": "Transferencia Bancaria",
                "description": "IBAN / Transferencia directa",
                "icon": "bank"
            },
            {
                "code": "whatsapp",
                "name": "Pagar via WhatsApp",
                "description": "Combinar pagamento directamente",
                "icon": "message"
            }
        ]
    }

@api_router.get("/payments/{payment_id}")
async def get_payment_details(payment_id: str):
    """Get payment details by ID"""
    
    payment = await db.payments.find_one({"id": payment_id}, {"_id": 0})
    
    if not payment:
        # Try to find by stripe_session_id
        payment = await db.payments.find_one({"stripe_session_id": payment_id}, {"_id": 0})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return payment

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

# ============================================
# Google Calendar Integration
# ============================================

def get_google_flow():
    """Create Google OAuth flow"""
    return Flow.from_client_config(
        {
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=GOOGLE_SCOPES,
        redirect_uri=GOOGLE_REDIRECT_URI
    )

@api_router.get("/oauth/calendar/login")
async def google_calendar_login():
    """Start Google Calendar OAuth flow"""
    try:
        # Build authorization URL manually without PKCE
        params = {
            'client_id': GOOGLE_CLIENT_ID,
            'redirect_uri': GOOGLE_REDIRECT_URI,
            'scope': 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email',
            'response_type': 'code',
            'access_type': 'offline',
            'prompt': 'consent'
        }
        
        import urllib.parse
        authorization_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        
        return {"authorization_url": authorization_url}
    except Exception as e:
        logger.error(f"Google OAuth login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/oauth/calendar/callback")
async def google_calendar_callback(code: str, state: str = None):
    """Handle Google Calendar OAuth callback"""
    try:
        # Exchange code for tokens using direct request (avoids scope mismatch issues)
        async with httpx.AsyncClient() as client_http:
            token_response = await client_http.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': code,
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_CLIENT_SECRET,
                    'redirect_uri': GOOGLE_REDIRECT_URI,
                    'grant_type': 'authorization_code'
                }
            )
            tokens = token_response.json()
        
        if 'error' in tokens:
            raise HTTPException(status_code=400, detail=tokens.get('error_description', 'Token exchange failed'))
        
        # Get user info
        async with httpx.AsyncClient() as client_http:
            user_response = await client_http.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {tokens["access_token"]}'}
            )
            user_info = user_response.json()
        
        # Store tokens in database
        await db.google_calendar_tokens.update_one(
            {"user_id": "admin"},  # Single admin user
            {
                "$set": {
                    "tokens": tokens,
                    "email": user_info.get('email'),
                    "updated_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        
        logger.info(f"Google Calendar connected for {user_info.get('email')}")
        
        # Redirect to success page
        return RedirectResponse(url=f"https://obelisco-payments.preview.emergentagent.com?calendar_connected=true")
        
    except Exception as e:
        logger.error(f"Google OAuth callback error: {str(e)}")
        return RedirectResponse(url=f"https://obelisco-payments.preview.emergentagent.com?calendar_error={str(e)}")

class OAuthCodeRequest(BaseModel):
    code: str
    state: str = None

@api_router.post("/oauth/calendar/process-code")
async def process_oauth_code(request: OAuthCodeRequest):
    """Process OAuth code from frontend"""
    try:
        # Exchange code for tokens
        async with httpx.AsyncClient() as client_http:
            token_response = await client_http.post(
                'https://oauth2.googleapis.com/token',
                data={
                    'code': request.code,
                    'client_id': GOOGLE_CLIENT_ID,
                    'client_secret': GOOGLE_CLIENT_SECRET,
                    'redirect_uri': GOOGLE_REDIRECT_URI,
                    'grant_type': 'authorization_code'
                }
            )
            tokens = token_response.json()
        
        if 'error' in tokens:
            return {"success": False, "error": tokens.get('error_description', 'Token exchange failed')}
        
        # Get user info
        async with httpx.AsyncClient() as client_http:
            user_response = await client_http.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {tokens["access_token"]}'}
            )
            user_info = user_response.json()
        
        # Store tokens in database
        await db.google_calendar_tokens.update_one(
            {"user_id": "admin"},
            {
                "$set": {
                    "tokens": tokens,
                    "email": user_info.get('email'),
                    "updated_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )
        
        logger.info(f"Google Calendar connected for {user_info.get('email')}")
        return {"success": True, "email": user_info.get('email')}
        
    except Exception as e:
        logger.error(f"OAuth code processing error: {str(e)}")
        return {"success": False, "error": str(e)}

async def get_calendar_credentials():
    """Get and refresh Google Calendar credentials"""
    token_doc = await db.google_calendar_tokens.find_one({"user_id": "admin"})
    
    if not token_doc or 'tokens' not in token_doc:
        return None
    
    tokens = token_doc['tokens']
    
    creds = Credentials(
        token=tokens.get('access_token'),
        refresh_token=tokens.get('refresh_token'),
        token_uri='https://oauth2.googleapis.com/token',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET
    )
    
    # Refresh if expired
    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())
        # Update stored tokens
        await db.google_calendar_tokens.update_one(
            {"user_id": "admin"},
            {"$set": {"tokens.access_token": creds.token}}
        )
    
    return creds

@api_router.get("/calendar/status")
async def get_calendar_status():
    """Check if Google Calendar is connected"""
    token_doc = await db.google_calendar_tokens.find_one({"user_id": "admin"})
    
    if token_doc and 'tokens' in token_doc:
        return {
            "connected": True,
            "email": token_doc.get('email'),
            "updated_at": token_doc.get('updated_at')
        }
    
    return {"connected": False}

@api_router.get("/calendar/availability")
async def check_calendar_availability(date: str, time: str):
    """Check if a specific date/time slot is available"""
    try:
        creds = await get_calendar_credentials()
        
        if not creds:
            # If calendar not connected, assume available
            return {"available": True, "reason": "Calendar not connected"}
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Parse date and time
        slot_start = datetime.fromisoformat(f"{date}T{time}:00")
        slot_end = slot_start + timedelta(hours=2)  # Assume 2-hour service
        
        # Set timezone to Lisbon
        time_min = slot_start.isoformat() + '+00:00'
        time_max = slot_end.isoformat() + '+00:00'
        
        # Check for existing events
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        if events:
            return {
                "available": False,
                "reason": "Já existe um agendamento para este horário",
                "existing_event": events[0].get('summary', 'Evento')
            }
        
        return {"available": True}
        
    except Exception as e:
        logger.error(f"Calendar availability check error: {str(e)}")
        # If error, assume available to not block bookings
        return {"available": True, "error": str(e)}

class CalendarEventRequest(BaseModel):
    title: str
    date: str
    time: str
    duration_hours: int = 2
    description: str = ""
    customer_name: str = ""
    customer_phone: str = ""
    customer_address: str = ""

@api_router.post("/calendar/create-event")
async def create_calendar_event(event_data: CalendarEventRequest):
    """Create a new calendar event for a booking"""
    try:
        creds = await get_calendar_credentials()
        
        if not creds:
            return {"success": False, "reason": "Calendar not connected"}
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Parse date and time
        event_start = datetime.fromisoformat(f"{event_data.date}T{event_data.time}:00")
        event_end = event_start + timedelta(hours=event_data.duration_hours)
        
        # Create event description
        full_description = f"""Cliente: {event_data.customer_name}
Telefone: {event_data.customer_phone}
Morada: {event_data.customer_address}

{event_data.description}"""
        
        event = {
            'summary': f"🔧 {event_data.title} - {event_data.customer_name}",
            'description': full_description,
            'start': {
                'dateTime': event_start.isoformat(),
                'timeZone': 'Europe/Lisbon',
            },
            'end': {
                'dateTime': event_end.isoformat(),
                'timeZone': 'Europe/Lisbon',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 60},
                    {'method': 'popup', 'minutes': 30},
                ],
            },
        }
        
        created_event = service.events().insert(calendarId='primary', body=event).execute()
        
        logger.info(f"Calendar event created: {created_event.get('id')}")
        
        return {
            "success": True,
            "event_id": created_event.get('id'),
            "event_link": created_event.get('htmlLink')
        }
        
    except Exception as e:
        logger.error(f"Calendar event creation error: {str(e)}")
        return {"success": False, "error": str(e)}

@api_router.get("/calendar/booked-slots")
async def get_booked_slots(start_date: str, end_date: str):
    """Get all booked time slots in a date range"""
    try:
        creds = await get_calendar_credentials()
        
        if not creds:
            return {"slots": [], "connected": False}
        
        service = build('calendar', 'v3', credentials=creds)
        
        time_min = f"{start_date}T00:00:00+00:00"
        time_max = f"{end_date}T23:59:59+00:00"
        
        events_result = service.events().list(
            calendarId='primary',
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        booked_slots = []
        for event in events:
            start = event.get('start', {})
            end = event.get('end', {})
            
            if 'dateTime' in start:
                booked_slots.append({
                    "date": start['dateTime'][:10],
                    "start_time": start['dateTime'][11:16],
                    "end_time": end.get('dateTime', '')[11:16] if 'dateTime' in end else None,
                    "title": event.get('summary', 'Ocupado')
                })
        
        return {"slots": booked_slots, "connected": True}
        
    except Exception as e:
        logger.error(f"Get booked slots error: {str(e)}")
        return {"slots": [], "error": str(e)}

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
