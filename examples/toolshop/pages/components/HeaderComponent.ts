import type { Locator, Page } from '@playwright/test';

/**
 * The top navigation bar, present on every page of the Toolshop demo app.
 * A component is a page object for a part of the page that repeats on many
 * pages. Page objects reuse it by composition (DRY), not by inheritance.
 */
export class HeaderComponent {
  readonly home: Locator;
  readonly signIn: Locator;
  readonly contact: Locator;
  readonly categories: Locator;
  readonly userMenu: Locator;
  readonly signOut: Locator;
  readonly cart: Locator;
  readonly cartQuantity: Locator;

  constructor(private readonly page: Page) {
    const nav = page.getByRole('navigation');
    this.home = nav.getByRole('link', { name: 'Home' });
    this.signIn = page.getByTestId('nav-sign-in');
    this.contact = nav.getByRole('link', { name: 'Contact' });
    this.categories = page.getByTestId('nav-categories');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOut = page.getByTestId('nav-sign-out');
    this.cart = page.getByTestId('nav-cart');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async openCategory(name: string): Promise<void> {
    await this.categories.click();
    await this.page.getByTestId(`nav-${name.toLowerCase().replace(/\s+/g, '-')}`).click();
  }

  async openCart(): Promise<void> {
    await this.cart.click();
  }

  async signOutUser(): Promise<void> {
    await this.userMenu.click();
    await this.signOut.click();
  }
}
