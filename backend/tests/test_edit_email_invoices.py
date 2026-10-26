"""Iteration 14: Edge - editing a manual customer's email must keep their invoices visible; brute-force check"""
import os, time
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env"); load_dotenv("/app/frontend/.env")
API = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") + "/api"
db = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]


def _admin():
    r = requests.post(f"{API}/connect/login/staff", json={"email": os.environ["ADMIN_STAFF_EMAIL"], "password": os.environ["ADMIN_STAFF_PASSWORD"]})
    return {"Authorization": f"Bearer {r.json()['token']}"}


def test_invoices_survive_email_change():
    h = _admin()
    email = f"test_emailchg_{int(time.time()*1000)}@example.com"
    d = requests.post(f"{API}/connect/admin/customers", json={"name": "TEST EmailChg", "email": email, "plan_id": "essencial", "billing_cycle": "monthly"}, headers=h).json()
    sid = d["subscription_id"]
    try:
        assert requests.post(f"{API}/connect/admin/invoices", json={"subscription_id": sid, "amount": 50, "invoice_date": "2026-10-01"}, headers=h).status_code == 200
        new_email = "new_" + email
        assert requests.put(f"{API}/connect/admin/customers/{sid}", json={"email": new_email}, headers=h).status_code == 200
        tok = requests.post(f"{API}/connect/login/customer", json={"email": new_email, "password": d["initial_password"]}).json()["token"]
        inv = requests.get(f"{API}/connect/customer/invoices", headers={"Authorization": f"Bearer {tok}"}).json()["invoices"]
        assert len(inv) == 1, f"customer lost invoice history after email change: {inv}"
    finally:
        db.subscriptions.delete_many({"id": sid}); db.invoices.delete_many({"subscription_id": sid})


def test_staff_bruteforce_lockout():
    for _ in range(6):
        requests.post(f"{API}/connect/login/staff", json={"email": "tecnico@obelisco.pt", "password": "wrong-pass"})
    r = requests.post(f"{API}/connect/login/staff", json={"email": "tecnico@obelisco.pt", "password": "tech123"})
    assert r.status_code == 429, f"no brute-force lockout after 6 failures (got {r.status_code})"
