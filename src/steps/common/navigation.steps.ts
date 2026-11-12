/**
 * Generic navigation steps. They work on any web application.
 */
import { expect } from '@playwright/test';
import { Given, Then, When } from '@core/fixtures';
import { resolvePath } from '@core/ui';

Given('I open the {string} page', async ({ page, log }, target: string) => {
  log.info(`open ${target}`);
  await page.goto(resolvePath(target));
});

Given('I am on the home page', async ({ page }) => {
  await page.goto('/');
});

When('I go back', async ({ page }) => {
  await page.goBack();
});

When('I reload the page', async ({ page }) => {
  await page.reload();
});

Then('the page URL should contain {string}', async ({ page }, part: string) => {
  await expect(page).toHaveURL(new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

Then('the page title should contain {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});

Then('the page should load without errors', async ({ page }) => {
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByRole('heading').first()).toBeVisible();
  await expect(page.getByText(/^(404|500|page not found|internal server error)$/i)).toHaveCount(0);
});
