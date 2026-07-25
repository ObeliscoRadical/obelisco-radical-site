import { test, expect } from '@playwright/test';

test.describe('Obelisco Radical - Core Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('homepage loads with all main sections', async ({ page }) => {
    // Check hero section
    await expect(page.locator('#hero')).toBeVisible();
    
    // Check services section exists
    await expect(page.locator('#services')).toBeVisible();
    
    // Check vantagens section
    await expect(page.locator('#vantagens')).toBeVisible();
    
    // Check FAQ section
    await expect(page.locator('#faq')).toBeVisible();
    
    // Check contact section
    await expect(page.locator('#contact')).toBeVisible();
    
    // Check footer
    await expect(page.locator('footer')).toBeVisible();
    
    await page.screenshot({ path: 'homepage-sections.jpeg', quality: 20 });
  });

  test('navigation menu works correctly', async ({ page }) => {
    // Click on services nav
    await page.getByTestId('nav-services').click();
    await expect(page.locator('#services')).toBeInViewport();
    
    // Click on FAQ nav
    await page.getByTestId('nav-faq').click();
    await expect(page.locator('#faq')).toBeInViewport();
    
    // Click on contact nav
    await page.getByTestId('nav-contact').click();
    await expect(page.locator('#contact')).toBeInViewport();
    
    // Click logo to go back to hero
    await page.getByTestId('logo-btn').click();
    await expect(page.locator('#hero')).toBeInViewport();
  });

  test('mobile menu opens and closes', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    
    // Mobile menu button should be visible
    await expect(page.getByTestId('mobile-menu-btn')).toBeVisible();
    
    // Click to open menu
    await page.getByTestId('mobile-menu-btn').click();
    
    // Menu items should be visible - use exact match to avoid strict mode violation
    await expect(page.getByRole('button', { name: 'Servicos', exact: true })).toBeVisible();
    
    // Click to close
    await page.getByTestId('mobile-menu-btn').click();
    
    await page.screenshot({ path: 'mobile-menu.jpeg', quality: 20 });
  });

  test('WhatsApp buttons are present and have correct links', async ({ page }) => {
    // Header WhatsApp button
    const headerWhatsApp = page.getByTestId('whatsapp-header-btn');
    await expect(headerWhatsApp).toBeVisible();
    await expect(headerWhatsApp).toHaveAttribute('href', /wa\.me\/351911132401/);
    
    // Floating WhatsApp button
    const floatWhatsApp = page.getByTestId('whatsapp-float-btn');
    await expect(floatWhatsApp).toBeVisible();
    await expect(floatWhatsApp).toHaveAttribute('href', /wa\.me\/351911132401/);
  });

  test('cart button shows correct count', async ({ page }) => {
    // Initially cart should show 0
    const cartBtn = page.getByTestId('cart-btn');
    await expect(cartBtn).toBeVisible();
    await expect(cartBtn).toContainText('(0)');
    
    // Add a service
    await page.getByTestId('add-service-instalacao').click();
    
    // Cart should now show 1
    await expect(cartBtn).toContainText('(1)');
    
    await page.screenshot({ path: 'cart-count.jpeg', quality: 20 });
  });
});
