import { test, expect } from '@playwright/test';

test.describe('Customer Portal - Area Cliente', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('navigation has Area Cliente button', async ({ page }) => {
    // Check navigation has Area Cliente button
    await expect(page.getByTestId('customer-portal-btn')).toBeVisible();
    await expect(page.getByTestId('customer-portal-btn')).toContainText('Area Cliente');
    
    await page.screenshot({ path: 'customer-portal-nav.jpeg', quality: 20 });
  });

  test('clicking Area Cliente opens customer portal modal', async ({ page }) => {
    // Click Area Cliente button
    await page.getByTestId('customer-portal-btn').click();
    
    // Modal should open
    await expect(page.getByText('Area de Cliente')).toBeVisible();
    await expect(page.getByText('Aceda as suas subscricoes e pedidos')).toBeVisible();
    
    await page.screenshot({ path: 'customer-portal-modal.jpeg', quality: 20 });
  });

  test('customer portal has email input field', async ({ page }) => {
    // Open customer portal
    await page.getByTestId('customer-portal-btn').click();
    
    // Email input should be visible
    await expect(page.getByTestId('portal-email-input')).toBeVisible();
    await expect(page.getByText('Email da subscricao')).toBeVisible();
    
    // Access button should be visible
    await expect(page.getByRole('button', { name: 'Aceder' })).toBeVisible();
  });

  test('customer portal shows no subscriptions message for unknown email', async ({ page }) => {
    // Open customer portal
    await page.getByTestId('customer-portal-btn').click();
    
    // Enter email and submit
    await page.getByTestId('portal-email-input').fill('nonexistent@example.com');
    await page.getByRole('button', { name: 'Aceder' }).click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Should show no subscriptions message
    await expect(page.getByText('Nenhuma subscricao encontrada')).toBeVisible();
    
    // Should show link to plans
    await expect(page.getByRole('button', { name: 'Ver Planos Disponiveis' })).toBeVisible();
    
    await page.screenshot({ path: 'customer-portal-no-subs.jpeg', quality: 20 });
  });

  test('customer portal can be closed', async ({ page }) => {
    // Open customer portal
    await page.getByTestId('customer-portal-btn').click();
    
    // Modal should be visible
    await expect(page.getByText('Area de Cliente')).toBeVisible();
    
    // Close modal using X button
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first().click();
    
    // Modal should be closed
    await expect(page.getByText('Area de Cliente')).not.toBeVisible();
  });

  test('Ver Planos Disponiveis button navigates to plans section', async ({ page }) => {
    // Open customer portal
    await page.getByTestId('customer-portal-btn').click();
    
    // Enter email and submit
    await page.getByTestId('portal-email-input').fill('nonexistent@example.com');
    await page.getByRole('button', { name: 'Aceder' }).click();
    
    // Wait for API response
    await page.waitForTimeout(1000);
    
    // Click Ver Planos Disponiveis
    await page.getByRole('button', { name: 'Ver Planos Disponiveis' }).click();
    
    // Should navigate to obelisco-care section
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    await page.screenshot({ path: 'customer-portal-to-plans.jpeg', quality: 20 });
  });
});
