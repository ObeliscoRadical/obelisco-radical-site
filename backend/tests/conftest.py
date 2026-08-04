import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://obelisco-payments.preview.emergentagent.com').rstrip('/')

# Test credentials - loaded from environment variables with defaults for test environment
# In production, these should be set via environment variables
TEST_CUSTOMER_EMAIL = os.environ.get('TEST_CUSTOMER_EMAIL', 'teste.obelisco@gmail.com')
TEST_ADMIN_EMAIL = os.environ.get('TEST_ADMIN_EMAIL', 'admin@obelisco.pt')
TEST_ADMIN_PASSWORD = os.environ.get('TEST_ADMIN_PASSWORD', 'admin123')
TEST_TECHNICIAN_EMAIL = os.environ.get('TEST_TECHNICIAN_EMAIL', 'tecnico@obelisco.pt')
TEST_TECHNICIAN_PASSWORD = os.environ.get('TEST_TECHNICIAN_PASSWORD', 'tech123')

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def base_url():
    """Return the base URL for API calls"""
    return BASE_URL

@pytest.fixture
def test_credentials():
    """Return test credentials dictionary"""
    return {
        "customer_email": TEST_CUSTOMER_EMAIL,
        "admin_email": TEST_ADMIN_EMAIL,
        "admin_password": TEST_ADMIN_PASSWORD,
        "technician_email": TEST_TECHNICIAN_EMAIL,
        "technician_password": TEST_TECHNICIAN_PASSWORD
    }
