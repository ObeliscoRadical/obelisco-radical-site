"""Tests for PUT /api/connect/admin/customers/{id} - edit manual customer (iteration 14)"""
import os
import time
import pytest
import requests
from datetime import datetime, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://obelisco-carousel.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@obelisco.pt"
ADMIN_PASSWORD = os.environ.get("ADMIN_STAFF_PASSWORD")

# Plan hours and pricing (must match backend PLAN_HOURS / PLAN_PRICING)
PLAN_HOURS = {"essencial": 3, "preventivo": 6, "total": 12}


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{API}/connect/login/staff", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.text}"
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def manual_sub(admin_headers):
    """Create a fresh manual_invoice subscription for edit tests."""
    unique = f"test_edit_{int(time.time())}@example.com"
    r = requests.post(f"{API}/connect/admin/customers", json={
        "name": "TEST Edit Client",
        "email": unique,
        "phone": "+351900000000",
        "plan_id": "essencial",
        "billing_cycle": "monthly",
    }, headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    return {"id": r.json()["subscription_id"], "email": unique}


def _get_sub(admin_headers, sub_id):
    r = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_headers, timeout=15)
    assert r.status_code == 200
    for s in r.json()["subscriptions"]:
        if s["id"] == sub_id:
            return s
    return None


class TestEditManualCustomer:
    def test_requires_admin(self, manual_sub):
        r = requests.put(f"{API}/connect/admin/customers/{manual_sub['id']}", json={"name": "x"}, timeout=10)
        assert r.status_code in (401, 403)

    def test_edit_empty_body_returns_400(self, admin_headers, manual_sub):
        r = requests.put(f"{API}/connect/admin/customers/{manual_sub['id']}", json={}, headers=admin_headers, timeout=10)
        assert r.status_code == 400
        assert "atualizar" in r.json().get("detail", "").lower()

    def test_edit_invalid_date_returns_400(self, admin_headers, manual_sub):
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"subscription_start_date": "not-a-date"},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 400
        assert "invalida" in r.json().get("detail", "").lower() or "invalid" in r.json().get("detail", "").lower()

    def test_edit_nonexistent_404(self, admin_headers):
        r = requests.put(f"{API}/connect/admin/customers/does-not-exist-xyz", json={"name": "n"}, headers=admin_headers, timeout=10)
        assert r.status_code == 404

    def test_edit_response_has_no_password_hash(self, admin_headers, manual_sub):
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"phone": "+351911111111"},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["success"] is True
        sub = body["subscription"]
        assert "password_hash" not in sub, "password_hash leaked in edit response"
        assert sub["customer_phone"] == "+351911111111"

    def test_edit_plan_and_billing_recomputes_hours_amount(self, admin_headers, manual_sub):
        # change to preventivo + annual
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"plan_id": "preventivo", "billing_cycle": "annual"},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 200, r.text
        sub = r.json()["subscription"]
        assert sub["plan_id"] == "preventivo"
        assert sub["billing_cycle"] == "annual"
        assert sub["hours_included"] == PLAN_HOURS["preventivo"]  # 6
        assert sub["amount"] > 0

        # change to total + monthly
        r2 = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"plan_id": "total", "billing_cycle": "monthly"},
            headers=admin_headers, timeout=10
        )
        assert r2.status_code == 200
        sub2 = r2.json()["subscription"]
        assert sub2["plan_id"] == "total"
        assert sub2["billing_cycle"] == "monthly"
        assert sub2["hours_included"] == PLAN_HOURS["total"]  # 12

    def test_backdate_start_date_recomputes_period_end_monthly(self, admin_headers, manual_sub):
        start = "2024-01-15"
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"subscription_start_date": start, "billing_cycle": "monthly"},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 200, r.text
        sub = r.json()["subscription"]
        # Iteration 14: period rolls forward to the CURRENT cycle anchored to day 15
        from datetime import datetime, timezone
        from dateutil.relativedelta import relativedelta
        ps = datetime.fromisoformat(sub["current_period_start"]); pe = datetime.fromisoformat(sub["current_period_end"])
        assert ps.day == 15 and pe == ps + relativedelta(months=1)
        assert ps <= datetime.now(timezone.utc) < pe

    def test_backdate_start_date_recomputes_period_end_annual(self, admin_headers, manual_sub):
        start = "2023-06-01"
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"subscription_start_date": start, "billing_cycle": "annual"},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 200, r.text
        sub = r.json()["subscription"]
        from datetime import datetime, timezone
        from dateutil.relativedelta import relativedelta
        ps = datetime.fromisoformat(sub["current_period_start"]); pe = datetime.fromisoformat(sub["current_period_end"])
        assert (ps.month, ps.day) == (6, 1) and pe == ps + relativedelta(years=1)
        assert ps <= datetime.now(timezone.utc) < pe

    def test_edit_duplicate_email_fails(self, admin_headers, manual_sub):
        # Create another active manual customer
        other_email = f"test_edit_other_{int(time.time())}@example.com"
        r_create = requests.post(f"{API}/connect/admin/customers", json={
            "name": "TEST Other", "email": other_email,
            "plan_id": "essencial", "billing_cycle": "monthly"
        }, headers=admin_headers, timeout=10)
        assert r_create.status_code == 200

        # Try to edit manual_sub email to that already-active email
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"email": other_email},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 400
        assert "ativa" in r.json().get("detail", "").lower()

    def test_edit_persists_in_db(self, admin_headers, manual_sub):
        new_phone = f"+35191{int(time.time()) % 10000000:07d}"
        r = requests.put(
            f"{API}/connect/admin/customers/{manual_sub['id']}",
            json={"phone": new_phone, "name": "TEST Persisted Name"},
            headers=admin_headers, timeout=10
        )
        assert r.status_code == 200
        # Fetch from admin list to verify persistence
        sub = _get_sub(admin_headers, manual_sub["id"])
        assert sub is not None
        assert sub["customer_phone"] == new_phone
        assert sub["customer_name"] == "TEST Persisted Name"


class TestEditStripeRejection:
    def test_edit_stripe_subscription_rejected(self, admin_headers):
        """Find a non-manual_invoice subscription and ensure edit is rejected 400."""
        r = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        subs = r.json()["subscriptions"]
        stripe_sub = next((s for s in subs if s.get("payment_method") != "manual_invoice"), None)
        if not stripe_sub:
            pytest.skip("No Stripe (non-manual_invoice) subscription in DB")

        r2 = requests.put(
            f"{API}/connect/admin/customers/{stripe_sub['id']}",
            json={"name": "Should Not Change"},
            headers=admin_headers, timeout=10
        )
        assert r2.status_code == 400
        detail = r2.json().get("detail", "").lower()
        assert "manual" in detail or "stripe" in detail
