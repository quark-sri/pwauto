import { expect } from '@playwright/test';
import { buildAddress } from '@core/utils/data-factory';
import type { PaymentMethod } from '../pages/CheckoutPage';
import { Then, When } from '../fixtures';

When('I check out with a new billing address', async ({ pages, ctx }) => {
  await pages.header.openCart();
  await pages.cart.proceed.click();
  await pages.checkout.waitUntilReady();
  await pages.checkout.proceedSignedIn.click();
  // The shop validates the address against the country (POST /invoices -> 422
  // otherwise), so city, state and postal code must belong to the country.
  const address = buildAddress({ country: 'Austria', city: 'Vienna', state: 'Vienna', postalCode: '1010' });
  ctx.set('billingAddress', address);
  await pages.checkout.fillBillingAddress(address);
  await pages.checkout.proceedToPayment.click();
});

/** The extra fields each payment method asks for (labels as shown on screen). */
const paymentDetails: Partial<Record<PaymentMethod, Record<string, string>>> = {
  'Bank Transfer': { 'Bank Name': 'Test Bank', 'Account Name': 'Test Account', 'Account Number': '12345678' },
};

When('I proceed to checkout', async ({ pages }) => {
  await pages.cart.proceed.click();
  await pages.checkout.waitUntilReady();
});

Then('I should be told that I am already signed in', async ({ pages }) => {
  await expect(pages.checkout.signedInMessage).toBeVisible();
  await expect(pages.checkout.proceedSignedIn).toBeEnabled();
});

When('I pay by {string}', async ({ pages }, method: string) => {
  await pages.checkout.pay(method as PaymentMethod, paymentDetails[method as PaymentMethod]);
});

When('I confirm the order', async ({ pages }) => {
  await pages.checkout.placeOrder();
});

Then('I should see the payment message {string}', async ({ pages }, message: string) => {
  await expect(pages.checkout.paymentSuccess).toHaveText(message);
});

Then('I should see an order confirmation with an invoice number', async ({ pages }) => {
  await expect(pages.checkout.orderConfirmation).toContainText(/Thanks for your order! Your invoice number is INV-\d+/);
});
