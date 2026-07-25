import { Page, expect } from '@playwright/test';

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded');
}

export async function dismissToasts(page: Page) {
  await page.addLocatorHandler(
    page.locator('[data-sonner-toast], .Toastify__toast, [role="status"].toast, .MuiSnackbar-root'),
    async () => {
      const close = page.locator('[data-sonner-toast] [data-close], [data-sonner-toast] button[aria-label="Close"], .Toastify__close-button, .MuiSnackbar-root button');
      await close.first().click({ timeout: 2000 }).catch(() => {});
    },
    { times: 10, noWaitAfter: true }
  );
}

export async function checkForErrors(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const errorElements = Array.from(
      document.querySelectorAll('.error, [class*="error"], [id*="error"]')
    );
    return errorElements.map(el => el.textContent || '').filter(Boolean);
  });
}

export async function addServiceToCart(page: Page, serviceId: string) {
  await page.getByTestId(`add-service-${serviceId}`).click();
}

export async function openCart(page: Page) {
  await page.getByTestId('cart-btn').click();
}

export async function fillCheckoutForm(page: Page, data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  date: string;
  time: string;
  serviceType: string;
}) {
  await page.getByTestId('customer-name-input').fill(data.name);
  await page.getByTestId('customer-email-input').fill(data.email);
  await page.getByTestId('customer-phone-input').fill(data.phone);
  await page.getByTestId('customer-address-input').fill(data.address);
  await page.getByTestId('customer-postal-code-input').fill(data.postalCode);
  await page.getByTestId('customer-date-input').fill(data.date);
  await page.getByTestId('customer-time-select').selectOption(data.time);
  await page.getByTestId('service-type-select').selectOption(data.serviceType);
}
