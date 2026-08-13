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
  test('complete user journey: browse services, add to cart, checkout with Stripe', async ({ page }) => {
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
    
    // Step 6: Verify payment modal opens with Stripe only - use heading role
    await expect(page.getByRole('heading', { name: 'Pagamento Seguro' })).toBeVisible();
    
    // Only Stripe card payment should be available
    await expect(page.getByTestId('payment-stripe-btn')).toBeVisible();
    await expect(page.getByText('Pagar com Cartão')).toBeVisible();
    
    // Transfer and WhatsApp should NOT be visible
    await expect(page.getByTestId('payment-transfer-btn')).not.toBeVisible();
    await expect(page.getByTestId('payment-whatsapp-btn')).not.toBeVisible();
    
    // Verify total is correct (45 + 25 + 35 travel fee = 105)
    await expect(page.getByText('Total a pagar')).toBeVisible();
    await expect(page.getByRole('paragraph').filter({ hasText: 'EUR105.00' })).toBeVisible();
    
    // Step 7: Test Stripe payment initiation
    await page.getByTestId('payment-stripe-btn').click();
    
    // Should show loading state
    await expect(page.getByText('A redirecionar para pagamento seguro')).toBeVisible();
    
    await page.screenshot({ path: 'golden-path-complete.jpeg', quality: 20 });
  });

  test('subscription journey: browse plans, select plan, fill form, submit', async ({ page }) => {
    // Step 1: Load homepage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Step 2: Navigate to Obelisco Care section
    await page.getByTestId('nav-obelisco-care').click();
    await expect(page.locator('#obelisco-care')).toBeInViewport();
    
    // Step 3: Verify all plans are visible
    await expect(page.getByRole('heading', { name: 'Essencial' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Preventivo' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Total' })).toBeVisible();
    
    // Step 4: Select Total plan (most popular)
    await page.getByTestId('plan-total-btn').click();
    
    // Step 5: Verify subscription modal opens
    await expect(page.getByText('Subscrever Plano Total')).toBeVisible();
    // Price format is "1,290EUR" with comma
    await expect(page.getByTestId('subscription-submit-btn')).toContainText('1,290EUR');
    
    // Step 6: Fill subscription form
    await page.getByTestId('subscription-name-input').fill('Test Subscriber');
    await page.getByTestId('subscription-email-input').fill('subscriber@example.com');
    await page.getByTestId('subscription-phone-input').fill('912345678');
    
    // Step 7: Submit form
    await page.getByTestId('subscription-submit-btn').click();
    
    // Should show loading state
    await expect(page.getByText('A redirecionar')).toBeVisible();
    
    await page.screenshot({ path: 'subscription-journey-complete.jpeg', quality: 20 });
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
        origin_url: 'https://obelisco-carousel.preview.emergentagent.com'
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

  test('verify subscription session is created correctly', async ({ page, request }) => {
    // Test the subscription API directly
    const response = await request.post('/api/stripe/create-subscription-session', {
      data: {
        lookup_key: 'essencial_monthly',
        customer_email: 'api-test@example.com',
        customer_name: 'API Test User',
        customer_phone: '911111111',
        origin_url: 'https://obelisco-carousel.preview.emergentagent.com'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.session_id).toMatch(/^cs_test_/);
    expect(data.checkout_url).toContain('checkout.stripe.com');
    expect(data.plan).toBe('essencial_monthly');
    expect(data.amount).toBe(349);
  });

  test('verify subscription plans API returns correct data with monthly and annual pricing', async ({ page, request }) => {
    const response = await request.get('/api/stripe/plans');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.plans).toHaveLength(3);
    
    const planIds = data.plans.map((p: any) => p.id);
    expect(planIds).toContain('essencial');
    expect(planIds).toContain('preventivo');
    expect(planIds).toContain('total');
    
    // Verify monthly prices (new structure: pricing.monthly.price)
    const essencial = data.plans.find((p: any) => p.id === 'essencial');
    expect(essencial.pricing.monthly.price).toBe(349);
    expect(essencial.pricing.annual.price).toBe(3490);
    expect(essencial.pricing.annual.savings).toBe(698);
    
    const preventivo = data.plans.find((p: any) => p.id === 'preventivo');
    expect(preventivo.pricing.monthly.price).toBe(699);
    expect(preventivo.pricing.annual.price).toBe(6990);
    
    const total = data.plans.find((p: any) => p.id === 'total');
    expect(total.pricing.monthly.price).toBe(1290);
    expect(total.pricing.annual.price).toBe(12900);
    expect(total.popular).toBe(true);
  });

  test('verify Stripe config API returns publishable key', async ({ page, request }) => {
    const response = await request.get('/api/stripe/config');
    
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.publishable_key).toMatch(/^pk_test_/);
  });
});
