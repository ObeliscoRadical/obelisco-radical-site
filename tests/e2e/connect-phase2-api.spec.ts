import { test, expect } from '@playwright/test';

test.describe('Obelisco Connect - Phase 2 Full Flow', () => {
  const BASE_URL = 'https://obelisco-payments.preview.emergentagent.com';
  
  // Test credentials
  const CUSTOMER_EMAIL = 'teste.obelisco@gmail.com';
  const ADMIN_EMAIL = 'admin@obelisco.pt';
  const ADMIN_PASSWORD = 'admin123';
  const TECHNICIAN_EMAIL = 'tecnico@obelisco.pt';
  const TECHNICIAN_PASSWORD = 'tech123';

  test.beforeEach(async ({ page }) => {
    // Clear any stored auth data
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('connect_token');
      localStorage.removeItem('connect_user');
    });
  });

  test('Customer login and view dashboard via API', async ({ request }) => {
    // Login as customer
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/customer`, {
      data: { email: CUSTOMER_EMAIL }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.user.role).toBe('CUSTOMER');
    
    const token = loginData.token;
    
    // Get customer dashboard
    const dashboardResponse = await request.get(`${BASE_URL}/api/connect/customer/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(dashboardResponse.ok()).toBeTruthy();
    const dashboard = await dashboardResponse.json();
    
    // Verify dashboard structure
    expect(dashboard.subscription).toBeDefined();
    expect(dashboard.subscription.plan_name).toBe('Total');
    expect(dashboard.hours).toBeDefined();
    expect(dashboard.hours.included).toBe(12);
    expect(dashboard.service_requests).toBeDefined();
    expect(dashboard.work_logs).toBeDefined();
  });

  test('Admin login and view stats via API', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/staff`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.user.role).toBe('ADMIN');
    
    const token = loginData.token;
    
    // Get admin stats
    const statsResponse = await request.get(`${BASE_URL}/api/connect/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(statsResponse.ok()).toBeTruthy();
    const stats = await statsResponse.json();
    
    // Verify stats structure
    expect(stats.stats).toBeDefined();
    expect(stats.stats.active_subscriptions).toBeGreaterThanOrEqual(1);
    expect(stats.stats.total_technicians).toBeGreaterThanOrEqual(1);
    expect(stats.recent_requests).toBeDefined();
  });

  test('Admin can list technicians via API', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/staff`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const token = (await loginResponse.json()).token;
    
    // List technicians
    const techResponse = await request.get(`${BASE_URL}/api/connect/admin/technicians`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(techResponse.ok()).toBeTruthy();
    const techData = await techResponse.json();
    
    expect(techData.technicians).toBeDefined();
    expect(techData.technicians.length).toBeGreaterThanOrEqual(1);
    
    // Verify technician structure (password_hash should be excluded)
    const tech = techData.technicians[0];
    expect(tech.email).toBeDefined();
    expect(tech.name).toBeDefined();
    expect(tech.role).toBe('TECHNICIAN');
    expect(tech.password_hash).toBeUndefined();
  });

  test('Admin can list subscriptions via API', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/staff`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const token = (await loginResponse.json()).token;
    
    // List subscriptions
    const subsResponse = await request.get(`${BASE_URL}/api/connect/admin/subscriptions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(subsResponse.ok()).toBeTruthy();
    const subsData = await subsResponse.json();
    
    expect(subsData.subscriptions).toBeDefined();
    expect(subsData.count).toBeGreaterThanOrEqual(1);
  });

  test('Technician login and view dashboard via API', async ({ request }) => {
    // Login as technician
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/staff`, {
      data: { email: TECHNICIAN_EMAIL, password: TECHNICIAN_PASSWORD }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.user.role).toBe('TECHNICIAN');
    
    const token = loginData.token;
    
    // Get technician dashboard
    const dashboardResponse = await request.get(`${BASE_URL}/api/connect/technician/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(dashboardResponse.ok()).toBeTruthy();
    const dashboard = await dashboardResponse.json();
    
    // Verify dashboard structure
    expect(dashboard.assigned_requests).toBeDefined();
    expect(dashboard.stats).toBeDefined();
    expect(dashboard.stats.pending_jobs).toBeDefined();
    expect(dashboard.stats.in_progress).toBeDefined();
    expect(dashboard.stats.completed_today).toBeDefined();
    expect(dashboard.recent_logs).toBeDefined();
  });

  test('Customer can create service request via API', async ({ request }) => {
    // Login as customer
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/customer`, {
      data: { email: CUSTOMER_EMAIL }
    });
    const loginData = await loginResponse.json();
    const token = loginData.token;
    const subscriptionId = loginData.user.subscription_id;
    
    // Create service request
    const uniqueDesc = `TEST_E2E Service request ${Date.now()}`;
    const createResponse = await request.post(`${BASE_URL}/api/connect/service-requests`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        subscription_id: subscriptionId,
        customer_email: CUSTOMER_EMAIL,
        request_type: 'avaria',
        urgency: 'normal',
        description: uniqueDesc,
        media_urls: [],
        preferred_date: '2026-08-15',
        preferred_time: '10:00',
        address: 'Rua Teste E2E 123, Lisboa'
      }
    });
    expect(createResponse.ok()).toBeTruthy();
    const createData = await createResponse.json();
    
    expect(createData.success).toBe(true);
    expect(createData.service_request_id).toBeDefined();
    expect(createData.message).toBe('Pedido criado com sucesso');
    
    // Verify request appears in list
    const listResponse = await request.get(`${BASE_URL}/api/connect/service-requests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(listResponse.ok()).toBeTruthy();
    const listData = await listResponse.json();
    
    const createdRequest = listData.service_requests.find(
      (r: any) => r.id === createData.service_request_id
    );
    expect(createdRequest).toBeDefined();
    expect(createdRequest.description).toBe(uniqueDesc);
    expect(createdRequest.status).toBe('pending');
  });

  test('Admin can adjust hours via API', async ({ request }) => {
    // Login as admin
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/staff`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    const token = (await loginResponse.json()).token;
    
    // Get customer subscription ID
    const customerLogin = await request.post(`${BASE_URL}/api/connect/login/customer`, {
      data: { email: CUSTOMER_EMAIL }
    });
    const subscriptionId = (await customerLogin.json()).user.subscription_id;
    
    // Adjust hours
    const adjustResponse = await request.post(`${BASE_URL}/api/connect/admin/hours-adjustment`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: {
        subscription_id: subscriptionId,
        hours_adjusted: 0.5,
        reason: 'TEST_E2E adjustment - compensacao'
      }
    });
    expect(adjustResponse.ok()).toBeTruthy();
    const adjustData = await adjustResponse.json();
    
    expect(adjustData.success).toBe(true);
    expect(adjustData.adjustment_id).toBeDefined();
    expect(adjustData.new_balance).toBeDefined();
  });

  test('Work logs list is accessible via API', async ({ request }) => {
    // Login as customer
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/customer`, {
      data: { email: CUSTOMER_EMAIL }
    });
    const token = (await loginResponse.json()).token;
    
    // Get work logs
    const logsResponse = await request.get(`${BASE_URL}/api/connect/work-logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(logsResponse.ok()).toBeTruthy();
    const logsData = await logsResponse.json();
    
    expect(logsData.work_logs).toBeDefined();
    expect(logsData.count).toBeDefined();
    
    // All logs should belong to the customer
    for (const log of logsData.work_logs) {
      expect(log.customer_email).toBe(CUSTOMER_EMAIL);
    }
  });

  test('Logout invalidates session via API', async ({ request }) => {
    // Login as customer
    const loginResponse = await request.post(`${BASE_URL}/api/connect/login/customer`, {
      data: { email: CUSTOMER_EMAIL }
    });
    const token = (await loginResponse.json()).token;
    
    // Verify token works
    const meResponse = await request.get(`${BASE_URL}/api/connect/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(meResponse.ok()).toBeTruthy();
    
    // Logout
    const logoutResponse = await request.post(`${BASE_URL}/api/connect/logout`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(logoutResponse.ok()).toBeTruthy();
    
    // Token should no longer work
    const meAfterLogout = await request.get(`${BASE_URL}/api/connect/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(meAfterLogout.status()).toBe(401);
  });
});
