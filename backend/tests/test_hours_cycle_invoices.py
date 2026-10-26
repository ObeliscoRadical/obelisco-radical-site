"""Iteration 14: Manual subscription hours-cycle rollover (anchored to 'cliente desde') + invoices (manual + stripe)"""
import os
import time
import json
import hmac
import hashlib
from datetime import datetime, timezone, timedelta

import pytest
import requests
from pymongo import MongoClient
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv

load_dotenv("/app/backend/.env")
load_dotenv("/app/frontend/.env")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN = {"email": "admin@obelisco.pt", "password": "admin123"}

mongo = MongoClient(os.environ.get("MONGO_URL"))
db = mongo[os.environ.get("DB_NAME")]


def _iso(d):
    return datetime.fromisoformat(d)


@pytest.fixture(scope="module")
def admin_h():
    r = requests.post(f"{API}/connect/login/staff", json=ADMIN, timeout=15)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _create_customer(admin_h, tag, plan="preventivo", cycle="monthly"):
    email = f"test_cycle_{tag}_{int(time.time()*1000)}@example.com"
    r = requests.post(f"{API}/connect/admin/customers", json={
        "name": f"TEST Cycle {tag}", "email": email, "phone": "+351900000000",
        "plan_id": plan, "billing_cycle": cycle}, headers=admin_h, timeout=15)
    assert r.status_code == 200, r.text
    d = r.json()
    return {"email": email, "password": d["initial_password"], "id": d["subscription_id"]}


@pytest.fixture(scope="module")
def cust_a(admin_h):
    c = _create_customer(admin_h, "a")
    yield c
    db.subscriptions.delete_many({"id": c["id"]})
    db.invoices.delete_many({"subscription_id": c["id"]})


@pytest.fixture(scope="module")
def cust_b(admin_h):
    c = _create_customer(admin_h, "b", plan="essencial")
    yield c
    db.subscriptions.delete_many({"id": c["id"]})
    db.invoices.delete_many({"subscription_id": c["id"]})


def _cust_login(c):
    r = requests.post(f"{API}/connect/login/customer", json={"email": c["email"], "password": c["password"]}, timeout=15)
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}


def _expected_cycle(start, now, months=1):
    """Expected active cycle computed from the ORIGINAL anchor (no drift)."""
    k = 0
    while start + relativedelta(months=months * (k + 1)) <= now:
        k += 1
    return start + relativedelta(months=months * k), start + relativedelta(months=months * (k + 1))


# ---------- Hours cycle anchoring ----------
class TestCycleAnchoring:
    def test_edit_backdated_start_date_lands_on_current_cycle(self, admin_h, cust_a):
        now = datetime.now(timezone.utc)
        start = (now - timedelta(days=70)).replace(hour=0, minute=0, second=0, microsecond=0)
        r = requests.put(f"{API}/connect/admin/customers/{cust_a['id']}",
                         json={"subscription_start_date": start.strftime("%Y-%m-%d")}, headers=admin_h, timeout=15)
        assert r.status_code == 200, r.text
        sub = r.json()["subscription"]
        ps, pe = _iso(sub["current_period_start"]), _iso(sub["current_period_end"])
        exp_s, exp_e = _expected_cycle(start, now)
        assert ps == exp_s and pe == exp_e, f"got {ps}..{pe} expected {exp_s}..{exp_e}"
        assert ps.day == start.day or start.day > 28
        assert ps <= now < pe
        assert sub["hours_used"] == 0.0
        assert sub["hours_included"] == 6

    def test_consume_hours_then_rollover_resets_to_exact_zero(self, admin_h, cust_a):
        r = requests.post(f"{API}/connect/admin/hours-adjustment",
                          json={"subscription_id": cust_a["id"], "hours_adjusted": -4, "reason": "TEST consume"},
                          headers=admin_h, timeout=15)
        assert r.status_code == 200, r.text
        assert r.json()["new_balance"] == 2
        before = db.subscriptions.find_one({"id": cust_a["id"]})
        assert before["hours_used"] == 4
        old_start = _iso(before["current_period_start"])
        # Force period into the past: shift whole cycle back by one month
        past_start = old_start - relativedelta(months=1)
        db.subscriptions.update_one({"id": cust_a["id"]}, {"$set": {
            "current_period_start": past_start.isoformat(), "current_period_end": old_start.isoformat()}})
        r = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_h, timeout=20)
        assert r.status_code == 200
        sub = next(s for s in r.json()["subscriptions"] if s["id"] == cust_a["id"])
        assert sub["hours_used"] == 0.0
        assert _iso(sub["current_period_start"]) == old_start
        assert _iso(sub["current_period_end"]) == old_start + relativedelta(months=1)
        persisted = db.subscriptions.find_one({"id": cust_a["id"]})
        assert persisted["hours_used"] == 0.0

    def test_multi_cycle_skip_still_resets_and_anchors(self, admin_h, cust_a):
        """Period expired 3 cycles ago, with leftover hours -> exactly 0, correct anchor"""
        cur = db.subscriptions.find_one({"id": cust_a["id"]})
        cur_start = _iso(cur["current_period_start"])
        db.subscriptions.update_one({"id": cust_a["id"]}, {"$set": {
            "hours_used": 1.5,
            "current_period_start": (cur_start - relativedelta(months=3)).isoformat(),
            "current_period_end": (cur_start - relativedelta(months=2)).isoformat()}})
        h = _cust_login(cust_a)
        r = requests.get(f"{API}/connect/customer/dashboard", headers=h, timeout=20)
        assert r.status_code == 200, r.text
        persisted = db.subscriptions.find_one({"id": cust_a["id"]})
        assert persisted["hours_used"] == 0.0
        assert _iso(persisted["current_period_start"]) == cur_start
        body = json.dumps(r.json())
        assert "6" in body

    def test_stripe_subscription_untouched(self, admin_h):
        stripe_sub = db.subscriptions.find_one({"payment_method": {"$ne": "manual_invoice"}, "status": "active",
                                                "current_period_end": {"$exists": True}})
        if not stripe_sub:
            pytest.skip("no stripe sub")
        orig = {k: stripe_sub.get(k) for k in ("current_period_start", "current_period_end", "hours_used")}
        try:
            db.subscriptions.update_one({"id": stripe_sub["id"]}, {"$set": {
                "current_period_end": "2020-01-01T00:00:00+00:00", "hours_used": 2.0}})
            r = requests.get(f"{API}/connect/admin/subscriptions", headers=admin_h, timeout=20)
            assert r.status_code == 200
            after = db.subscriptions.find_one({"id": stripe_sub["id"]})
            assert after["hours_used"] == 2.0
            assert after["current_period_end"] == "2020-01-01T00:00:00+00:00"
        finally:
            db.subscriptions.update_one({"id": stripe_sub["id"]}, {"$set": orig})

    def test_edit_stripe_sub_rejected(self, admin_h):
        stripe_sub = db.subscriptions.find_one({"payment_method": {"$ne": "manual_invoice"}})
        if not stripe_sub:
            pytest.skip("no stripe sub")
        r = requests.put(f"{API}/connect/admin/customers/{stripe_sub['id']}", json={"name": "x"}, headers=admin_h)
        assert r.status_code == 400

    def test_edit_without_date_change_should_not_reset_hours(self, admin_h, cust_a):
        """Frontend always resends subscription_start_date=current_period_start; check hours survive a phone-only edit"""
        requests.post(f"{API}/connect/admin/hours-adjustment",
                      json={"subscription_id": cust_a["id"], "hours_adjusted": -2, "reason": "TEST"}, headers=admin_h)
        sub = db.subscriptions.find_one({"id": cust_a["id"]})
        assert sub["hours_used"] == 2
        payload = {"name": sub["customer_name"], "email": sub["customer_email"], "phone": "+351911111111",
                   "plan_id": sub["plan_id"], "billing_cycle": sub["billing_cycle"],
                   "subscription_start_date": sub["current_period_start"][:10]}  # what the UI sends
        r = requests.put(f"{API}/connect/admin/customers/{cust_a['id']}", json=payload, headers=admin_h)
        assert r.status_code == 200
        assert r.json()["subscription"]["hours_used"] == 2, "phone-only edit via UI payload wiped consumed hours"

    def test_day_31_anchor_no_drift(self, admin_h, cust_b):
        """Client since 31st: after Feb (28/29) the cycle should go back to 31 Mar, not drift to 28th forever"""
        db.subscriptions.update_one({"id": cust_b["id"]}, {"$set": {
            "current_period_start": "2025-01-31T00:00:00+00:00", "current_period_end": "2025-02-28T00:00:00+00:00"}})
        requests.get(f"{API}/connect/admin/subscriptions", headers=admin_h, timeout=20)
        sub = db.subscriptions.find_one({"id": cust_b["id"]})
        ps = _iso(sub["current_period_start"])
        assert ps.day in (28, 29, 30, 31)
        # With a true anchor of day 31, months with 31 days must start on 31
        print("day-31 anchored sub now at", sub["current_period_start"], sub["current_period_end"])
        assert not (ps.day == 28 and ps.month not in (2,)), f"Drift: anchor 31 drifted to {ps.date()}"


# ---------- Invoices ----------
class TestInvoices:
    def test_create_manual_invoice_and_list(self, admin_h, cust_b):
        ids = []
        for d, amt, st in (("2025-11-15", 190.0, "paid"), ("2026-01-15", 190.0, "pending"), ("2025-12-15", 190.0, "overdue")):
            r = requests.post(f"{API}/connect/admin/invoices", json={
                "subscription_id": cust_b["id"], "amount": amt, "currency": "EUR",
                "invoice_date": d, "payment_status": st, "description": "TEST inv"}, headers=admin_h)
            assert r.status_code == 200, r.text
            inv = r.json()["invoice"]
            assert inv["source"] == "manual" and inv["payment_status"] == st and inv["amount"] == amt
            assert "_id" not in inv
            ids.append(inv["id"])
        r = requests.get(f"{API}/connect/admin/invoices", params={"subscription_id": cust_b["id"]}, headers=admin_h)
        assert r.status_code == 200
        invs = r.json()["invoices"]
        assert len(invs) == 3
        assert [i["invoice_date"][:10] for i in invs] == ["2026-01-15", "2025-12-15", "2025-11-15"]

    def test_admin_list_all_sorted(self, admin_h):
        r = requests.get(f"{API}/connect/admin/invoices", headers=admin_h)
        assert r.status_code == 200
        dates = [i["invoice_date"] for i in r.json()["invoices"]]
        assert dates == sorted(dates, reverse=True)

    def test_invalid_subscription_404(self, admin_h):
        r = requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": "nope", "amount": 1, "invoice_date": "2026-01-01"}, headers=admin_h)
        assert r.status_code == 404

    def test_invalid_date_400(self, admin_h, cust_b):
        r = requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": cust_b["id"], "amount": 1, "invoice_date": "15/01/2026"}, headers=admin_h)
        assert r.status_code == 400

    def test_invalid_status_422(self, admin_h, cust_b):
        r = requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": cust_b["id"], "amount": 1, "invoice_date": "2026-01-01", "payment_status": "foo"}, headers=admin_h)
        assert r.status_code == 422

    def test_negative_amount(self, admin_h, cust_b):
        r = requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": cust_b["id"], "amount": -50, "invoice_date": "2026-01-01"}, headers=admin_h)
        if r.status_code == 200:
            db.invoices.delete_one({"id": r.json()["invoice"]["id"]})
        print("negative amount status:", r.status_code)
        assert r.status_code in (400, 422), "negative invoice amount accepted"

    def test_non_admin_403(self, cust_b):
        h = _cust_login(cust_b)
        r = requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": cust_b["id"], "amount": 1, "invoice_date": "2026-01-01"}, headers=h)
        assert r.status_code == 403
        r = requests.get(f"{API}/connect/admin/invoices", headers=h)
        assert r.status_code == 403
        r = requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": cust_b["id"], "amount": 1, "invoice_date": "2026-01-01"})
        assert r.status_code in (401, 403)

    def test_customer_sees_only_own(self, cust_a, cust_b, admin_h):
        requests.post(f"{API}/connect/admin/invoices", json={
            "subscription_id": cust_a["id"], "amount": 99, "invoice_date": "2026-01-02"}, headers=admin_h)
        ra = requests.get(f"{API}/connect/customer/invoices", headers=_cust_login(cust_a)).json()["invoices"]
        rb = requests.get(f"{API}/connect/customer/invoices", headers=_cust_login(cust_b)).json()["invoices"]
        assert all(i["customer_email"] == cust_a["email"] for i in ra) and len(ra) == 1
        assert all(i["customer_email"] == cust_b["email"] for i in rb) and len(rb) == 3
        dates = [i["invoice_date"] for i in rb]
        assert dates == sorted(dates, reverse=True)


# ---------- Stripe webhook invoice.payment_succeeded ----------
class TestStripeWebhookInvoice:
    def _send(self, payload):
        secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
        body = json.dumps(payload)
        ts = int(time.time())
        sig = hmac.new(secret.encode(), f"{ts}.{body}".encode(), hashlib.sha256).hexdigest()
        return requests.post(f"{API}/stripe/webhook", data=body,
                             headers={"Content-Type": "application/json", "Stripe-Signature": f"t={ts},v1={sig}"}, timeout=20)

    def test_webhook_creates_stripe_invoice_idempotent_and_mixed_list(self, admin_h):
        stripe_sub = db.subscriptions.find_one({"stripe_subscription_id": {"$ne": None}, "status": "active",
                                                "password_hash": {"$exists": False}})
        if not stripe_sub:
            pytest.skip("no stripe sub")
        inv_id = f"in_TEST_{int(time.time())}"
        evt = {"id": f"evt_TEST_{int(time.time())}", "object": "event", "type": "invoice.payment_succeeded",
               "data": {"object": {"id": inv_id, "object": "invoice", "subscription": stripe_sub["stripe_subscription_id"],
                                   "amount_paid": 12345, "currency": "eur", "created": int(time.time()) - 86400}}}
        try:
            r1 = self._send(evt)
            r2 = self._send(evt)
            assert r1.status_code == 200, r1.text
            assert r2.status_code == 200
            assert db.invoices.count_documents({"stripe_invoice_id": inv_id}) == 1
            rec = db.invoices.find_one({"stripe_invoice_id": inv_id})
            assert rec["source"] == "stripe" and rec["amount"] == 123.45 and rec["currency"] == "EUR"
            # add a manual invoice for same stripe customer, then check combined list
            m = requests.post(f"{API}/connect/admin/invoices", json={
                "subscription_id": stripe_sub["id"], "amount": 10, "invoice_date": "2020-01-01",
                "description": "TEST manual for stripe cust"}, headers=admin_h).json()["invoice"]
            lr = requests.post(f"{API}/connect/login/customer", json={"email": stripe_sub["customer_email"]})
            h = {"Authorization": f"Bearer {lr.json()['token']}"}
            invs = requests.get(f"{API}/connect/customer/invoices", headers=h).json()["invoices"]
            sources = {i["source"] for i in invs}
            assert {"manual", "stripe"} <= sources
            dates = [i["invoice_date"] for i in invs]
            assert dates == sorted(dates, reverse=True)
        finally:
            db.invoices.delete_many({"stripe_invoice_id": inv_id})
            db.invoices.delete_many({"description": "TEST manual for stripe cust"})

    def test_bad_signature_rejected(self):
        r = requests.post(f"{API}/stripe/webhook", data="{}", headers={"Stripe-Signature": "t=1,v1=bad"})
        assert r.status_code in (400, 401)
