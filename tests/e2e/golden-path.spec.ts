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

test.describe('Obelisco Radical - Golden Path', () => {
  test('complete user journey: browse services, add to cart, checkout, and select payment', async ({ page }) => {
    // Step 1: Load homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#hero')).toBeVisible();
    
    // Step 2: Navigate to services
    await page.getByTestId('nav-services').click();
    await expect(page.locator('#services')).toBeInViewport();
    
    // Step 3: Add multiple services to cart
    await page.getByTestId('add-service-instalacao').click();
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Close cart and add another service
    await page.getByTestId('close-cart-btn').click();
    await page.getByTestId('add-service-iluminacao').click();
    
    // Verify cart has 2 items
    await expect(page.getByTestId('cart-btn')).toContainText('(2)');
    
    // Step 4: Fill checkout form
    await page.getByTestId('customer-name-input').fill('Test Golden Path User');
    await page.getByTestId('customer-email-input').fill('golden@example.com');
    await page.getByTestId('customer-phone-input').fill('912345678');
    await page.getByTestId('customer-postal-input').fill('1000-001');
    await page.getByTestId('customer-address-input').fill('Rua Golden Path 123, Lisboa');
    await page.getByTestId('customer-notes-input').fill('Test order from golden path');
    
    // Select service type
    await page.getByTestId('service-type-select').selectOption('instalacao');
    
    // Select date and time
    const dateStr = getNextWeekday();
    await page.getByTestId('date-input').fill(dateStr);
    await page.getByTestId('time-select').selectOption('14:00');
    
    // Step 5: Proceed to payment
    await page.getByTestId('checkout-btn').click();
    
    // Step 6: Verify payment modal opens
    await expect(page.getByText('Forma de Pagamento')).toBeVisible();
    
    // Verify all payment options are available
    await expect(page.getByTestId('payment-card-btn')).toBeVisible();
    await expect(page.getByTestId('payment-transfer-btn')).toBeVisible();
    await expect(page.getByTestId('payment-whatsapp-btn')).toBeVisible();
    
    // Verify total is correct (45 + 25 + 35 travel fee = 105)
    await expect(page.getByText('Total a pagar')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'EUR105.00' })).toBeVisible();
    
    // Step 7: Test transfer payment flow
    await page.getByTestId('payment-transfer-btn').click();
    
    // Verify bank details are shown
    await expect(page.getByText('IBAN:')).toBeVisible();
    await expect(page.getByText(/PT50/)).toBeVisible();
    
    // Go back to payment options
    await page.getByText('← Voltar às opções').click();
    await expect(page.getByTestId('payment-card-btn')).toBeVisible();
    
    // Step 8: Test card payment initiation (Stripe redirect)
    await page.getByTestId('payment-card-btn').click();
    
    // Should show loading state
    await expect(page.getByText('A redirecionar para pagamento seguro')).toBeVisible();
    
    await page.screenshot({ path: 'golden-path-complete.jpeg', quality: 20 });
  });

  test('verify Stripe checkout session is created correctly', async ({ page, request }) => {
    // Test the backend API directly
    const response = await request.post('/api/stripe/create-checkout-session', {
      data: {
        amount: 100.00,
        currency: 'EUR',
        items: [
          { description: 'Test Service', quantity: 1, value: 100.00 }
        ],
        customer: {
          name: 'API Test User',
          email: 'api-test@example.com',
          phone: '911111111'
        },
        origin_url: 'https://obelisco-payments.preview.emergentagent.com'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.session_id).toMatch(/^cs_test_/);
    expect(data.checkout_url).toContain('checkout.stripe.com');
    expect(data.payment_id).toBeDefined();
    expect(data.order_id).toBeDefined();
  });

  test('verify payment methods API returns correct options', async ({ page, request }) => {
    const response = await request.get('/api/checkout/payment-methods');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.methods).toHaveLength(3);
    
    const codes = data.methods.map((m: any) => m.code);
    expect(codes).toContain('card');
    expect(codes).toContain('transfer');
    expect(codes).toContain('whatsapp');
  });

  test('verify Stripe config API returns publishable key', async ({ page, request }) => {
    const response = await request.get('/api/stripe/config');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.publishable_key).toMatch(/^pk_test_/);
  });
});
