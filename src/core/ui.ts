/**
 * Generic, user-facing element lookup used by the common steps.
 *
 * A non-technical author writes the text the user sees ("Email", "Sign in").
 * These helpers turn that text into a robust Playwright locator, trying the
 * accessible ways a real user finds an element, in order of preference.
 */
import { expect, type Locator, type Page } from '@playwright/test';
import type { LoginSettings } from './fixtures';

/** A form field by its label, placeholder or accessible name. */
export function field(page: Page, name: string): Locator {
  return page
    .getByLabel(name)
    .or(page.getByPlaceholder(name))
    .or(page.getByRole('textbox', { name }))
    .or(page.getByRole('combobox', { name }))
    .or(page.getByRole('spinbutton', { name }))
    .and(page.locator('input, textarea, select, [contenteditable="true"]'))
    .first();
}

/** A button by its accessible name (also matches submit inputs). */
export function button(page: Page, name: string): Locator {
  return page.getByRole('button', { name, exact: true }).or(page.getByRole('button', { name })).first();
}

/** A link by its accessible name. */
export function link(page: Page, name: string): Locator {
  return page.getByRole('link', { name, exact: true }).or(page.getByRole('link', { name })).first();
}

/** Anything clickable with this name: button, link, tab, menu item, or text. */
export function clickable(page: Page, name: string): Locator {
  return page
    .getByRole('button', { name, exact: true })
    .or(page.getByRole('link', { name, exact: true }))
    .or(page.getByRole('tab', { name, exact: true }))
    .or(page.getByRole('menuitem', { name, exact: true }))
    .or(page.getByRole('checkbox', { name, exact: true }))
    .or(page.getByRole('radio', { name, exact: true }))
    .or(page.getByText(name, { exact: true }))
    .first();
}

/** Turn "/orders" or "https://..." or "home" into a URL to open. */
export function resolvePath(target: string): string {
  if (/^https?:\/\//.test(target)) return target;
  if (/^home$/i.test(target)) return '/';
  return target.startsWith('/') ? target : `/${target}`;
}

export async function waitForSuccess(page: Page, login: LoginSettings): Promise<void> {
  if (login.success.startsWith('/')) {
    await page.waitForURL((u) => u.pathname.includes(login.success));
  } else if (login.success) {
    await expect(page.getByText(login.success).first()).toBeVisible();
  } else {
    await page.waitForURL((u) => !u.pathname.includes(login.path));
  }
}
