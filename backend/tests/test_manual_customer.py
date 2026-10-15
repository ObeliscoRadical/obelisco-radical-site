"""Tests for manual customer creation + customer password management (iteration 13)"""
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://obelisco-carousel.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@obelisco.pt"
ADMIN_PASSWORD = "admin123"
LEGACY_CUSTOMER_EMAIL = "teste.obelisco@gmail.com"  # Known email-only legacy customer


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/connect/login/staff", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="module")
def created_client(admin_headers):
    """Create a unique manual customer for the whole module."""
    unique = f"test_manual_{int(time.time())}@example.com"
    payload = {
        "name": "TEST Manual Customer",
        "email": unique,
        "phone": "+351912345678",
        "plan_id": "preventivo",
        "billing_cycle": "monthly",
    }
    r = requests.post(f"{API}/connect/admin/customers", json=payload, headers=admin_headers, timeout=15)
    assert r.status_code == 200, f"Create failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["success"] is True
    assert data["customer_email"] == unique
    assert "initial_password" in data and len(data["initial_password"]) >= 8
    assert "subscription_id" in data
    yield {"email": unique, "password": data["initial_password"], "subscription_id": data["subscription_id"]}
    # Cleanup: direct DB delete via admin flag not available; leave as TEST_ prefixed.


class TestCreateManualCustomer:
    def test_create_requires_admin(self):
        r = requests.post(f"{API}/connect/admin/customers", json={
            "name": "X", "email": "x@x.com", "plan_id": "essencial", "billing_cycle": "monthly"
        }, timeout=10)
        assert r.status_code in (401, 403)

    def test_create_success(self, created_client):
        assert created_client["email"].startswith("test_manual_")
        assert created_client["password"]

    def test_duplicate_active_email_fails(self, admin_headers, created_client):
        payload = {
            "name": "Dup", "email": created_client["email"],
            "plan_id": "essencial", "billing_cycle": "monthly"
        }
        r = requests.post(f"{API}/connect/admin/customers", json=payload, headers=admin_headers, timeout=10)
        assert r.status_code == 400
        assert "ativa" in r.json().get("detail", "").lower() or "existe" in r.json().get("detail", "").lower()

    def test_admin_subscriptions_no_password_hash(self, admin_headers, created_client):
        r = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        subs = r.json()["subscriptions"]
        target = next((s for s in subs if s["customer_email"] == created_client["email"]), None)
        assert target is not None, "Created client missing from admin list"
        assert "password_hash" not in target, "password_hash leaked in admin subs"
        assert target["payment_method"] == "manual_invoice"
        assert target["hours_included"] == 6  # preventivo
        assert target["plan_id"] == "preventivo"


class TestCustomerLogin:
    def test_login_no_password_fails(self, created_client):
        r = requests.post(f"{API}/connect/login/customer", json={"email": created_client["email"]}, timeout=10)
        assert r.status_code == 401

    def test_login_wrong_password_fails(self, created_client):
        r = requests.post(f"{API}/connect/login/customer",
                          json={"email": created_client["email"], "password": "wrongpass123"}, timeout=10)
        assert r.status_code == 401
        assert "incorreta" in r.json().get("detail", "").lower()

    def test_login_correct_password_success(self, created_client):
        r = requests.post(f"{API}/connect/login/customer",
                          json={"email": created_client["email"], "password": created_client["password"]}, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "token" in data
        created_client["token"] = data["token"]

    def test_dashboard_no_password_hash_leak(self, created_client):
        headers = {"Authorization": f"Bearer {created_client['token']}"}
        r = requests.get(f"{API}/connect/customer/dashboard", headers=headers, timeout=10)
        assert r.status_code == 200
        body = r.json()
        # Walk the response, ensure no 'password_hash' field
        import json
        assert "password_hash" not in json.dumps(body)

    def test_legacy_customer_email_only_login_still_works(self):
        """Regression: legacy Stripe-paid customers (no password_hash) still login with email only"""
        r = requests.post(f"{API}/connect/login/customer", json={"email": LEGACY_CUSTOMER_EMAIL}, timeout=10)
        # Either success (if active sub exists) or 404 (no sub). Must NOT be 401.
        assert r.status_code in (200, 404), f"Legacy email-only login broken: {r.status_code} {r.text}"


class TestChangePassword:
    def test_change_password_wrong_current(self, created_client):
        headers = {"Authorization": f"Bearer {created_client['token']}"}
        r = requests.post(f"{API}/connect/customer/change-password",
                          json={"current_password": "wrong", "new_password": "newpass123"},
                          headers=headers, timeout=10)
        assert r.status_code == 401

    def test_change_password_too_short(self, created_client):
        headers = {"Authorization": f"Bearer {created_client['token']}"}
        r = requests.post(f"{API}/connect/customer/change-password",
                          json={"current_password": created_client["password"], "new_password": "abc"},
                          headers=headers, timeout=10)
        assert r.status_code == 400

    def test_change_password_success_and_old_fails(self, created_client):
        headers = {"Authorization": f"Bearer {created_client['token']}"}
        new_pw = "NewPass123!"
        r = requests.post(f"{API}/connect/customer/change-password",
                          json={"current_password": created_client["password"], "new_password": new_pw},
                          headers=headers, timeout=10)
        assert r.status_code == 200
        assert "sucesso" in r.json().get("message", "").lower()

        # Old password should fail
        old_login = requests.post(f"{API}/connect/login/customer",
                                   json={"email": created_client["email"], "password": created_client["password"]}, timeout=10)
        assert old_login.status_code == 401

        # New password should work
        new_login = requests.post(f"{API}/connect/login/customer",
                                   json={"email": created_client["email"], "password": new_pw}, timeout=10)
        assert new_login.status_code == 200


class TestPlanVariants:
    @pytest.mark.parametrize("plan,hours", [("essencial", 3), ("preventivo", 6), ("total", 12)])
    def test_plan_hours(self, admin_headers, plan, hours):
        unique = f"test_plan_{plan}_{int(time.time())}_{hours}@example.com"
        r = requests.post(f"{API}/connect/admin/customers", json={
            "name": f"TEST {plan}", "email": unique,
            "plan_id": plan, "billing_cycle": "annual"
        }, headers=admin_headers, timeout=10)
        assert r.status_code == 200
        sub_id = r.json()["subscription_id"]

        # Fetch admin list, confirm hours
        subs = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_headers, timeout=10).json()["subscriptions"]
        target = next((s for s in subs if s["id"] == sub_id), None)
        assert target is not None
        assert target["hours_included"] == hours
        assert target["billing_cycle"] == "annual"
