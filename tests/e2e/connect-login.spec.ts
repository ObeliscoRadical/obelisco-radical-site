import { test, expect } from '@playwright/test';

test.describe('Obelisco Connect - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any stored auth data
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('connect_token');
      localStorage.removeItem('connect_user');
    });
  });

  test('should load /connect page with login form', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Check page title/logo
    await expect(page.getByText('Obelisco Connect').first()).toBeVisible();
    await expect(page.getByText('Aceda a sua conta')).toBeVisible();
    
    // Check login type toggle buttons
    await expect(page.getByRole('button', { name: 'Cliente' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Equipa / Admin' })).toBeVisible();
    
    // Check email input
    await expect(page.getByTestId('connect-email-input')).toBeVisible();
    
    // Check submit button
    await expect(page.getByTestId('connect-login-btn')).toBeVisible();
    
    // Check back link
    await expect(page.getByText('← Voltar ao site')).toBeVisible();
    
    await page.screenshot({ path: 'connect-login-page.jpeg', quality: 20 });
  });

  test('should toggle between Cliente and Equipa/Admin modes', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Default is Cliente - no password field
    await expect(page.getByTestId('connect-password-input')).not.toBeVisible();
    
    // Click Equipa / Admin
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    
    // Password field should appear
    await expect(page.getByTestId('connect-password-input')).toBeVisible();
    
    await page.screenshot({ path: 'connect-staff-mode.jpeg', quality: 20 });
    
    // Click back to Cliente
    await page.getByRole('button', { name: 'Cliente' }).click();
    
    // Password field should disappear
    await expect(page.getByTestId('connect-password-input')).not.toBeVisible();
  });

  test('should login as customer with valid email', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Enter customer email
    await page.getByTestId('connect-email-input').fill('teste.obelisco@gmail.com');
    
    // Click login button
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for redirect (successful login redirects to /connect/client)
    await page.waitForURL(/\/connect\/client/, { timeout: 10000 });
    
    await page.screenshot({ path: 'connect-customer-logged-in.jpeg', quality: 20 });
  });

  test('should show error for invalid customer email', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Enter invalid email
    await page.getByTestId('connect-email-input').fill('invalid@email.com');
    
    // Click login button
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for error message
    await expect(page.getByText('Nenhuma subscricao ativa encontrada')).toBeVisible();
    
    await page.screenshot({ path: 'connect-customer-error.jpeg', quality: 20 });
  });

  test('should login as admin with valid credentials', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Switch to staff mode
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    
    // Enter admin credentials
    await page.getByTestId('connect-email-input').fill('admin@obelisco.pt');
    await page.getByTestId('connect-password-input').fill('admin123');
    
    // Click login button
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for redirect (successful login redirects to /connect/admin)
    await page.waitForURL(/\/connect\/admin/, { timeout: 10000 });
    
    await page.screenshot({ path: 'connect-admin-logged-in.jpeg', quality: 20 });
  });

  test('should login as technician with valid credentials', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Switch to staff mode
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    
    // Enter technician credentials
    await page.getByTestId('connect-email-input').fill('tecnico@obelisco.pt');
    await page.getByTestId('connect-password-input').fill('tech123');
    
    // Click login button
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for redirect (successful login redirects to /connect/tech)
    await page.waitForURL(/\/connect\/tech/, { timeout: 10000 });
    
    await page.screenshot({ path: 'connect-technician-logged-in.jpeg', quality: 20 });
  });

  test('should show error for invalid staff credentials', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Switch to staff mode
    await page.getByRole('button', { name: 'Equipa / Admin' }).click();
    
    // Enter invalid credentials
    await page.getByTestId('connect-email-input').fill('admin@obelisco.pt');
    await page.getByTestId('connect-password-input').fill('wrongpassword');
    
    // Click login button
    await page.getByTestId('connect-login-btn').click();
    
    // Wait for error message
    await expect(page.getByText('Credenciais invalidas')).toBeVisible();
    
    await page.screenshot({ path: 'connect-staff-error.jpeg', quality: 20 });
  });
});
