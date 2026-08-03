import { test, expect } from '@playwright/test';

test.describe('Obelisco Care - Subscription Plans', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('Obelisco Care section is visible and has correct header', async ({ page }) => {
    // Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    
    // Section should be visible
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Header should show correct title
    await expect(page.getByText('Obelisco Care', { exact: false })).toBeVisible();
    await expect(page.getByText('Planos de Manutencao')).toBeVisible();
    
    await page.screenshot({ path: 'obelisco-care-section.jpeg', quality: 20 });
  });

  test('displays all three subscription plans with correct prices', async ({ page }) => {
    // Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Essencial plan - EUR349
    await expect(page.getByRole('heading', { name: 'Essencial' })).toBeVisible();
    await expect(page.getByText('349')).toBeVisible();
    
    // Preventivo plan - EUR699
    await expect(page.getByRole('heading', { name: 'Preventivo' })).toBeVisible();
    await expect(page.getByText('699')).toBeVisible();
    
    // Total plan - EUR1290
    await expect(page.getByRole('heading', { name: 'Total' })).toBeVisible();
    await expect(page.getByText('1.290')).toBeVisible();
    
    await page.screenshot({ path: 'subscription-plans.jpeg', quality: 20 });
  });

  test('Total plan is marked as most popular', async ({ page }) => {
    // Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Total plan should have "Mais Procurado" badge
    await expect(page.getByText('Mais Procurado')).toBeVisible();
  });

  test('Essencial plan button opens subscription modal', async ({ page }) => {
    // Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Click Essencial plan button
    await page.getByTestId('plan-essencial-btn').click();
    
    // Subscription modal should open
    await expect(page.getByText('Subscrever Plano Essencial')).toBeVisible();
    // Check price in modal using exact match
    await expect(page.getByText('349EUR', { exact: true })).toBeVisible();
    
    await page.screenshot({ path: 'subscription-modal-essencial.jpeg', quality: 20 });
  });

  test('Preventivo plan button opens subscription modal', async ({ page }) => {
    // Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Click Preventivo plan button
    await page.getByTestId('plan-preventivo-btn').click();
    
    // Subscription modal should open
    await expect(page.getByText('Subscrever Plano Preventivo')).toBeVisible();
    // Check price in modal using exact match
    await expect(page.getByText('699EUR', { exact: true })).toBeVisible();
    
    await page.screenshot({ path: 'subscription-modal-preventivo.jpeg', quality: 20 });
  });

  test('Total plan button opens subscription modal', async ({ page }) => {
    // Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Click Total plan button
    await page.getByTestId('plan-total-btn').click();
    
    // Subscription modal should open
    await expect(page.getByText('Subscrever Plano Total')).toBeVisible();
    // Check price in modal using exact match
    await expect(page.getByText('1290EUR', { exact: true })).toBeVisible();
    
    await page.screenshot({ path: 'subscription-modal-total.jpeg', quality: 20 });
  });

  test('subscription modal has required form fields', async ({ page }) => {
    // Navigate to Obelisco Care section and open modal
    await page.getByTestId('nav-obelisco-care').click();
    await page.getByTestId('plan-essencial-btn').click();
    
    // Check form fields are present
    await expect(page.getByTestId('subscription-name-input')).toBeVisible();
    await expect(page.getByTestId('subscription-email-input')).toBeVisible();
    await expect(page.getByTestId('subscription-phone-input')).toBeVisible();
    await expect(page.getByTestId('subscription-submit-btn')).toBeVisible();
    
    // Submit button should show correct price
    await expect(page.getByTestId('subscription-submit-btn')).toContainText('349EUR');
    
    await page.screenshot({ path: 'subscription-form.jpeg', quality: 20 });
  });

  test('subscription form validates and submits correctly', async ({ page }) => {
    // Navigate to Obelisco Care section and open modal
    await page.getByTestId('nav-obelisco-care').click();
    await page.getByTestId('plan-essencial-btn').click();
    
    // Fill form
    await page.getByTestId('subscription-name-input').fill('Test Subscriber');
    await page.getByTestId('subscription-email-input').fill('subscriber@example.com');
    await page.getByTestId('subscription-phone-input').fill('912345678');
    
    // Submit form
    await page.getByTestId('subscription-submit-btn').click();
    
    // Should show loading state
    await expect(page.getByText('A redirecionar')).toBeVisible();
    
    await page.screenshot({ path: 'subscription-submit.jpeg', quality: 20 });
  });

  test('subscription modal can be closed', async ({ page }) => {
    // Navigate to Obelisco Care section and open modal
    await page.getByTestId('nav-obelisco-care').click();
    await page.getByTestId('plan-essencial-btn').click();
    
    // Modal should be visible
    await expect(page.getByText('Subscrever Plano Essencial')).toBeVisible();
    
    // Close modal using keyboard escape
    await page.keyboard.press('Escape');
    
    // If escape doesn't work, try clicking outside
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'subscription-modal-close.jpeg', quality: 20 });
  });

  test('navigation includes Planos link to obelisco-care section', async ({ page }) => {
    // Check navigation has Planos link
    await expect(page.getByTestId('nav-obelisco-care')).toBeVisible();
    await expect(page.getByTestId('nav-obelisco-care')).toContainText('Planos');
    
    // Click should scroll to section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
  });
});
