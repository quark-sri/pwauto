import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';
import { parsePrice } from './CatalogPage';

/** Step 1 of checkout: the shopping cart (/checkout). */
export class CartPage extends BasePage {
  protected readonly path = '/checkout';

  readonly rows: Locator;
  readonly total: Locator;
  readonly proceed: Locator;
  readonly continueShopping: Locator;
  readonly emptyMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.rows = page.getByRole('row').filter({ has: this.testId('product-title') });
    this.total = this.testId('cart-total');
    this.proceed = this.testId('proceed-1');
    this.continueShopping = page.getByRole('button', { name: 'Continue Shopping' });
    this.emptyMessage = page.getByText(/cart is empty/i);
  }

  protected readyIndicator(): Locator {
    return this.proceed.or(this.emptyMessage);
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.testId('product-title').filter({ hasText: productName }) });
  }

  quantityOf(productName: string): Locator {
    return this.row(productName).getByRole('spinbutton');
  }

  lineTotalOf(productName: string): Locator {
    return this.row(productName).getByTestId('line-price');
  }

  async setQuantity(productName: string, quantity: number): Promise<void> {
    const input = this.quantityOf(productName);
    await input.fill(String(quantity));
    await input.press('Tab');
  }

  async remove(productName: string): Promise<void> {
    await this.row(productName).locator('a.btn-danger, button.btn-danger').click();
  }

  async totalAmount(): Promise<number> {
    return parsePrice(await this.total.innerText());
  }
}
