import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';
import { parsePrice } from './CatalogPage';

/** The product detail page: /product/<id>. */
export class ProductPage extends BasePage {
  protected readonly path = '/';

  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly decreaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly addToFavouritesButton: Locator;
  readonly outOfStockLabel: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByRole('heading', { level: 1 });
    this.unitPrice = this.testId('unit-price');
    this.description = this.testId('product-description');
    this.quantity = page.getByRole('spinbutton', { name: 'Quantity' });
    this.increaseQuantity = page.getByRole('button', { name: 'Increase quantity' });
    this.decreaseQuantity = page.getByRole('button', { name: 'Decrease quantity' });
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.addToFavouritesButton = page.getByRole('button', { name: 'Add to favourites' });
    this.outOfStockLabel = page.getByText('Out of stock', { exact: true });
  }

  protected readyIndicator(): Locator {
    return this.unitPrice;
  }

  async setQuantity(quantity: number): Promise<void> {
    await this.quantity.fill(String(quantity));
  }

  async addToCart(quantity = 1): Promise<void> {
    if (quantity !== 1) await this.setQuantity(quantity);
    await this.addToCartButton.click();
  }

  async price(): Promise<number> {
    return parsePrice(await this.unitPrice.innerText());
  }
}
