"""
Test Customer Portal API endpoints with test credentials
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://staff-dashboard-92.preview.emergentagent.com')

class TestCustomerPortalWithTestCredentials:
    """Test customer portal with the test account: teste.obelisco@gmail.com"""
    
    def test_get_subscriptions_returns_active_subscription(self):
        """Test that test email returns active subscription"""
        response = requests.get(f"{BASE_URL}/api/customer/subscriptions?email=teste.obelisco@gmail.com")
        assert response.status_code == 200
        data = response.json()
        
        assert "subscriptions" in data
        assert len(data["subscriptions"]) > 0
        
        sub = data["subscriptions"][0]
        assert sub["customer_email"] == "teste.obelisco@gmail.com"
        assert sub["status"] == "active"
        assert sub["plan_name"] == "Total"
        assert sub["plan_id"] == "total"
    
    def test_subscription_has_correct_plan_details(self):
        """Test that subscription has correct plan (Total - 1290 EUR/month)"""
        response = requests.get(f"{BASE_URL}/api/customer/subscriptions?email=teste.obelisco@gmail.com")
        assert response.status_code == 200
        data = response.json()
        
        sub = data["subscriptions"][0]
        assert sub["amount"] == 1290.0
        assert sub["currency"] == "EUR"
        assert sub["billing_cycle"] == "monthly"
    
    def test_subscription_has_correct_hours(self):
        """Test that subscription shows correct hours (Total plan has 12 hours included)"""
        response = requests.get(f"{BASE_URL}/api/customer/subscriptions?email=teste.obelisco@gmail.com")
        assert response.status_code == 200
        data = response.json()
        
        sub = data["subscriptions"][0]
        assert sub["hours_included"] == 12  # Total plan has 12 hours
        assert sub["hours_used"] >= 0  # Hours used can vary
        # Available hours should be calculated correctly
        available = sub["hours_included"] - sub["hours_used"]
        assert available >= 0
        assert available <= 12
    
    def test_get_interventions_returns_scheduled_intervention(self):
        """Test that test email returns scheduled intervention"""
        response = requests.get(f"{BASE_URL}/api/customer/interventions?email=teste.obelisco@gmail.com")
        assert response.status_code == 200
        data = response.json()
        
        assert "interventions" in data
        assert len(data["interventions"]) > 0
        
        intervention = data["interventions"][0]
        assert intervention["customer_email"] == "teste.obelisco@gmail.com"
        assert intervention["status"] in ["scheduled", "pending", "in_progress", "completed"]
    
    def test_subscription_details_endpoint(self):
        """Test getting detailed subscription info"""
        # First get the subscription ID
        response = requests.get(f"{BASE_URL}/api/customer/subscriptions?email=teste.obelisco@gmail.com")
        assert response.status_code == 200
        sub_id = response.json()["subscriptions"][0]["id"]
        
        # Get detailed subscription info
        response = requests.get(f"{BASE_URL}/api/customer/subscription/{sub_id}")
        assert response.status_code == 200
        data = response.json()
        
        assert "subscription" in data
        assert "hours" in data
        assert data["hours"]["included"] == 12  # Total plan has 12 hours
        assert data["hours"]["used"] >= 0  # Hours used can vary
        assert data["hours"]["available"] >= 0
        assert data["hours"]["available"] <= 12
    
    def test_nonexistent_email_returns_empty_subscriptions(self):
        """Test that non-existent email returns empty subscriptions"""
        response = requests.get(f"{BASE_URL}/api/customer/subscriptions?email=nonexistent@example.com")
        assert response.status_code == 200
        data = response.json()
        
        assert "subscriptions" in data
        assert len(data["subscriptions"]) == 0
