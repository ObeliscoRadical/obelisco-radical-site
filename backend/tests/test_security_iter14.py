"""Iteration 14: Security audit fixes - admin password rotation, locked-down admin endpoints,
password_hash leak in /connect/me, staff self-service change-password, invoices auth/isolation."""
import os
import time
import json

import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = os.environ.get("ADMIN_STAFF_EMAIL")
ADMIN_PASSWORD = os.environ.get("ADMIN_STAFF_PASSWORD")
TECH = {"email": "tecnico@obelisco.pt", "password": "tech123"}

mongo = MongoClient(os.environ.get("MONGO_URL"))
db = mongo[os.environ.get("DB_NAME")]


def _staff_login(email, pw):
    return requests.post(f"{API}/connect/login/staff", json={"email": email, "password": pw}, timeout=15)


@pytest.fixture(scope="module")
def admin_h():
    r = _staff_login(ADMIN_EMAIL, ADMIN_PASSWORD)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


@pytest.fixture(scope="module")
def manual_cust(admin_h):
    email = f"test_sec_{int(time.time()*1000)}@example.com"
    r = requests.post(f"{API}/connect/admin/customers", json={
        "name": "TEST Sec", "email": email, "plan_id": "preventivo", "billing_cycle": "monthly"},
        headers=admin_h, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    c = {"email": email, "password": d["initial_password"], "id": d["subscription_id"]}
    yield c
    db.subscriptions.delete_many({"id": c["id"]})
    db.invoices.delete_many({"subscription_id": c["id"]})


# ---------- Admin password rotation ----------
class TestAdminPassword:
    def test_old_default_password_rejected(self):
        r = _staff_login(ADMIN_EMAIL, "admin123")
        assert r.status_code == 401

    def test_new_password_accepted(self):
        r = _staff_login(ADMIN_EMAIL, ADMIN_PASSWORD)
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "ADMIN"


# ---------- Locked-down endpoints ----------
class TestLockedEndpoints:
    @pytest.mark.parametrize("method,path", [
        ("get", "/payments"),
        ("get", "/payments/some-id"),
        ("get", "/customer/payments?email=teste.obelisco@gmail.com"),
        ("post", "/admin/intervention/some-id/complete?hours_used=1"),
    ])
    def test_no_auth_rejected(self, method, path):
        r = getattr(requests, method)(f"{API}{path}", timeout=15)
        assert r.status_code in (401, 403), f"{path} -> {r.status_code} {r.text[:200]}"

    def test_customer_token_rejected(self, manual_cust):
        tok = requests.post(f"{API}/connect/login/customer",
                            json={"email": manual_cust["email"], "password": manual_cust["password"]}, timeout=15).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        for p in ["/payments", "/customer/payments?email=x@x.com"]:
            assert requests.get(f"{API}{p}", headers=h, timeout=15).status_code == 403

    def test_admin_list_payments(self, admin_h):
        r = requests.get(f"{API}/payments", headers=admin_h, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json()["payments"], list)

    def test_admin_payment_detail(self, admin_h):
        pays = requests.get(f"{API}/payments", headers=admin_h, timeout=15).json()["payments"]
        if not pays:
            pytest.skip("no payments")
        pid = pays[0].get("id") or pays[0].get("stripe_session_id")
        r = requests.get(f"{API}/payments/{pid}", headers=admin_h, timeout=15)
        assert r.status_code == 200
        assert "_id" not in r.json()
        assert requests.get(f"{API}/payments/nonexistent-xyz", headers=admin_h, timeout=15).status_code == 404

    def test_admin_customer_payments(self, admin_h):
        r = requests.get(f"{API}/customer/payments?email=teste.obelisco@gmail.com", headers=admin_h, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json()["payments"], list)

    def test_admin_intervention_complete(self, admin_h, manual_cust):
        iid = f"test-int-{int(time.time()*1000)}"
        db.interventions.insert_one({"id": iid, "subscription_id": manual_cust["id"], "status": "pending",
                                     "customer_email": manual_cust["email"]})
        try:
            assert requests.post(f"{API}/admin/intervention/nope/complete?hours_used=1", headers=admin_h, timeout=15).status_code == 404
            r = requests.post(f"{API}/admin/intervention/{iid}/complete?hours_used=1.5", headers=admin_h, timeout=15)
            assert r.status_code == 200, r.text
            assert db.interventions.find_one({"id": iid})["status"] == "completed"
            assert db.subscriptions.find_one({"id": manual_cust["id"]})["hours_used"] == 1.5
            assert requests.post(f"{API}/admin/intervention/{iid}/complete?hours_used=-1", headers=admin_h, timeout=15).status_code == 400
        finally:
            db.interventions.delete_many({"id": iid})


# ---------- /connect/me leak ----------
class TestMeNoLeak:
    def test_manual_customer_me_no_password_hash(self, manual_cust):
        tok = requests.post(f"{API}/connect/login/customer",
                            json={"email": manual_cust["email"], "password": manual_cust["password"]}, timeout=15).json()["token"]
        r = requests.get(f"{API}/connect/me", headers={"Authorization": f"Bearer {tok}"}, timeout=15)
        assert r.status_code == 200
        assert "password_hash" not in json.dumps(r.json())
        assert r.json()["subscription"]["id"] == manual_cust["id"]

    def test_admin_me_no_password_hash(self, admin_h):
        r = requests.get(f"{API}/connect/me", headers=admin_h, timeout=15)
        assert r.status_code == 200
        assert "password_hash" not in json.dumps(r.json())
        assert r.json()["role"] == "ADMIN"


# ---------- Staff change-password (uses technician to avoid touching admin) ----------
class TestStaffChangePassword:
    def test_change_password_flow_technician(self):
        r = _staff_login(TECH["email"], TECH["password"])
        if r.status_code != 200:
            pytest.skip("technician login not available")
        h = {"Authorization": f"Bearer {r.json()['token']}"}
        url = f"{API}/connect/staff/change-password"
        assert requests.post(url, json={"current_password": "wrong", "new_password": "abcdefg"}, headers=h, timeout=15).status_code == 401
        assert requests.post(url, json={"current_password": TECH["password"], "new_password": "abc"}, headers=h, timeout=15).status_code == 400
        new_pw = "TempTech!9876"
        r = requests.post(url, json={"current_password": TECH["password"], "new_password": new_pw}, headers=h, timeout=15)
        assert r.status_code == 200, r.text
        try:
            assert _staff_login(TECH["email"], TECH["password"]).status_code == 401
            assert _staff_login(TECH["email"], new_pw).status_code == 200
        finally:
            r2 = requests.post(url, json={"current_password": new_pw, "new_password": TECH["password"]}, headers=h, timeout=15)
            assert r2.status_code == 200
        assert _staff_login(TECH["email"], TECH["password"]).status_code == 200

    def test_customer_cannot_use_staff_endpoint(self, manual_cust):
        tok = requests.post(f"{API}/connect/login/customer",
                            json={"email": manual_cust["email"], "password": manual_cust["password"]}, timeout=15).json()["token"]
        r = requests.post(f"{API}/connect/staff/change-password", json={"current_password": "x", "new_password": "yyyyyy"},
                          headers={"Authorization": f"Bearer {tok}"}, timeout=15)
        assert r.status_code == 403

    def test_no_auth(self):
        r = requests.post(f"{API}/connect/staff/change-password", json={"current_password": "x", "new_password": "yyyyyy"}, timeout=15)
        assert r.status_code == 401


# ---------- Invoices auth ----------
class TestInvoicesAuth:
    def test_invoices_require_auth(self):
        assert requests.get(f"{API}/connect/admin/invoices", timeout=15).status_code == 401
        assert requests.get(f"{API}/connect/customer/invoices", timeout=15).status_code == 401

    def test_admin_filter_by_subscription(self, admin_h, manual_cust):
        r = requests.post(f"{API}/connect/admin/invoices", json={"subscription_id": manual_cust["id"], "amount": 99.5,
                          "invoice_date": "2026-01-05", "payment_status": "pending"}, headers=admin_h, timeout=15)
        assert r.status_code == 200
        r = requests.get(f"{API}/connect/admin/invoices?subscription_id={manual_cust['id']}", headers=admin_h, timeout=15)
        inv = r.json()["invoices"]
        assert len(inv) == 1 and inv[0]["amount"] == 99.5 and inv[0]["payment_status"] == "pending"
        assert inv[0]["source"] == "manual"
