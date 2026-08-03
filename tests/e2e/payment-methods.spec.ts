import { test, expect } from '@playwright/test';

// Helper to get next weekday
function getNextWeekday(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  
  // Skip to Monday if weekend
  while (date.getDay() === 0 || date.getDay() === 6) {
    date.setDate(date.getDate() + 1);
  }
  
  return date.toISOString().split('T')[0];
}

test.describe('Obelisco Radical - Payment Methods (Stripe Only)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Add a service and fill checkout form
    await page.getByTestId('add-service-instalacao').click();
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Fill checkout form
    await page.getByTestId('customer-name-input').fill('Test User');
    await page.getByTestId('customer-email-input').fill('test@example.com');
    await page.getByTestId('customer-phone-input').fill('911111111');
    await page.getByTestId('customer-postal-input').fill('1000-001');
    await page.getByTestId('customer-address-input').fill('Rua Test 123, Lisboa');
    await page.getByTestId('service-type-select').selectOption('instalacao');
    
    // Select date (next weekday)
    const dateStr = getNextWeekday();
    await page.getByTestId('date-input').fill(dateStr);
    await page.getByTestId('time-select').selectOption('10:00');
    
    // Click checkout button to open payment modal
    await page.getByTestId('checkout-btn').click();
    
    // Wait for payment modal - use heading role for specificity
    await expect(page.getByRole('heading', { name: 'Pagamento Seguro' })).toBeVisible();
  });

  test('payment modal shows only Stripe card payment option', async ({ page }) => {
    // Stripe card payment button should be visible
    await expect(page.getByTestId('payment-stripe-btn')).toBeVisible();
    await expect(page.getByText('Pagar com Cartão')).toBeVisible();
    
    // Transfer and WhatsApp options should NOT be visible in the modal
    await expect(page.getByTestId('payment-transfer-btn')).not.toBeVisible();
    await expect(page.getByTestId('payment-whatsapp-btn')).not.toBeVisible();
    
    await page.screenshot({ path: 'payment-stripe-only.jpeg', quality: 20 });
  });

  test('payment modal shows order total', async ({ page }) => {
    // Should show total amount
    await expect(page.getByText('Total a pagar')).toBeVisible();
    
    // Should show EUR amount in the payment modal - use paragraph filter
    // Instalacao = EUR45 + Travel fee EUR35 = EUR80
    await expect(page.getByRole('paragraph').filter({ hasText: 'EUR80.00' })).toBeVisible();
    
    await page.screenshot({ path: 'payment-total.jpeg', quality: 20 });
  });

  test('payment modal shows accepted card brands', async ({ page }) => {
    // Should show accepted card brands
    await expect(page.getByText('Aceitamos:')).toBeVisible();
    await expect(page.getByText('Visa')).toBeVisible();
    await expect(page.getByText('Mastercard')).toBeVisible();
    await expect(page.getByText('Amex')).toBeVisible();
    
    await page.screenshot({ path: 'payment-cards.jpeg', quality: 20 });
  });

  test('card payment redirects to Stripe checkout', async ({ page }) => {
    // Click Stripe payment button
    await page.getByTestId('payment-stripe-btn').click();
    
    // Should show loading state
    await expect(page.getByText('A redirecionar para pagamento seguro')).toBeVisible();
    
    // Wait for redirect to Stripe (or timeout)
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'stripe-redirect.jpeg', quality: 20 });
  });

  test('payment modal shows Stripe branding', async ({ page }) => {
    // Should show Stripe branding - use first() to avoid strict mode
    await expect(page.getByText('Pagamento seguro processado pelo Stripe').first()).toBeVisible();
    
    await page.screenshot({ path: 'stripe-branding.jpeg', quality: 20 });
  });
});
