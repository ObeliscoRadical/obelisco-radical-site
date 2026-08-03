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

test.describe('Customer Portal - Test Credentials (teste.obelisco@gmail.com)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
  });

  test('test email returns active subscription with correct plan', async ({ page }) => {
    // Open customer portal
    await page.getByTestId('customer-portal-btn').click();
    await expect(page.getByText('Area de Cliente')).toBeVisible();
    
    // Enter test email
    await page.getByTestId('portal-email-input').fill('teste.obelisco@gmail.com');
    await page.getByRole('button', { name: 'Aceder' }).click();
    
    // Wait for subscription to load
    await page.waitForTimeout(2000);
    
    // Verify subscription is displayed with correct plan
    await expect(page.getByText('Plano Total')).toBeVisible();
    
    // Verify status shows as "Ativo"
    await expect(page.getByText('Ativo')).toBeVisible();
    
    // Verify hours display (3.5h / 12h)
    await expect(page.getByText('3.5h / 12h')).toBeVisible();
    
    // Verify price shows correctly
    await expect(page.getByText('1290EUR/mes')).toBeVisible();
    
    await page.screenshot({ path: 'test-credentials-subscription.jpeg', quality: 20 });
  });

  test('subscription details show correct hours available', async ({ page }) => {
    // Open customer portal and login
    await page.getByTestId('customer-portal-btn').click();
    await page.getByTestId('portal-email-input').fill('teste.obelisco@gmail.com');
    await page.getByRole('button', { name: 'Aceder' }).click();
    await page.waitForTimeout(2000);
    
    // Click on subscription to view details
    await page.getByText('Plano Total').click();
    await page.waitForTimeout(1000);
    
    // Verify hours available (8.5h of 12h)
    await expect(page.getByText('8.5h')).toBeVisible();
    await expect(page.getByText('disponiveis de 12h')).toBeVisible();
    
    // Verify action buttons
    await expect(page.getByText('Pedir Intervencao')).toBeVisible();
    await expect(page.getByText('Gerir Pagamento')).toBeVisible();
    
    await page.screenshot({ path: 'test-credentials-details.jpeg', quality: 20 });
  });

  test('can access intervention request form', async ({ page }) => {
    // Open customer portal and login
    await page.getByTestId('customer-portal-btn').click();
    await page.getByTestId('portal-email-input').fill('teste.obelisco@gmail.com');
    await page.getByRole('button', { name: 'Aceder' }).click();
    await page.waitForTimeout(2000);
    
    // Click on subscription
    await page.getByText('Plano Total').click();
    await page.waitForTimeout(1000);
    
    // Click on "Pedir Intervencao" button
    await page.getByText('Pedir Intervencao').click();
    await page.waitForTimeout(500);
    
    // Verify intervention form is visible
    await expect(page.getByText('Novo Pedido de Intervencao')).toBeVisible();
    await expect(page.getByText('Descricao do problema')).toBeVisible();
    
    await page.screenshot({ path: 'test-credentials-intervention-form.jpeg', quality: 20 });
  });

  test('shows recent interventions', async ({ page }) => {
    // Open customer portal and login
    await page.getByTestId('customer-portal-btn').click();
    await page.getByTestId('portal-email-input').fill('teste.obelisco@gmail.com');
    await page.getByRole('button', { name: 'Aceder' }).click();
    await page.waitForTimeout(2000);
    
    // Verify recent interventions section is visible
    await expect(page.getByText('Pedidos de intervencao recentes')).toBeVisible();
    
    // Verify scheduled intervention is shown
    await expect(page.getByText('scheduled')).toBeVisible();
    
    await page.screenshot({ path: 'test-credentials-interventions.jpeg', quality: 20 });
  });
});
