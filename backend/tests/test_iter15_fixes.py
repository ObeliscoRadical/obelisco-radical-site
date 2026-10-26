"""Iteration 15: re-test of iteration_14 fixes (edit hours preservation, invoice validation/scoping,
hours_available, protected-account reads, admin password, admin-only regression)"""
import os
import time
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@obelisco.pt"
ADMIN_PASSWORD = os.environ.get("ADMIN_STAFF_PASSWORD")
LEGACY_EMAIL = "obeliscoradical@gmail.com"
db = MongoClient(os.environ.get("MONGO_URL"))[os.environ.get("DB_NAME")]


@pytest.fixture(scope="module")
def admin_h():
    r = requests.post(f"{API}/connect/login/staff", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _mk(admin_h, tag):
    email = f"test_i15_{tag}_{int(time.time()*1000)}@example.com"
    r = requests.post(f"{API}/connect/admin/customers", json={
        "name": f"TEST I15 {tag}", "email": email, "phone": "+351900000001",
        "plan_id": "preventivo", "billing_cycle": "monthly"}, headers=admin_h, timeout=20)
    assert r.status_code == 200, r.text
    d = r.json()
    return {"email": email, "password": d["initial_password"], "id": d["subscription_id"]}


@pytest.fixture(scope="module")
def custs(admin_h):
    a, b = _mk(admin_h, "a"), _mk(admin_h, "b")
    yield a, b
    for c in (a, b):
        db.subscriptions.delete_many({"id": c["id"]})
        db.invoices.delete_many({"subscription_id": c["id"]})
        db.hours_adjustments.delete_many({"subscription_id": c["id"]})


def _login(c):
    r = requests.post(f"{API}/connect/login/customer", json={"email": c["email"], "password": c["password"]}, timeout=20)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _sub(admin_h, sid):
    r = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_h, timeout=30)
    assert r.status_code == 200
    return next(s for s in r.json()["subscriptions"] if s["id"] == sid)


# Fix #1 + #5: phone-only edit with the same start date keeps hours_used; hours_available computed
def test_phone_edit_preserves_hours_and_available(admin_h, custs):
    a, _ = custs
    r = requests.post(f"{API}/connect/admin/hours-adjustment",
                      json={"subscription_id": a["id"], "hours_adjusted": -3, "reason": "TEST i15"}, headers=admin_h)
    assert r.status_code == 200, r.text
    s = _sub(admin_h, a["id"])
    assert s["hours_used"] == 3 and s["hours_available"] == s["hours_included"] - 3
    start = (s.get("customer_since") or s["current_period_start"])[:10]
    r = requests.put(f"{API}/connect/admin/customers/{a['id']}", json={
        "name": s["customer_name"], "email": s["customer_email"], "phone": "+351922222222",
        "plan_id": s["plan_id"], "billing_cycle": s["billing_cycle"], "subscription_start_date": start}, headers=admin_h)
    assert r.status_code == 200, r.text
    s2 = _sub(admin_h, a["id"])
    assert s2["hours_used"] == 3
    assert s2["hours_available"] == s2["hours_included"] - 3
    assert s2.get("customer_phone", s2.get("phone")) == "+351922222222"


# Fix #3: invoice amount must be > 0
@pytest.mark.parametrize("amt", [0, -50])
def test_invoice_non_positive_rejected(admin_h, custs, amt):
    a, _ = custs
    r = requests.post(f"{API}/connect/admin/invoices", json={"subscription_id": a["id"], "amount": amt,
                      "currency": "EUR", "invoice_date": "2026-10-01", "payment_status": "pending"}, headers=admin_h)
    assert r.status_code == 422


# Fix #4: customer invoices scoped to own subscription
def test_invoices_scoped(admin_h, custs):
    a, b = custs
    for c, amt in ((a, 111.0), (b, 222.0)):
        r = requests.post(f"{API}/connect/admin/invoices", json={"subscription_id": c["id"], "amount": amt,
                          "currency": "EUR", "invoice_date": "2026-10-01", "payment_status": "paid",
                          "description": "TEST i15"}, headers=admin_h)
        assert r.status_code == 200, r.text
    for c, amt in ((a, 111.0), (b, 222.0)):
        r = requests.get(f"{API}/connect/customer/invoices", headers=_login(c))
        assert r.status_code == 200
        invs = r.json()["invoices"]
        assert len(invs) == 1 and invs[0]["amount"] == amt


# Fix #6: protected accounts need matching session; legacy email-only still works
def test_protected_reads_require_session(custs):
    a, b = custs
    assert requests.get(f"{API}/customer/subscriptions", params={"email": a["email"]}).status_code == 401
    assert requests.get(f"{API}/customer/subscription/{a['id']}").status_code == 401
    assert requests.get(f"{API}/customer/interventions", params={"email": a["email"]}).status_code == 401
    hb = _login(b)  # other customer's token must not unlock A
    assert requests.get(f"{API}/customer/subscriptions", params={"email": a["email"]}, headers=hb).status_code == 401
    assert requests.get(f"{API}/customer/subscription/{a['id']}", headers=hb).status_code == 401
    ha = _login(a)
    r = requests.get(f"{API}/customer/subscriptions", params={"email": a["email"]}, headers=ha)
    assert r.status_code == 200 and r.json()["subscriptions"][0]["id"] == a["id"]
    assert "password_hash" not in r.json()["subscriptions"][0]
    assert requests.get(f"{API}/customer/subscription/{a['id']}", headers=ha).status_code == 200
    assert requests.get(f"{API}/customer/interventions", params={"email": a["email"]}, headers=ha).status_code == 200


def test_legacy_email_only_still_works():
    r = requests.get(f"{API}/customer/subscriptions", params={"email": LEGACY_EMAIL})
    assert r.status_code == 200
    subs = r.json()["subscriptions"]
    if not subs:
        pytest.skip("legacy customer has no active subs")
    assert requests.get(f"{API}/customer/subscription/{subs[0]['id']}").status_code == 200
    assert requests.get(f"{API}/customer/interventions", params={"email": LEGACY_EMAIL}).status_code == 200
    r = requests.post(f"{API}/connect/login/customer", json={"email": LEGACY_EMAIL})
    assert r.status_code == 200, r.text


# Fix #7: admin password
def test_old_admin_password_fails():
    r = requests.post(f"{API}/connect/login/staff", json={"email": ADMIN_EMAIL, "password": "admin123"})
    assert r.status_code in (401, 403)


# Regression: admin-only endpoints
@pytest.mark.parametrize("method,path", [("get", "/payments"), ("get", "/payments/x"),
                                         ("get", "/customer/payments?email=" + LEGACY_EMAIL),
                                         ("post", "/admin/intervention/x/complete")])
def test_admin_only_endpoints(method, path):
    r = getattr(requests, method)(f"{API}{path}", timeout=20)
    assert r.status_code in (401, 403), f"{path} -> {r.status_code}"
