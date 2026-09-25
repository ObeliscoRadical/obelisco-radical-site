"""Tests for Stripe VAT / automatic tax (Portugal IVA 23%) integration."""
import os
import pytest
import requests
import stripe

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/") or "http://localhost:8001"
# Load stripe secret directly for session inspection
from dotenv import load_dotenv
load_dotenv("/app/backend/.env")
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


class TestStripePlansEndpoint:
    def test_plans_returns_vat_fields(self, client):
        r = client.get(f"{BASE_URL}/api/stripe/plans")
        assert r.status_code == 200
        data = r.json()
        assert "plans" in data
        assert data.get("vat_included") is False
        assert data.get("vat_rate") == 23
        assert len(data["plans"]) >= 3
        # sanity: plans have expected structure
        ids = {p["id"] for p in data["plans"]}
        assert {"essencial", "preventivo", "total"}.issubset(ids)


class TestStripeCheckoutSessionAutomaticTax:
    def test_create_checkout_session_has_automatic_tax_enabled(self, client):
        payload = {
            "amount": 100.0,
            "currency": "EUR",
            "customer": {
                "name": "TEST_VATUser",
                "email": "test_vat@example.com",
                "phone": "+351900000000",
            },
            "items": [
                {"description": "TEST_Service", "quantity": 1, "value": 100.0}
            ],
            "origin_url": "https://example.com",
        }
        r = client.post(f"{BASE_URL}/api/stripe/create-checkout-session", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert "checkout_url" in data
        assert "session_id" in data

        # Verify via Stripe API that automatic_tax is enabled
        if stripe.api_key:
            session = stripe.checkout.Session.retrieve(data["session_id"])
            assert session.automatic_tax.enabled is True
            assert session.billing_address_collection == "required"


class TestStripeSubscriptionAutomaticTax:
    def test_create_subscription_session_has_automatic_tax(self, client):
        payload = {
            "lookup_key": "essencial_monthly",
            "customer_email": "test_vat_sub@example.com",
            "customer_name": "TEST_VATSubUser",
            "customer_phone": "+351900000000",
            "origin_url": "https://example.com",
        }
        r = client.post(f"{BASE_URL}/api/stripe/create-subscription-session", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["success"] is True
        assert data["plan"] == "essencial_monthly"
        assert "checkout_url" in data

        if stripe.api_key:
            session = stripe.checkout.Session.retrieve(data["session_id"])
            assert session.automatic_tax.enabled is True
            assert session.mode == "subscription"
            assert session.billing_address_collection == "required"

    def test_invalid_lookup_key_returns_404(self, client):
        payload = {
            "lookup_key": "nonexistent_plan_xyz",
            "customer_email": "test@example.com",
            "customer_name": "TEST_User",
            "origin_url": "https://example.com",
        }
        r = client.post(f"{BASE_URL}/api/stripe/create-subscription-session", json=payload)
        assert r.status_code == 404


class TestSiteInboundRegression:
    def test_site_inbound_endpoint_still_exists(self, client):
        # Regression: endpoint present. Bad payload -> 422 (schema still enforced),
        # missing auth -> 401/403. Anything other than 404/5xx indicates health.
        r = client.post(f"{BASE_URL}/api/public/site/inbound", json={})
        assert r.status_code not in (404, 500, 502, 503), f"Got {r.status_code}: {r.text}"
