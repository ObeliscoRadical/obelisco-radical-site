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

test.describe('Obelisco Radical - Payment Methods', () => {
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
    
    // Wait for payment modal
    await expect(page.getByText('Forma de Pagamento')).toBeVisible();
  });

  test('payment modal displays all payment options', async ({ page }) => {
    // Card payment option
    await expect(page.getByTestId('payment-card-btn')).toBeVisible();
    await expect(page.getByText('Cartão de Crédito/Débito')).toBeVisible();
    
    // Transfer option
    await expect(page.getByTestId('payment-transfer-btn')).toBeVisible();
    await expect(page.getByText('Transferência Bancária').first()).toBeVisible();
    
    // WhatsApp option
    await expect(page.getByTestId('payment-whatsapp-btn')).toBeVisible();
    await expect(page.getByText('Pagar via WhatsApp')).toBeVisible();
    
    await page.screenshot({ path: 'payment-options.jpeg', quality: 20 });
  });

  test('payment modal shows order total', async ({ page }) => {
    // Should show total amount
    await expect(page.getByText('Total a pagar')).toBeVisible();
    
    // Should show EUR amount in the payment modal
    // Instalacao = EUR45 + Travel fee EUR35 = EUR80
    // Use the paragraph element in the modal
    await expect(page.getByRole('paragraph').filter({ hasText: 'EUR80.00' })).toBeVisible();
    
    await page.screenshot({ path: 'payment-total.jpeg', quality: 20 });
  });

  test('card payment redirects to Stripe checkout', async ({ page }) => {
    // Click card payment button
    await page.getByTestId('payment-card-btn').click();
    
    // Should show loading state
    await expect(page.getByText('A redirecionar para pagamento seguro')).toBeVisible();
    
    // Wait for redirect to Stripe (or timeout)
    // Note: We can't fully test Stripe redirect in E2E, but we verify the flow starts
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'stripe-redirect.jpeg', quality: 20 });
  });

  test('transfer payment shows bank details', async ({ page }) => {
    // Click transfer payment button
    await page.getByTestId('payment-transfer-btn').click();
    
    // Should show bank transfer details
    await expect(page.getByText('IBAN:')).toBeVisible();
    await expect(page.getByText(/PT50/)).toBeVisible();
    await expect(page.getByText('Obelisco Radical Unipessoal Lda')).toBeVisible();
    
    // Should show WhatsApp link to send receipt
    await expect(page.getByText('Enviar comprovativo via WhatsApp')).toBeVisible();
    
    await page.screenshot({ path: 'transfer-details.jpeg', quality: 20 });
  });

  test('transfer payment has back button', async ({ page }) => {
    // Click transfer payment button
    await page.getByTestId('payment-transfer-btn').click();
    
    // Should show back button
    await expect(page.getByText('← Voltar às opções')).toBeVisible();
    
    // Click back button
    await page.getByText('← Voltar às opções').click();
    
    // Should show payment options again
    await expect(page.getByTestId('payment-card-btn')).toBeVisible();
    
    await page.screenshot({ path: 'transfer-back.jpeg', quality: 20 });
  });

  test('payment modal shows Stripe branding', async ({ page }) => {
    // Should show Stripe branding - use first() to avoid strict mode
    await expect(page.getByText('Pagamento seguro processado pelo Stripe').first()).toBeVisible();
    
    await page.screenshot({ path: 'stripe-branding.jpeg', quality: 20 });
  });
});
