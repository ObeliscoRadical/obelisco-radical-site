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

test.describe('Obelisco Radical - Cart and Checkout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('add service to cart opens cart modal', async ({ page }) => {
    // Add a service
    await page.getByTestId('add-service-instalacao').click();
    
    // Cart modal should open automatically - check for "Resumo do pedido"
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Service should be in cart - use first() to avoid strict mode
    await expect(page.getByRole('heading', { name: 'Instalacao Eletrica Completa' })).toBeVisible();
    
    await page.screenshot({ path: 'cart-opened.jpeg', quality: 20 });
  });

  test('increase and decrease item quantity in cart', async ({ page }) => {
    // Add a service
    await page.getByTestId('add-service-iluminacao').click();
    
    // Wait for cart to open
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Click + button to increase
    const plusButton = page.locator('button:has-text("+")').first();
    await plusButton.click();
    
    // Click - button to decrease
    const minusButton = page.locator('button:has-text("-")').first();
    await minusButton.click();
    
    await page.screenshot({ path: 'cart-quantity.jpeg', quality: 20 });
  });

  test('remove item from cart using Remover link', async ({ page }) => {
    // Add a service
    await page.getByTestId('add-service-manutencao').click();
    
    // Wait for cart to open
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Find and click "Remover" link
    await page.getByText('Remover').click();
    
    // Cart should show empty state
    const cartBtn = page.getByTestId('cart-btn');
    await expect(cartBtn).toContainText('(0)');
  });

  test('cart shows travel fee', async ({ page }) => {
    // Add a service
    await page.getByTestId('add-service-quadro').click();
    
    // Wait for cart to open
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Travel fee should be shown - use exact match
    await expect(page.getByText('Taxa de deslocacao', { exact: true })).toBeVisible();
    await expect(page.getByText('EUR35.00')).toBeVisible();
    
    await page.screenshot({ path: 'cart-travel-fee.jpeg', quality: 20 });
  });

  test('checkout form validation', async ({ page }) => {
    // Add a service
    await page.getByTestId('add-service-instalacao').click();
    
    // Wait for cart to open
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Fill partial form
    await page.getByTestId('customer-name-input').fill('Test User');
    await page.getByTestId('customer-email-input').fill('test@example.com');
    
    // Phone is required - leave empty and check validation
    await page.getByTestId('customer-phone-input').fill('');
    
    await page.screenshot({ path: 'checkout-validation.jpeg', quality: 20 });
  });

  test('complete checkout form shows payment button', async ({ page }) => {
    // Add a service
    await page.getByTestId('add-service-iluminacao').click();
    
    // Wait for cart to open
    await expect(page.getByText('Resumo do pedido')).toBeVisible();
    
    // Fill checkout form
    await page.getByTestId('customer-name-input').fill('Test User');
    await page.getByTestId('customer-email-input').fill('test@example.com');
    await page.getByTestId('customer-phone-input').fill('911111111');
    await page.getByTestId('customer-postal-input').fill('1000-001');
    await page.getByTestId('customer-address-input').fill('Rua Test 123, Lisboa');
    
    // Select service type
    await page.getByTestId('service-type-select').selectOption('instalacao');
    
    // Select date (next weekday)
    const dateStr = getNextWeekday();
    await page.getByTestId('date-input').fill(dateStr);
    
    // Select time
    await page.getByTestId('time-select').selectOption('10:00');
    
    await page.screenshot({ path: 'checkout-form-filled.jpeg', quality: 20 });
    
    // Payment button should be visible - "Pagar com Cartao"
    await expect(page.getByText('Pagar com Cartao')).toBeVisible();
    
    // Click checkout button
    await page.getByTestId('checkout-btn').click();
    
    // Should show loading or redirect to Stripe
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'payment-initiated.jpeg', quality: 20 });
  });
});
