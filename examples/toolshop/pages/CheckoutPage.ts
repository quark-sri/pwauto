import { expect, type Locator, type Page } from '@playwright/test';
import type { Address } from '@core/utils/data-factory';
import { BasePage } from '@core/pages/BasePage';

export type PaymentMethod = 'Bank Transfer' | 'Cash on Delivery' | 'Credit Card' | 'Buy Now Pay Later' | 'Gift Card';

/** Steps 2-4 of checkout: sign in, billing address, payment. */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout';

  readonly signedInMessage: Locator;
  readonly proceedSignedIn: Locator;
  readonly street: Locator;
  readonly houseNumber: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly country: Locator;
  readonly postalCode: Locator;
  readonly proceedToPayment: Locator;
  readonly paymentMethod: Locator;
  readonly confirm: Locator;
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.signedInMessage = page.getByText(/you are already logged in/i);
    this.proceedSignedIn = this.testId('proceed-2');
    this.street = this.testId('street');
    this.houseNumber = this.testId('house_number');
    this.city = this.testId('city');
    this.state = this.testId('state');
    this.country = this.testId('country');
    this.postalCode = this.testId('postal_code');
    this.proceedToPayment = this.testId('proceed-3');
    this.paymentMethod = this.testId('payment-method');
    this.confirm = this.testId('finish');
    this.paymentSuccess = this.testId('payment-success-message');
    this.orderConfirmation = page
      .locator('#order-confirmation')
      .or(page.getByText(/Thanks for your order/i))
      .first();
  }

  protected readyIndicator(): Locator {
    return this.proceedSignedIn;
  }

  /**
   * Fill the billing address in the order the form asks for: country, postal
   * code and house number first. The app then looks the address up and fills
   * street, city and state by itself; the remaining fields are filled after
   * that lookup, so the lookup cannot overwrite them.
   */
  async fillBillingAddress(address: Address): Promise<void> {
    if ((await this.country.evaluate((el) => el.tagName)) === 'SELECT') {
      await this.country.selectOption({ label: address.country });
    } else {
      await this.country.fill(address.country);
    }
    const lookup = this.page
      .waitForResponse((r) => r.url().includes('/postcode-lookup'), { timeout: 10_000 })
      .catch(() => undefined); // some countries have no lookup
    await this.postalCode.fill(address.postalCode);
    await this.houseNumber.fill(address.houseNumber);
    await lookup;
    // Like a real user, accept what the lookup filled in and only complete the
    // fields that are still empty (the lookup can also clear a field late).
    await expect(async () => {
      for (const [input, value] of [
        [this.houseNumber, address.houseNumber],
        [this.street, address.street],
        [this.city, address.city],
        [this.state, address.state],
      ] as const) {
        if ((await input.inputValue()) === '') await input.fill(value);
      }
      await expect(this.proceedToPayment).toBeEnabled({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
  }

  /** Choose a payment method, fill its details and check the payment. */
  async pay(method: PaymentMethod, details: Record<string, string> = {}): Promise<void> {
    await this.paymentMethod.selectOption({ label: method });
    for (const [label, value] of Object.entries(details)) {
      await this.page.getByRole('textbox', { name: label, exact: true }).fill(value);
    }
    await this.page.getByRole('button', { name: 'Check payment' }).click();
  }

  /**
   * After a successful payment the same button changes its name from
   * "Check payment" to "Confirm". Wait for the new name before clicking.
   */
  async placeOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }
}
