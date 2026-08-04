import { test, expect } from '@playwright/test';

// Test credentials
const CUSTOMER_EMAIL = 'teste.obelisco@gmail.com';
const ADMIN_EMAIL = 'admin@obelisco.pt';
const ADMIN_PASSWORD = 'admin123';
const TECH_EMAIL = 'tecnico@obelisco.pt';
const TECH_PASSWORD = 'tech123';

test.describe('Obelisco Connect - Client Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth and go to login
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('connect_token');
      localStorage.removeItem('connect_user');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('should login as customer and redirect to /connect/client', async ({ page }) => {
    // Fill email and login
    await page.getByTestId('connect-email-input').fill(CUSTOMER_EMAIL);
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for redirect
    await page.waitForURL('**/connect/client', { timeout: 15000 });
    expect(page.url()).toContain('/connect/client');
    
    // Verify dashboard loaded
    await expect(page.getByText('Area do Cliente')).toBeVisible();
    await page.screenshot({ path: 'client-dashboard-loaded.jpeg', quality: 20 });
  });

  test('should display hours balance with progress bar', async ({ page }) => {
    // Login
    await page.getByTestId('connect-email-input').fill(CUSTOMER_EMAIL);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/client', { timeout: 15000 });
    
    // Check hours section
    await expect(page.getByText('Saldo de Horas')).toBeVisible();
    await expect(page.getByText('Incluidas/mes')).toBeVisible();
    await expect(page.getByText('Disponiveis')).toBeVisible();
    await expect(page.getByText('Utilizadas')).toBeVisible();
    
    await page.screenshot({ path: 'client-hours-balance.jpeg', quality: 20 });
  });

  test('should open new request modal', async ({ page }) => {
    // Login
    await page.getByTestId('connect-email-input').fill(CUSTOMER_EMAIL);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/client', { timeout: 15000 });
    
    // Click new request button
    await page.getByTestId('new-request-btn').click();
    
    // Verify modal opened
    await expect(page.getByText('Novo Pedido de Servico')).toBeVisible();
    await expect(page.getByTestId('request-type')).toBeVisible();
    await expect(page.getByTestId('request-description')).toBeVisible();
    
    await page.screenshot({ path: 'client-new-request-form.jpeg', quality: 20 });
  });

  test('should navigate through tabs', async ({ page }) => {
    // Login
    await page.getByTestId('connect-email-input').fill(CUSTOMER_EMAIL);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/client', { timeout: 15000 });
    
    // Test Overview tab (default)
    await expect(page.getByTestId('tab-overview')).toBeVisible();
    await expect(page.getByText('Pedidos Recentes')).toBeVisible();
    
    // Test Requests tab
    await page.getByTestId('tab-requests').click();
    await expect(page.getByText('Todos os Pedidos')).toBeVisible();
    
    // Test History tab
    await page.getByTestId('tab-history').click();
    await expect(page.getByText('Historico de Intervencoes')).toBeVisible();
    
    // Test Settings tab
    await page.getByTestId('tab-settings').click();
    await expect(page.getByText('Dados da Conta')).toBeVisible();
    
    await page.screenshot({ path: 'client-tabs-navigation.jpeg', quality: 20 });
  });

  test('should logout and redirect to login page', async ({ page }) => {
    // Login
    await page.getByTestId('connect-email-input').fill(CUSTOMER_EMAIL);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/client', { timeout: 15000 });
    
    // Click logout
    await page.getByTestId('logout-btn').click();
    
    // Verify redirect to login
    await page.waitForURL('**/connect', { timeout: 5000 });
    await expect(page.getByTestId('connect-login-btn')).toBeVisible();
    
    // Verify localStorage cleared
    const token = await page.evaluate(() => localStorage.getItem('connect_token'));
    expect(token).toBeNull();
  });
});

test.describe('Obelisco Connect - Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth and go to login
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('connect_token');
      localStorage.removeItem('connect_user');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('should login as admin and redirect to /connect/admin', async ({ page }) => {
    // Switch to staff mode
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    
    // Fill credentials
    await page.getByTestId('connect-email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('connect-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for redirect
    await page.waitForURL('**/connect/admin', { timeout: 15000 });
    expect(page.url()).toContain('/connect/admin');
    
    // Verify dashboard loaded
    await expect(page.getByText('Painel Administrativo')).toBeVisible();
    await page.screenshot({ path: 'admin-dashboard-loaded.jpeg', quality: 20 });
  });

  test('should display stats cards', async ({ page }) => {
    // Login as admin
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('connect-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/admin', { timeout: 15000 });
    
    // Check stats cards
    await expect(page.getByText('Subscricoes Ativas')).toBeVisible();
    await expect(page.getByText('Pedidos Pendentes')).toBeVisible();
    await expect(page.getByText('Tecnicos')).toBeVisible();
    await expect(page.getByText('Trabalhos Concluidos')).toBeVisible();
    
    await page.screenshot({ path: 'admin-stats-cards.jpeg', quality: 20 });
  });

  test('should navigate through admin tabs', async ({ page }) => {
    // Login as admin
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('connect-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/admin', { timeout: 15000 });
    
    // Test Overview tab (default)
    await expect(page.getByTestId('admin-tab-overview')).toBeVisible();
    
    // Test Requests tab
    await page.getByTestId('admin-tab-requests').click();
    await expect(page.getByText('Todos os Pedidos')).toBeVisible();
    
    // Test Technicians tab
    await page.getByTestId('admin-tab-technicians').click();
    await expect(page.getByText('Gestao de Tecnicos')).toBeVisible();
    
    // Test Subscriptions tab
    await page.getByTestId('admin-tab-subscriptions').click();
    await expect(page.getByText('Todas as Subscricoes')).toBeVisible();
    
    // Test Adjustments tab
    await page.getByTestId('admin-tab-adjustments').click();
    await expect(page.getByText('Historico de Ajustes de Horas')).toBeVisible();
    
    await page.screenshot({ path: 'admin-tabs-navigation.jpeg', quality: 20 });
  });

  test('should open new technician modal', async ({ page }) => {
    // Login as admin
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('connect-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/admin', { timeout: 15000 });
    
    // Go to technicians tab
    await page.getByTestId('admin-tab-technicians').click();
    
    // Click add technician button
    await page.getByTestId('add-tech-btn').click();
    
    // Verify modal opened
    await expect(page.getByText('Novo Tecnico')).toBeVisible();
    await expect(page.getByTestId('tech-name')).toBeVisible();
    await expect(page.getByTestId('tech-email')).toBeVisible();
    await expect(page.getByTestId('tech-password')).toBeVisible();
    
    await page.screenshot({ path: 'admin-new-tech-modal.jpeg', quality: 20 });
  });

  test('should logout admin and redirect to login', async ({ page }) => {
    // Login as admin
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('connect-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/admin', { timeout: 15000 });
    
    // Click logout
    await page.getByTestId('admin-logout-btn').click();
    
    // Verify redirect to login
    await page.waitForURL('**/connect', { timeout: 5000 });
    await expect(page.getByTestId('connect-login-btn')).toBeVisible();
  });
});

test.describe('Obelisco Connect - Tech Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth and go to login
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('connect_token');
      localStorage.removeItem('connect_user');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('should login as technician and redirect to /connect/tech', async ({ page }) => {
    // Switch to staff mode
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    
    // Fill credentials
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for redirect
    await page.waitForURL('**/connect/tech', { timeout: 15000 });
    expect(page.url()).toContain('/connect/tech');
    
    // Verify dashboard loaded
    await expect(page.getByText('Area do Tecnico')).toBeVisible();
    await page.screenshot({ path: 'tech-dashboard-loaded.jpeg', quality: 20 });
  });

  test('should display assigned jobs list', async ({ page }) => {
    // Login as technician
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/tech', { timeout: 15000 });
    
    // Check jobs tab is active by default
    await expect(page.getByTestId('tech-tab-jobs')).toBeVisible();
    await expect(page.getByText('Trabalhos Atribuidos')).toBeVisible();
    
    await page.screenshot({ path: 'tech-jobs-list.jpeg', quality: 20 });
  });

  test('should display stats cards', async ({ page }) => {
    // Login as technician
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/tech', { timeout: 15000 });
    
    // Check stats
    await expect(page.getByText('Pendentes')).toBeVisible();
    await expect(page.getByText('Em Curso')).toBeVisible();
    await expect(page.getByText('Concluidos Hoje')).toBeVisible();
    
    await page.screenshot({ path: 'tech-stats-cards.jpeg', quality: 20 });
  });

  test('should navigate through tech tabs', async ({ page }) => {
    // Login as technician
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/tech', { timeout: 15000 });
    
    // Test Jobs tab (default)
    await expect(page.getByTestId('tech-tab-jobs')).toBeVisible();
    
    // Test History tab
    await page.getByTestId('tech-tab-history').click();
    await expect(page.getByText('Work Logs Recentes')).toBeVisible();
    
    // Test Profile tab
    await page.getByTestId('tech-tab-profile').click();
    await expect(page.getByText('Dados do Perfil')).toBeVisible();
    
    await page.screenshot({ path: 'tech-tabs-navigation.jpeg', quality: 20 });
  });

  test('should start job and show timer interface if jobs available', async ({ page }) => {
    // Login as technician
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/tech', { timeout: 15000 });
    
    // Find a job to start (if any assigned)
    const startBtn = page.locator('[data-testid^="start-job-"]').first();
    const hasJobs = await startBtn.isVisible().catch(() => false);
    
    if (hasJobs) {
      await startBtn.click();
      
      // Verify timer interface
      await expect(page.getByTestId('service-timer')).toBeVisible();
      await expect(page.getByText('TEMPO DE SERVICO')).toBeVisible();
      
      // Verify checklist is visible
      await expect(page.getByText('Checklist de Servico')).toBeVisible();
      
      // Verify photo/video upload buttons
      await expect(page.getByTestId('add-photo')).toBeVisible();
      await expect(page.getByTestId('add-video')).toBeVisible();
      
      await page.screenshot({ path: 'tech-job-timer.jpeg', quality: 20 });
    } else {
      // No jobs assigned - verify the list is shown
      await page.screenshot({ path: 'tech-no-jobs.jpeg', quality: 20 });
    }
  });

  test('should logout technician and redirect to login', async ({ page }) => {
    // Login as technician
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    await page.waitForURL('**/connect/tech', { timeout: 15000 });
    
    // Click logout
    await page.getByTestId('tech-logout-btn').click();
    
    // Verify redirect to login
    await page.waitForURL('**/connect', { timeout: 5000 });
    await expect(page.getByTestId('connect-login-btn')).toBeVisible();
  });
});

test.describe('Obelisco Connect - Role-based Redirects', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth and go to login
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('connect_token');
      localStorage.removeItem('connect_user');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('customer role redirects to /connect/client', async ({ page }) => {
    await page.getByTestId('connect-email-input').fill(CUSTOMER_EMAIL);
    await page.getByTestId('connect-login-btn').click();
    
    await page.waitForURL('**/connect/client');
    expect(page.url()).toContain('/connect/client');
  });

  test('technician role redirects to /connect/tech', async ({ page }) => {
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(TECH_EMAIL);
    await page.getByTestId('connect-password-input').fill(TECH_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    
    await page.waitForURL('**/connect/tech');
    expect(page.url()).toContain('/connect/tech');
  });

  test('admin role redirects to /connect/admin', async ({ page }) => {
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    await page.getByTestId('connect-email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('connect-password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('connect-login-btn').click();
    
    await page.waitForURL('**/connect/admin');
    expect(page.url()).toContain('/connect/admin');
  });
});
