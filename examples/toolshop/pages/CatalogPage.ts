import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';

export type SortOption = 'Name (A - Z)' | 'Name (Z - A)' | 'Price (High - Low)' | 'Price (Low - High)';

/** The product catalog: the home page and the category pages. */
export class CatalogPage extends BasePage {
  protected readonly path = '/';

  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly searchReset: Locator;
  readonly searchCaption: Locator;
  readonly noResults: Locator;
  readonly sort: Locator;
  readonly productCards: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly pageHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.getByRole('textbox', { name: 'Search' });
    this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
    this.searchReset = this.testId('search-reset');
    this.searchCaption = this.testId('search-caption');
    this.noResults = this.testId('no-results');
    this.sort = page.getByRole('combobox', { name: 'sort' });
    this.productCards = page.locator('a.card');
    this.productNames = this.testId('product-name');
    this.productPrices = this.testId('product-price');
    this.pageHeading = page.getByTestId('page-title');
  }

  protected readyIndicator(): Locator {
    return this.productNames.first();
  }

  async search(term: string): Promise<void> {
    // The Angular app ignores input typed before it has finished loading.
    await this.waitUntilReady();
    await this.searchBox.fill(term);
    await this.searchButton.click();
    await expect(this.searchCaption).toContainText(term);
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.waitUntilReady();
    await this.sort.selectOption({ label: option });
    await this.page.waitForLoadState('networkidle');
  }

  async filterByCategory(category: string): Promise<void> {
    await this.waitUntilReady();
    await this.page.getByRole('checkbox', { name: category, exact: true }).check();
    await this.page.waitForLoadState('networkidle');
  }

  async openProduct(name: string): Promise<void> {
    await this.productNames
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(name)}\\s*$`) })
      .first()
      .click();
  }

  async names(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((n) => n.trim());
  }

  async prices(): Promise<number[]> {
    return (await this.productPrices.allInnerTexts()).map(parsePrice);
  }
}

export function parsePrice(text: string): number {
  return Number.parseFloat(text.replace(/[^0-9.]/g, ''));
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
