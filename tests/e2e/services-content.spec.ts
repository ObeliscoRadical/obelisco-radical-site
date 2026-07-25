import { test, expect } from '@playwright/test';

test.describe('Obelisco Radical - Services Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('services section displays all services', async ({ page }) => {
    // Navigate to services section
    await page.getByTestId('nav-services').click();
    
    // Check main services are displayed
    await expect(page.getByText('Instalacao Eletrica Completa')).toBeVisible();
    await expect(page.getByText('Quadro Eletrico')).toBeVisible();
    await expect(page.getByText('Reparacao e Diagnostico')).toBeVisible();
    await expect(page.getByText('Iluminacao LED')).toBeVisible();
    
    await page.screenshot({ path: 'services-section.jpeg', quality: 20 });
  });

  test('services show prices', async ({ page }) => {
    // Navigate to services section
    await page.getByTestId('nav-services').click();
    
    // Check prices are displayed
    await expect(page.getByText('EUR45')).toBeVisible(); // Instalacao
    await expect(page.getByText('EUR280')).toBeVisible(); // Quadro
    await expect(page.getByText('EUR40')).toBeVisible(); // Manutencao
    await expect(page.getByText('EUR25')).toBeVisible(); // Iluminacao
    
    await page.screenshot({ path: 'services-prices.jpeg', quality: 20 });
  });

  test('services have add to cart buttons', async ({ page }) => {
    // Navigate to services section
    await page.getByTestId('nav-services').click();
    
    // Check add buttons exist
    await expect(page.getByTestId('add-service-instalacao')).toBeVisible();
    await expect(page.getByTestId('add-service-quadro')).toBeVisible();
    await expect(page.getByTestId('add-service-manutencao')).toBeVisible();
    await expect(page.getByTestId('add-service-iluminacao')).toBeVisible();
    
    await page.screenshot({ path: 'services-buttons.jpeg', quality: 20 });
  });

  test('travel fee notice is displayed', async ({ page }) => {
    // Navigate to services section
    await page.getByTestId('nav-services').click();
    
    // Check travel fee notice
    await expect(page.getByText('Taxa de deslocacao: EUR35')).toBeVisible();
    
    await page.screenshot({ path: 'travel-fee-notice.jpeg', quality: 20 });
  });

  test('online payment badge is displayed', async ({ page }) => {
    // Navigate to services section
    await page.getByTestId('nav-services').click();
    
    // Check online payment badge
    await expect(page.getByText('Pagamento Online Disponivel')).toBeVisible();
    
    await page.screenshot({ path: 'payment-badge.jpeg', quality: 20 });
  });
});

test.describe('Obelisco Radical - FAQ Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('FAQ section displays questions and answers', async ({ page }) => {
    // Navigate to FAQ section
    await page.getByTestId('nav-faq').click();
    
    // Check FAQ questions are displayed
    await expect(page.getByText('Atendem Lisboa e Cascais?')).toBeVisible();
    await expect(page.getByText('Fazem orcamento rapido?')).toBeVisible();
    await expect(page.getByText('Trabalham com clientes residenciais e empresas?')).toBeVisible();
    
    await page.screenshot({ path: 'faq-section.jpeg', quality: 20 });
  });
});

test.describe('Obelisco Radical - Contact Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
  });

  test('contact section displays contact information', async ({ page }) => {
    // Navigate to contact section
    await page.getByTestId('nav-contact').click();
    
    // Check contact info is displayed - use first() to avoid strict mode
    await expect(page.getByText('+351 911 132 401').first()).toBeVisible();
    await expect(page.getByText('obeliscoradical@gmail.com').first()).toBeVisible();
    await expect(page.getByText('Grande Lisboa').first()).toBeVisible();
    
    await page.screenshot({ path: 'contact-section.jpeg', quality: 20 });
  });
});
