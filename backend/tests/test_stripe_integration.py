"""
Backend API tests for Stripe payment integration
Tests: Stripe config, checkout session creation, session status
"""
import pytest
import requests
import uuid
from datetime import datetime

BASE_URL = "https://obelisco-carousel.preview.emergentagent.com"


class TestStripeConfig:
    """Test Stripe configuration endpoint"""
    
    def test_get_stripe_config_returns_publishable_key(self):
        """GET /api/stripe/config should return publishable key"""
        response = requests.get(f"{BASE_URL}/api/stripe/config")
        
        assert response.status_code == 200
        data = response.json()
        assert "publishable_key" in data
        assert data["publishable_key"].startswith("pk_test_")
    
    def test_stripe_config_key_format(self):
        """Publishable key should be in correct format"""
        response = requests.get(f"{BASE_URL}/api/stripe/config")
        data = response.json()
        
        # Stripe test keys start with pk_test_
        key = data["publishable_key"]
        assert key.startswith("pk_test_")
        assert len(key) > 20  # Keys are typically long


class TestPaymentMethods:
    """Test payment methods endpoint - Note: Backend still returns all methods for backwards compatibility"""
    
    def test_get_payment_methods_returns_options(self):
        """GET /api/checkout/payment-methods should return payment methods"""
        response = requests.get(f"{BASE_URL}/api/checkout/payment-methods")
        
        assert response.status_code == 200
        data = response.json()
        assert "methods" in data
        
        methods = data["methods"]
        # Backend returns all methods, frontend filters to show only card
        assert len(methods) >= 1
        
        method_codes = [m["code"] for m in methods]
        assert "card" in method_codes  # Card must always be present
    
    def test_card_payment_method_details(self):
        """Card payment method should have correct details"""
        response = requests.get(f"{BASE_URL}/api/checkout/payment-methods")
        data = response.json()
        
        card_method = next((m for m in data["methods"] if m["code"] == "card"), None)
        assert card_method is not None
        assert "Cartao" in card_method["name"] or "Credito" in card_method["name"]
        assert "Visa" in card_method["description"] or "Mastercard" in card_method["description"]


class TestSubscriptionPlans:
    """Test subscription plans endpoint with monthly and annual pricing"""
    
    def test_get_subscription_plans_returns_three_plans(self):
        """GET /api/stripe/plans should return 3 subscription plans"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        
        assert response.status_code == 200
        data = response.json()
        assert "plans" in data
        
        plans = data["plans"]
        assert len(plans) == 3
        
        plan_ids = [p["id"] for p in plans]
        assert "essencial" in plan_ids
        assert "preventivo" in plan_ids
        assert "total" in plan_ids
    
    def test_essencial_plan_details_monthly(self):
        """Essencial plan should have correct monthly price and features"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        data = response.json()
        
        essencial = next((p for p in data["plans"] if p["id"] == "essencial"), None)
        assert essencial is not None
        assert essencial["pricing"]["monthly"]["price"] == 349
        assert essencial["pricing"]["monthly"]["lookup_key"] == "essencial_monthly"
        assert essencial["currency"] == "EUR"
        assert "features" in essencial
        assert len(essencial["features"]) > 0
        assert essencial["hours_included"] == 3
    
    def test_essencial_plan_details_annual(self):
        """Essencial plan should have correct annual price with 2 months discount"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        data = response.json()
        
        essencial = next((p for p in data["plans"] if p["id"] == "essencial"), None)
        assert essencial is not None
        assert essencial["pricing"]["annual"]["price"] == 3490  # 349 * 10 months
        assert essencial["pricing"]["annual"]["lookup_key"] == "essencial_annual"
        assert essencial["pricing"]["annual"]["savings"] == 698  # 2 months savings
    
    def test_preventivo_plan_details_monthly(self):
        """Preventivo plan should have correct monthly price and features"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        data = response.json()
        
        preventivo = next((p for p in data["plans"] if p["id"] == "preventivo"), None)
        assert preventivo is not None
        assert preventivo["pricing"]["monthly"]["price"] == 699
        assert preventivo["pricing"]["monthly"]["lookup_key"] == "preventivo_monthly"
        assert preventivo["currency"] == "EUR"
        assert preventivo["hours_included"] == 6
    
    def test_preventivo_plan_details_annual(self):
        """Preventivo plan should have correct annual price with 2 months discount"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        data = response.json()
        
        preventivo = next((p for p in data["plans"] if p["id"] == "preventivo"), None)
        assert preventivo is not None
        assert preventivo["pricing"]["annual"]["price"] == 6990  # 699 * 10 months
        assert preventivo["pricing"]["annual"]["lookup_key"] == "preventivo_annual"
        assert preventivo["pricing"]["annual"]["savings"] == 1398  # 2 months savings
    
    def test_total_plan_details_monthly(self):
        """Total plan should have correct monthly price and be marked as popular"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        data = response.json()
        
        total = next((p for p in data["plans"] if p["id"] == "total"), None)
        assert total is not None
        assert total["pricing"]["monthly"]["price"] == 1290
        assert total["pricing"]["monthly"]["lookup_key"] == "total_monthly"
        assert total["currency"] == "EUR"
        assert total.get("popular") is True
        assert total["hours_included"] == 12
    
    def test_total_plan_details_annual(self):
        """Total plan should have correct annual price with 2 months discount"""
        response = requests.get(f"{BASE_URL}/api/stripe/plans")
        data = response.json()
        
        total = next((p for p in data["plans"] if p["id"] == "total"), None)
        assert total is not None
        assert total["pricing"]["annual"]["price"] == 12900  # 1290 * 10 months
        assert total["pricing"]["annual"]["lookup_key"] == "total_annual"
        assert total["pricing"]["annual"]["savings"] == 2580  # 2 months savings


class TestSubscriptionSession:
    """Test subscription session creation"""
    
    def test_create_subscription_session_essencial(self):
        """POST /api/stripe/create-subscription-session should create session for essencial plan"""
        payload = {
            "lookup_key": "essencial_monthly",
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "customer_phone": "911111111",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "session_id" in data
        assert data["session_id"].startswith("cs_test_")
        assert "checkout_url" in data
        assert "checkout.stripe.com" in data["checkout_url"]
        assert data["plan"] == "essencial_monthly"
        assert data["amount"] == 349
        assert data["currency"] == "EUR"
    
    def test_create_subscription_session_preventivo(self):
        """Subscription session for preventivo plan"""
        payload = {
            "lookup_key": "preventivo_monthly",
            "customer_email": "test2@example.com",
            "customer_name": "Test User 2",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["plan"] == "preventivo_monthly"
        assert data["amount"] == 699
    
    def test_create_subscription_session_total(self):
        """Subscription session for total plan"""
        payload = {
            "lookup_key": "total_monthly",
            "customer_email": "test3@example.com",
            "customer_name": "Test User 3",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["plan"] == "total_monthly"
        assert data["amount"] == 1290
    
    def test_create_subscription_session_invalid_plan(self):
        """Subscription session should fail for invalid plan"""
        payload = {
            "lookup_key": "invalid_plan",
            "customer_email": "test@example.com",
            "customer_name": "Test User",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        # Should return 404 for invalid plan
        assert response.status_code == 404
    
    def test_create_subscription_session_essencial_annual(self):
        """Subscription session for essencial annual plan"""
        payload = {
            "lookup_key": "essencial_annual",
            "customer_email": "test_annual@example.com",
            "customer_name": "Test Annual User",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["plan"] == "essencial_annual"
        assert data["amount"] == 3490  # Annual price with 2 months discount
    
    def test_create_subscription_session_preventivo_annual(self):
        """Subscription session for preventivo annual plan"""
        payload = {
            "lookup_key": "preventivo_annual",
            "customer_email": "test_annual2@example.com",
            "customer_name": "Test Annual User 2",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["plan"] == "preventivo_annual"
        assert data["amount"] == 6990  # Annual price with 2 months discount
    
    def test_create_subscription_session_total_annual(self):
        """Subscription session for total annual plan"""
        payload = {
            "lookup_key": "total_annual",
            "customer_email": "test_annual3@example.com",
            "customer_name": "Test Annual User 3",
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-subscription-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["plan"] == "total_annual"
        assert data["amount"] == 12900  # Annual price with 2 months discount


class TestCustomerPortal:
    """Test customer portal endpoints"""
    
    def test_get_customer_subscriptions(self):
        """GET /api/customer/subscriptions should return customer subscriptions"""
        response = requests.get(f"{BASE_URL}/api/customer/subscriptions?email=test@example.com")
        
        assert response.status_code == 200
        data = response.json()
        assert "subscriptions" in data
        assert isinstance(data["subscriptions"], list)
    
    def test_get_customer_interventions(self):
        """GET /api/customer/interventions should return customer interventions"""
        response = requests.get(f"{BASE_URL}/api/customer/interventions?email=test@example.com")
        
        assert response.status_code == 200
        data = response.json()
        assert "interventions" in data
        assert isinstance(data["interventions"], list)
    
    def test_create_portal_session_no_subscription(self):
        """POST /api/customer/portal-session should fail without active subscription"""
        response = requests.post(
            f"{BASE_URL}/api/customer/portal-session?email=nonexistent@example.com&return_url=https://obelisco-carousel.preview.emergentagent.com"
        )
        
        # Should return 404 when no active subscription found
        assert response.status_code == 404
        data = response.json()
        assert "Nenhuma subscricao ativa encontrada" in data.get("detail", "")
    
    def test_get_customer_payments(self):
        """GET /api/customer/payments should return customer payment history"""
        response = requests.get(f"{BASE_URL}/api/customer/payments?email=test@example.com")
        
        assert response.status_code == 200
        data = response.json()
        assert "payments" in data
        assert isinstance(data["payments"], list)


class TestStripeCheckoutSession:
    """Test Stripe checkout session creation"""
    
    def test_create_checkout_session_success(self):
        """POST /api/stripe/create-checkout-session should create session"""
        payload = {
            "amount": 100.00,
            "currency": "EUR",
            "items": [
                {"description": "Test Service", "quantity": 1, "value": 100.00}
            ],
            "customer": {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "911111111"
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "session_id" in data
        assert data["session_id"].startswith("cs_test_")
        assert "checkout_url" in data
        assert "checkout.stripe.com" in data["checkout_url"]
        assert "payment_id" in data
        assert "order_id" in data
    
    def test_create_checkout_session_with_multiple_items(self):
        """Checkout session should handle multiple items"""
        payload = {
            "amount": 250.00,
            "currency": "EUR",
            "items": [
                {"description": "Instalacao Eletrica", "quantity": 2, "value": 90.00},
                {"description": "Iluminacao LED", "quantity": 4, "value": 100.00},
                {"description": "Taxa de deslocacao", "quantity": 1, "value": 35.00}
            ],
            "customer": {
                "name": "Maria Silva",
                "email": "maria@example.com",
                "phone": "912345678"
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "session_id" in data
    
    def test_create_checkout_session_with_custom_order_id(self):
        """Checkout session should accept custom order_id"""
        custom_order_id = f"TEST-ORDER-{uuid.uuid4().hex[:8]}"
        
        payload = {
            "amount": 50.00,
            "currency": "EUR",
            "items": [
                {"description": "Test Service", "quantity": 1, "value": 50.00}
            ],
            "customer": {
                "name": "Test User",
                "email": "test@example.com"
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com",
            "order_id": custom_order_id
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["order_id"] == custom_order_id
    
    def test_create_checkout_session_with_metadata(self):
        """Checkout session should accept metadata"""
        payload = {
            "amount": 75.00,
            "currency": "EUR",
            "items": [
                {"description": "Reparacao", "quantity": 1, "value": 75.00}
            ],
            "customer": {
                "name": "Joao Santos",
                "email": "joao@example.com",
                "phone": "913456789"
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com",
            "metadata": {
                "address": "Rua Test 123",
                "date": "2026-04-01",
                "time": "10:00"
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_create_checkout_session_missing_required_fields(self):
        """Checkout session should fail with missing required fields"""
        # Missing customer email
        payload = {
            "amount": 100.00,
            "currency": "EUR",
            "items": [
                {"description": "Test", "quantity": 1, "value": 100.00}
            ],
            "customer": {
                "name": "Test User"
                # Missing email
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        # Should fail validation
        assert response.status_code in [400, 422]


class TestStripeSessionStatus:
    """Test Stripe session status endpoint"""
    
    def test_get_session_status_valid_session(self):
        """GET /api/stripe/session/{session_id} should return status for valid session"""
        # First create a session
        payload = {
            "amount": 100.00,
            "currency": "EUR",
            "items": [
                {"description": "Test Service", "quantity": 1, "value": 100.00}
            ],
            "customer": {
                "name": "Test User",
                "email": "test@example.com"
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        assert create_response.status_code == 200
        session_id = create_response.json()["session_id"]
        
        # Now check the status
        status_response = requests.get(f"{BASE_URL}/api/stripe/session/{session_id}")
        
        assert status_response.status_code == 200
        data = status_response.json()
        
        assert "session_id" in data
        assert data["session_id"] == session_id
        assert "status" in data
        assert "payment_status" in data
        assert data["payment_status"] in ["pending", "unpaid", "paid"]
        assert "amount" in data
        assert "currency" in data
    
    def test_get_session_status_invalid_session(self):
        """GET /api/stripe/session/{session_id} should return 404 for invalid session"""
        fake_session_id = "cs_test_invalid_session_id_12345"
        
        response = requests.get(f"{BASE_URL}/api/stripe/session/{fake_session_id}")
        
        # Should return 404 or 500 (depending on Stripe error handling)
        assert response.status_code in [404, 500]


class TestPaymentsEndpoints:
    """Test payments listing and details endpoints"""
    
    def test_list_payments(self):
        """GET /api/payments should return list of payments"""
        response = requests.get(f"{BASE_URL}/api/payments")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "payments" in data
        assert "count" in data
        assert isinstance(data["payments"], list)
    
    def test_get_payment_details_by_id(self):
        """GET /api/payments/{payment_id} should return payment details"""
        # First create a checkout session to have a payment record
        payload = {
            "amount": 100.00,
            "currency": "EUR",
            "items": [
                {"description": "Test Service", "quantity": 1, "value": 100.00}
            ],
            "customer": {
                "name": "Test User",
                "email": "test@example.com"
            },
            "origin_url": "https://obelisco-carousel.preview.emergentagent.com"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/stripe/create-checkout-session",
            json=payload
        )
        
        assert create_response.status_code == 200
        payment_id = create_response.json()["payment_id"]
        
        # Get payment details
        response = requests.get(f"{BASE_URL}/api/payments/{payment_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["id"] == payment_id
        assert "customer_name" in data
        assert "customer_email" in data
        assert "amount" in data
        assert "status" in data
    
    def test_get_payment_details_invalid_id(self):
        """GET /api/payments/{payment_id} should return 404 for invalid ID"""
        fake_id = "invalid-payment-id-12345"
        
        response = requests.get(f"{BASE_URL}/api/payments/{fake_id}")
        
        assert response.status_code == 404


class TestAPIBasics:
    """Test basic API functionality"""
    
    def test_api_root(self):
        """GET /api/ should return hello world"""
        response = requests.get(f"{BASE_URL}/api/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
    
    def test_status_endpoint(self):
        """POST /api/status should create status check"""
        payload = {"client_name": f"TEST_Client_{uuid.uuid4().hex[:8]}"}
        
        response = requests.post(f"{BASE_URL}/api/status", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["client_name"] == payload["client_name"]
