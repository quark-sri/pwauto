import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@core/pages/BasePage';

/** "My account": the landing page after a customer signs in. */
export class AccountPage extends BasePage {
  protected readonly path = '/account';

  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'My account', level: 1 });
  }

  protected readyIndicator(): Locator {
    return this.heading;
  }
}
