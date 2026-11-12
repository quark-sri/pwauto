import type { Locator, Page } from '@playwright/test';

/** Toast messages and alerts ("Product added to shopping cart."). */
export class NotificationComponent {
  constructor(private readonly page: Page) {}

  /** A visible toast or alert with this text. */
  withText(text: string | RegExp): Locator {
    return this.page
      .getByRole('alert')
      .or(this.page.locator('#toast-container, .toast, .alert'))
      .filter({ hasText: text })
      .first();
  }
}
