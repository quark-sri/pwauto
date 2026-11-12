/**
 * Page-object registry of YOUR application.
 *
 * Add one line per page object. Steps then use it as `pages.<key>`:
 *
 *   import { LoginPage } from './LoginPage';
 *   export const pages = {
 *     login: LoginPage,
 *   };
 *
 * See examples/toolshop/pages/index.ts for a complete example.
 */
import type { Page } from '@playwright/test';

export const pages = {
  // login: LoginPage,
} satisfies Record<string, new (page: Page) => object>;
