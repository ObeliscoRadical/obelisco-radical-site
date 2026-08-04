"""
Backend tests for Obelisco Connect API endpoints
Tests: /api/connect/login/customer, /api/connect/login/staff, /api/connect/me, /api/connect/logout
"""
import pytest
import requests
import os
from conftest import BASE_URL, TEST_CUSTOMER_EMAIL, TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, TEST_TECHNICIAN_EMAIL, TEST_TECHNICIAN_PASSWORD

# Use credentials from conftest
CUSTOMER_EMAIL = TEST_CUSTOMER_EMAIL
ADMIN_EMAIL = TEST_ADMIN_EMAIL
ADMIN_PASSWORD = TEST_ADMIN_PASSWORD
TECHNICIAN_EMAIL = TEST_TECHNICIAN_EMAIL
TECHNICIAN_PASSWORD = TEST_TECHNICIAN_PASSWORD


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestCustomerLogin:
    """Tests for POST /api/connect/login/customer"""
    
    def test_customer_login_with_valid_email(self, api_client):
        """Customer with active subscription can login"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/customer",
            json={"email": CUSTOMER_EMAIL}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["user"]["email"] == CUSTOMER_EMAIL
        assert data["user"]["role"] == "CUSTOMER"
        assert "subscription_id" in data["user"]
        assert data["user"]["plan_name"] == "Total"
    
    def test_customer_login_with_invalid_email(self, api_client):
        """Customer without subscription gets 404"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/customer",
            json={"email": "nonexistent@email.com"}
        )
        assert response.status_code == 404
        data = response.json()
        assert "Nenhuma subscricao ativa encontrada" in data["detail"]
    
    def test_customer_login_email_case_insensitive(self, api_client):
        """Email should be case insensitive"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/customer",
            json={"email": CUSTOMER_EMAIL.upper()}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["user"]["email"] == CUSTOMER_EMAIL.lower()


class TestStaffLogin:
    """Tests for POST /api/connect/login/staff"""
    
    def test_admin_login_with_valid_credentials(self, api_client):
        """Admin can login with correct credentials"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/staff",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "ADMIN"
        assert data["user"]["name"] == "Administrador"
    
    def test_technician_login_with_valid_credentials(self, api_client):
        """Technician can login with correct credentials"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/staff",
            json={"email": TECHNICIAN_EMAIL, "password": TECHNICIAN_PASSWORD}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["user"]["email"] == TECHNICIAN_EMAIL
        assert data["user"]["role"] == "TECHNICIAN"
        assert "specialties" in data["user"]
    
    def test_staff_login_with_wrong_password(self, api_client):
        """Staff login fails with wrong password"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/staff",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "Credenciais invalidas" in data["detail"]
    
    def test_staff_login_with_nonexistent_email(self, api_client):
        """Staff login fails with unknown email"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/login/staff",
            json={"email": "unknown@obelisco.pt", "password": "anypassword"}
        )
        assert response.status_code == 401
        data = response.json()
        assert "Credenciais invalidas" in data["detail"]

    def test_fix_admin_endpoint_removed(self, api_client):
        """The vulnerable /api/fix-admin endpoint must be removed"""
        response_post = api_client.post(f"{BASE_URL}/api/fix-admin")
        response_get = api_client.get(f"{BASE_URL}/api/fix-admin")
        assert response_post.status_code == 404, f"POST returned {response_post.status_code}"
        assert response_get.status_code == 404, f"GET returned {response_get.status_code}"



class TestConnectMe:
    """Tests for GET /api/connect/me"""
    
    def test_get_current_customer_user(self, api_client):
        """Get current user for customer token"""
        # First login
        login_response = api_client.post(
            f"{BASE_URL}/api/connect/login/customer",
            json={"email": CUSTOMER_EMAIL}
        )
        token = login_response.json()["token"]
        
        # Get current user
        response = api_client.get(
            f"{BASE_URL}/api/connect/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == CUSTOMER_EMAIL
        assert data["role"] == "CUSTOMER"
        assert "subscription" in data
        assert data["subscription"]["plan_name"] == "Total"
    
    def test_get_current_admin_user(self, api_client):
        """Get current user for admin token"""
        # First login
        login_response = api_client.post(
            f"{BASE_URL}/api/connect/login/staff",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
        )
        token = login_response.json()["token"]
        
        # Get current user
        response = api_client.get(
            f"{BASE_URL}/api/connect/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "ADMIN"
    
    def test_get_current_user_without_token(self, api_client):
        """Request without token returns 401"""
        response = api_client.get(f"{BASE_URL}/api/connect/me")
        assert response.status_code == 401
    
    def test_get_current_user_with_invalid_token(self, api_client):
        """Request with invalid token returns 401"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/me",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )
        assert response.status_code == 401


class TestConnectLogout:
    """Tests for POST /api/connect/logout"""
    
    def test_logout_invalidates_session(self, api_client):
        """Logout should invalidate the session token"""
        # First login
        login_response = api_client.post(
            f"{BASE_URL}/api/connect/login/customer",
            json={"email": CUSTOMER_EMAIL}
        )
        token = login_response.json()["token"]
        
        # Verify token works
        me_response = api_client.get(
            f"{BASE_URL}/api/connect/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        
        # Logout
        logout_response = api_client.post(
            f"{BASE_URL}/api/connect/logout",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert logout_response.status_code == 200
        assert logout_response.json()["success"] is True
        
        # Token should no longer work
        me_response_after = api_client.get(
            f"{BASE_URL}/api/connect/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response_after.status_code == 401
