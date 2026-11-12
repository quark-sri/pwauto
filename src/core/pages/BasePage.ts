/**
 * BasePage: what every page object shares.
 *
 * Rules for page objects (see docs/04-coding-standards.md):
 *  - One class per page (or per reusable component, in pages/components/).
 *  - Locators are readonly fields, built with user-facing locators first:
 *    getByRole > getByLabel > getByPlaceholder > getByText > getByTestId.
 *    Never long CSS or XPath tied to layout.
 *  - Methods are user intentions ("addToCart", "login"), not clicks on
 *    widgets ("clickButton3").
 *  - Page objects do NOT assert business results. They wait until the page
 *    is ready and return data or locators; the Then-steps assert.
 *  - No fixed sleeps (page.waitForTimeout). Wait for a condition instead.
 */
import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  /** Path relative to BASE_URL, for example "/auth/login". */
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  /**
   * A locator that is visible only when the page is ready for the user,
   * for example the main heading or the main form.
   */
  protected abstract readyIndicator(): Locator;

  /** Navigate straight to this page and wait until it is ready. */
  async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitUntilReady();
  }

  /** Wait until the page is ready, after a navigation the user triggered. */
  async waitUntilReady(): Promise<void> {
    await expect(this.readyIndicator(), `${this.constructor.name} did not become ready`).toBeVisible();
  }

  async isReady(): Promise<boolean> {
    return this.readyIndicator().isVisible();
  }

  /** Shortcut for the project's test-ID attribute (TEST_ID_ATTRIBUTE in .env). */
  protected testId(id: string | RegExp): Locator {
    return this.page.getByTestId(id);
  }

  url(): string {
    return this.page.url();
  }
}
