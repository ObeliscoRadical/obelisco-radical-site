import { test, expect } from '@playwright/test';

test.describe('Obelisco Connect - Navigation and PWA', () => {
  test('navigation has Obelisco Connect link', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check for Obelisco Connect link in navigation
    const connectLink = page.locator('a[href="/connect"]');
    await expect(connectLink).toBeVisible();
    await expect(connectLink).toContainText('Obelisco Connect');
    
    await page.screenshot({ path: 'nav-connect-link.jpeg', quality: 20 });
  });

  test('clicking Obelisco Connect link navigates to /connect', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Click the Obelisco Connect link
    await page.locator('a[href="/connect"]').click();
    
    // Should navigate to /connect
    await expect(page).toHaveURL(/\/connect/);
    
    // Should show login page
    await expect(page.getByText('Obelisco Connect').first()).toBeVisible();
    await expect(page.getByText('Aceda a sua conta')).toBeVisible();
    
    await page.screenshot({ path: 'nav-to-connect.jpeg', quality: 20 });
  });

  test('manifest.json is accessible and valid', async ({ page }) => {
    // Fetch manifest.json directly
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);
    
    const manifest = await response.json();
    
    // Validate required PWA manifest fields
    expect(manifest.name).toBe('Obelisco Connect');
    expect(manifest.short_name).toBe('Obelisco');
    expect(manifest.start_url).toBe('/connect');
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#facc15');
    expect(manifest.background_color).toBe('#18181b');
    
    // Validate icons array
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThan(0);
    
    // Check for required icon sizes
    const iconSizes = manifest.icons.map((icon: any) => icon.sizes);
    expect(iconSizes).toContain('192x192');
    expect(iconSizes).toContain('512x512');
  });

  test('service-worker.js is accessible', async ({ page }) => {
    // Fetch service-worker.js directly
    const response = await page.request.get('/service-worker.js');
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    
    // Validate service worker content
    expect(content).toContain('CACHE_NAME');
    expect(content).toContain('obelisco-connect');
    expect(content).toContain('install');
    expect(content).toContain('fetch');
  });

  test('offline.html is accessible', async ({ page }) => {
    // Fetch offline.html directly
    const response = await page.request.get('/offline.html');
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    
    // Validate offline page content
    expect(content).toContain('Obelisco');
    expect(content).toContain('offline');
  });

  test('index.html references manifest.json', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Check for manifest link in head
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json');
  });

  test('back to site link works from /connect', async ({ page }) => {
    await page.goto('/connect', { waitUntil: 'domcontentloaded' });
    
    // Click back to site link
    await page.getByText('← Voltar ao site').click();
    
    // Should navigate to homepage
    await expect(page).toHaveURL(/^https:\/\/obelisco-payments\.preview\.emergentagent\.com\/?$/);
    
    await page.screenshot({ path: 'back-to-site.jpeg', quality: 20 });
  });
});
