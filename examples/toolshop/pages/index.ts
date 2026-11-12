/** Page-object registry of the Toolshop example. Steps use `pages.<key>`. */
import type { Page } from '@playwright/test';
import { AccountPage } from './AccountPage';
import { CartPage } from './CartPage';
import { CatalogPage } from './CatalogPage';
import { CheckoutPage } from './CheckoutPage';
import { HeaderComponent } from './components/HeaderComponent';
import { NotificationComponent } from './components/NotificationComponent';
import { ContactPage } from './ContactPage';
import { LoginPage } from './LoginPage';
import { ProductPage } from './ProductPage';

export const pages = {
  header: HeaderComponent,
  notifications: NotificationComponent,
  catalog: CatalogPage,
  product: ProductPage,
  login: LoginPage,
  account: AccountPage,
  cart: CartPage,
  checkout: CheckoutPage,
  contact: ContactPage,
} satisfies Record<string, new (page: Page) => object>;
