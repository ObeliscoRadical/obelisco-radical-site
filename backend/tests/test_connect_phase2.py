"""
Backend tests for Obelisco Connect Phase 2 API endpoints
Tests: Service Requests, Work Logs, Admin endpoints, Dashboards
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
CUSTOMER_EMAIL = "teste.obelisco@gmail.com"
CUSTOMER_SUBSCRIPTION_ID = "58e8f8e8-0cf8-4bdf-8c25-b16ef8967a3c"
ADMIN_EMAIL = "admin@obelisco.pt"
ADMIN_PASSWORD = "admin123"
TECHNICIAN_EMAIL = "tecnico@obelisco.pt"
TECHNICIAN_PASSWORD = "tech123"


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def customer_token(api_client):
    """Get customer auth token"""
    response = api_client.post(
        f"{BASE_URL}/api/connect/login/customer",
        json={"email": CUSTOMER_EMAIL}
    )
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Customer login failed")


@pytest.fixture
def admin_token(api_client):
    """Get admin auth token"""
    response = api_client.post(
        f"{BASE_URL}/api/connect/login/staff",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Admin login failed")


@pytest.fixture
def technician_token(api_client):
    """Get technician auth token"""
    response = api_client.post(
        f"{BASE_URL}/api/connect/login/staff",
        json={"email": TECHNICIAN_EMAIL, "password": TECHNICIAN_PASSWORD}
    )
    if response.status_code == 200:
        return response.json()["token"]
    pytest.skip("Technician login failed")


class TestCustomerDashboard:
    """Tests for GET /api/connect/customer/dashboard"""
    
    def test_customer_dashboard_returns_subscription_info(self, api_client, customer_token):
        """Customer dashboard returns subscription details"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/customer/dashboard",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check subscription
        assert "subscription" in data
        assert data["subscription"]["customer_email"] == CUSTOMER_EMAIL
        assert data["subscription"]["plan_name"] == "Total"
        assert data["subscription"]["status"] == "active"
        
        # Check hours info
        assert "hours" in data
        assert "included" in data["hours"]
        assert "used" in data["hours"]
        assert "available" in data["hours"]
        assert "percentage_used" in data["hours"]
        assert data["hours"]["included"] == 12  # Total plan has 12 hours
        
        # Check service requests and work logs arrays exist
        assert "service_requests" in data
        assert "work_logs" in data
        assert isinstance(data["service_requests"], list)
        assert isinstance(data["work_logs"], list)
    
    def test_customer_dashboard_requires_auth(self, api_client):
        """Dashboard requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/connect/customer/dashboard")
        assert response.status_code == 401
    
    def test_customer_dashboard_forbidden_for_admin(self, api_client, admin_token):
        """Admin cannot access customer dashboard"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/customer/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403


class TestTechnicianDashboard:
    """Tests for GET /api/connect/technician/dashboard"""
    
    def test_technician_dashboard_returns_assigned_requests(self, api_client, technician_token):
        """Technician dashboard returns assigned requests and stats"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/technician/dashboard",
            headers={"Authorization": f"Bearer {technician_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check structure
        assert "assigned_requests" in data
        assert "stats" in data
        assert "recent_logs" in data
        
        # Check stats structure
        assert "pending_jobs" in data["stats"]
        assert "in_progress" in data["stats"]
        assert "completed_today" in data["stats"]
    
    def test_technician_dashboard_requires_auth(self, api_client):
        """Dashboard requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/connect/technician/dashboard")
        assert response.status_code == 401
    
    def test_technician_dashboard_forbidden_for_customer(self, api_client, customer_token):
        """Customer cannot access technician dashboard"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/technician/dashboard",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 403


class TestAdminStats:
    """Tests for GET /api/connect/admin/stats"""
    
    def test_admin_stats_returns_dashboard_data(self, api_client, admin_token):
        """Admin stats returns dashboard statistics"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # Check stats structure
        assert "stats" in data
        assert "active_subscriptions" in data["stats"]
        assert "pending_requests" in data["stats"]
        assert "in_progress_requests" in data["stats"]
        assert "total_technicians" in data["stats"]
        
        # Check recent requests
        assert "recent_requests" in data
        assert isinstance(data["recent_requests"], list)
    
    def test_admin_stats_requires_admin_role(self, api_client, technician_token):
        """Only admin can access stats"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/stats",
            headers={"Authorization": f"Bearer {technician_token}"}
        )
        assert response.status_code == 403


class TestAdminTechnicians:
    """Tests for /api/connect/admin/technicians"""
    
    def test_list_technicians(self, api_client, admin_token):
        """Admin can list all technicians"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/technicians",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "technicians" in data
        assert isinstance(data["technicians"], list)
        assert len(data["technicians"]) >= 1
        
        # Check technician structure (password_hash should be excluded)
        tech = data["technicians"][0]
        assert "id" in tech
        assert "email" in tech
        assert "name" in tech
        assert "role" in tech
        assert tech["role"] == "TECHNICIAN"
        assert "password_hash" not in tech
    
    def test_list_technicians_requires_admin(self, api_client, customer_token):
        """Only admin can list technicians"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/technicians",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 403
    
    def test_create_technician(self, api_client, admin_token):
        """Admin can create a new technician"""
        unique_email = f"test_tech_{uuid.uuid4().hex[:8]}@obelisco.pt"
        
        response = api_client.post(
            f"{BASE_URL}/api/connect/admin/technicians",
            params={
                "name": "TEST_Technician",
                "email": unique_email,
                "password": "testpass123",
                "phone": "911000001",
                "specialties": ["eletricidade"]
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "technician_id" in data
    
    def test_create_technician_duplicate_email_fails(self, api_client, admin_token):
        """Cannot create technician with existing email"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/admin/technicians",
            params={
                "name": "Duplicate Tech",
                "email": TECHNICIAN_EMAIL,  # Already exists
                "password": "testpass123"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400
        assert "Email ja existe" in response.json()["detail"]


class TestAdminSubscriptions:
    """Tests for GET /api/connect/admin/subscriptions"""
    
    def test_list_subscriptions(self, api_client, admin_token):
        """Admin can list all subscriptions"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/subscriptions",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "subscriptions" in data
        assert "count" in data
        assert isinstance(data["subscriptions"], list)
        assert data["count"] >= 1
    
    def test_list_subscriptions_filter_by_status(self, api_client, admin_token):
        """Admin can filter subscriptions by status"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/subscriptions?status=active",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        # All returned subscriptions should be active
        for sub in data["subscriptions"]:
            assert sub.get("status") == "active"
    
    def test_list_subscriptions_requires_admin(self, api_client, technician_token):
        """Only admin can list subscriptions"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/subscriptions",
            headers={"Authorization": f"Bearer {technician_token}"}
        )
        assert response.status_code == 403


class TestServiceRequests:
    """Tests for /api/connect/service-requests"""
    
    def test_customer_create_service_request(self, api_client, customer_token):
        """Customer can create a service request"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/service-requests",
            json={
                "subscription_id": CUSTOMER_SUBSCRIPTION_ID,
                "customer_email": CUSTOMER_EMAIL,
                "request_type": "avaria",
                "urgency": "normal",
                "description": f"TEST_Service request {uuid.uuid4().hex[:8]}",
                "media_urls": [],
                "preferred_date": "2026-08-10",
                "preferred_time": "10:00",
                "address": "Rua Teste 123, Lisboa"
            },
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "service_request_id" in data
        assert data["message"] == "Pedido criado com sucesso"
    
    def test_customer_list_own_service_requests(self, api_client, customer_token):
        """Customer can list their own service requests"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/service-requests",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "service_requests" in data
        assert "count" in data
        
        # All requests should belong to the customer
        for req in data["service_requests"]:
            assert req["customer_email"] == CUSTOMER_EMAIL
    
    def test_admin_list_all_service_requests(self, api_client, admin_token):
        """Admin can list all service requests"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/service-requests",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "service_requests" in data
        assert "count" in data
    
    def test_technician_list_assigned_requests(self, api_client, technician_token):
        """Technician can list their assigned requests"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/service-requests",
            headers={"Authorization": f"Bearer {technician_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "service_requests" in data
    
    def test_create_service_request_requires_customer_role(self, api_client, admin_token):
        """Only customers can create service requests"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/service-requests",
            json={
                "subscription_id": CUSTOMER_SUBSCRIPTION_ID,
                "customer_email": CUSTOMER_EMAIL,
                "request_type": "avaria",
                "urgency": "normal",
                "description": "Test request"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 403


class TestServiceRequestAssignment:
    """Tests for service request assignment and status updates"""
    
    @pytest.fixture
    def service_request_id(self, api_client, customer_token):
        """Create a service request for testing"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/service-requests",
            json={
                "subscription_id": CUSTOMER_SUBSCRIPTION_ID,
                "customer_email": CUSTOMER_EMAIL,
                "request_type": "manutencao",
                "urgency": "normal",
                "description": f"TEST_Assignment test {uuid.uuid4().hex[:8]}"
            },
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        if response.status_code == 200:
            return response.json()["service_request_id"]
        pytest.skip("Failed to create service request")
    
    @pytest.fixture
    def technician_id(self, api_client, admin_token):
        """Get technician ID"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/technicians",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        if response.status_code == 200:
            techs = response.json()["technicians"]
            if techs:
                return techs[0]["id"]
        pytest.skip("No technicians available")
    
    def test_admin_assign_technician(self, api_client, admin_token, service_request_id, technician_id):
        """Admin can assign a technician to a service request"""
        response = api_client.put(
            f"{BASE_URL}/api/connect/service-requests/{service_request_id}/assign?technician_id={technician_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "atribuido" in data["message"].lower()
    
    def test_update_service_request_status(self, api_client, admin_token, service_request_id):
        """Admin can update service request status"""
        response = api_client.put(
            f"{BASE_URL}/api/connect/service-requests/{service_request_id}/status?status=in_progress",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
    
    def test_invalid_status_rejected(self, api_client, admin_token, service_request_id):
        """Invalid status values are rejected"""
        response = api_client.put(
            f"{BASE_URL}/api/connect/service-requests/{service_request_id}/status?status=invalid_status",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400


class TestWorkLogs:
    """Tests for /api/connect/work-logs"""
    
    def test_list_work_logs_customer(self, api_client, customer_token):
        """Customer can list their work logs"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/work-logs",
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "work_logs" in data
        assert "count" in data
        
        # All logs should belong to the customer
        for log in data["work_logs"]:
            assert log["customer_email"] == CUSTOMER_EMAIL
    
    def test_list_work_logs_technician(self, api_client, technician_token):
        """Technician can list their work logs"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/work-logs",
            headers={"Authorization": f"Bearer {technician_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "work_logs" in data
        assert "count" in data
    
    def test_work_log_requires_technician_role(self, api_client, customer_token):
        """Only technicians can create work logs"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/work-logs",
            json={
                "service_request_id": "some-id",
                "hours_spent": 1.0,
                "work_description": "Test work"
            },
            headers={"Authorization": f"Bearer {customer_token}"}
        )
        assert response.status_code == 403


class TestHoursAdjustment:
    """Tests for /api/connect/admin/hours-adjustment"""
    
    def test_admin_adjust_hours(self, api_client, admin_token):
        """Admin can adjust hours for a subscription"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/admin/hours-adjustment",
            json={
                "subscription_id": CUSTOMER_SUBSCRIPTION_ID,
                "hours_adjusted": 1.0,  # Give back 1 hour
                "reason": "TEST_Adjustment - compensacao por erro"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] is True
        assert "adjustment_id" in data
        assert "new_balance" in data
    
    def test_list_hours_adjustments(self, api_client, admin_token):
        """Admin can list hours adjustments"""
        response = api_client.get(
            f"{BASE_URL}/api/connect/admin/hours-adjustments",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        
        assert "adjustments" in data
        assert isinstance(data["adjustments"], list)
    
    def test_hours_adjustment_requires_admin(self, api_client, technician_token):
        """Only admin can adjust hours"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/admin/hours-adjustment",
            json={
                "subscription_id": CUSTOMER_SUBSCRIPTION_ID,
                "hours_adjusted": 1.0,
                "reason": "Test"
            },
            headers={"Authorization": f"Bearer {technician_token}"}
        )
        assert response.status_code == 403
    
    def test_hours_adjustment_invalid_subscription(self, api_client, admin_token):
        """Adjustment fails for non-existent subscription"""
        response = api_client.post(
            f"{BASE_URL}/api/connect/admin/hours-adjustment",
            json={
                "subscription_id": "non-existent-id",
                "hours_adjusted": 1.0,
                "reason": "Test"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 404
