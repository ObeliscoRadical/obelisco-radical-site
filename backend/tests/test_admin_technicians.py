"""
Tests for Admin technician management (JSON body fix)
- Admin login
- Create technician via JSON body
- List technicians (should include new one, exclude test_tech accounts)
- New technician can login
"""
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://obelisco-carousel.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@obelisco.pt"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="module")
def admin_token():
    r = requests.post(f"{API}/connect/login/staff", json={
        "email": ADMIN_EMAIL, "password": ADMIN_PASSWORD
    }, timeout=15)
    assert r.status_code == 200, f"Admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data.get("success") is True
    assert data["user"]["role"] == "ADMIN"
    assert data.get("token")
    return data["token"]


@pytest.fixture(scope="module")
def new_tech():
    suffix = uuid.uuid4().hex[:8]
    return {
        "name": f"Tecnico QA {suffix}",
        "email": f"qa_tech_{suffix}@obelisco.pt",
        "password": "qatech123",
        "phone": "+351900000000",
        "specialties": ["eletricidade"]
    }


class TestAdminTechniciansFlow:
    def test_admin_login(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 0

    def test_create_technician_json_body(self, admin_token, new_tech):
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{API}/connect/admin/technicians", json=new_tech, headers=headers, timeout=15)
        assert r.status_code == 200, f"Create failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("success") is True
        assert data.get("technician_id")

    def test_list_technicians_contains_new(self, admin_token, new_tech):
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/connect/admin/technicians", headers=headers, timeout=15)
        assert r.status_code == 200, r.text
        techs = r.json().get("technicians", [])
        emails = [t.get("email") for t in techs]
        assert new_tech["email"].lower() in emails, f"New tech not listed. Got: {emails}"

    def test_no_test_data_present(self, admin_token):
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.get(f"{API}/connect/admin/technicians", headers=headers, timeout=15)
        assert r.status_code == 200
        techs = r.json().get("technicians", [])
        offenders = [
            t for t in techs
            if "test_tech" in (t.get("email") or "").lower()
            or "TEST" in (t.get("name") or "")
        ]
        assert offenders == [], f"Found leftover test data: {offenders}"

    def test_new_technician_can_login(self, new_tech):
        # small delay to be safe
        time.sleep(0.5)
        r = requests.post(f"{API}/connect/login/staff", json={
            "email": new_tech["email"], "password": new_tech["password"]
        }, timeout=15)
        assert r.status_code == 200, f"Tech login failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("success") is True
        assert data["user"]["role"] == "TECHNICIAN"
        assert data["user"]["email"] == new_tech["email"].lower()

    def test_duplicate_email_rejected(self, admin_token, new_tech):
        headers = {"Authorization": f"Bearer {admin_token}"}
        r = requests.post(f"{API}/connect/admin/technicians", json=new_tech, headers=headers, timeout=15)
        assert r.status_code == 400
        assert "existe" in r.text.lower() or "exist" in r.text.lower()

    def test_create_technician_requires_admin(self, new_tech):
        # No auth header
        r = requests.post(f"{API}/connect/admin/technicians", json={
            "name": "X", "email": f"x_{uuid.uuid4().hex[:6]}@x.com", "password": "abc"
        }, timeout=15)
        assert r.status_code in (401, 403)
