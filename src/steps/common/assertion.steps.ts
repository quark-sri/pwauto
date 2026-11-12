/**
 * Generic assertion steps. Each one waits (auto-retries) until the condition
 * is true or the expect timeout ends. Never add sleeps before them.
 */
import { expect } from '@playwright/test';
import { Then } from '@core/fixtures';
import { button, field } from '@core/ui';
import { scanAccessibility } from '@core/utils/a11y';

Then('I should see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text).first()).toBeVisible();
});

Then('I should not see {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text)).toHaveCount(0);
});

Then('I should see the {string} heading', async ({ page }, name: string) => {
  await expect(page.getByRole('heading', { name }).first()).toBeVisible();
});

Then('I should see the {string} button', async ({ page }, name: string) => {
  await expect(button(page, name)).toBeVisible();
});

Then('I should see the {string} link', async ({ page }, name: string) => {
  await expect(page.getByRole('link', { name }).first()).toBeVisible();
});

Then('the {string} button should be disabled', async ({ page }, name: string) => {
  await expect(button(page, name)).toBeDisabled();
});

Then('the {string} button should be enabled', async ({ page }, name: string) => {
  await expect(button(page, name)).toBeEnabled();
});

Then('the {string} field should contain {string}', async ({ page }, name: string, value: string) => {
  await expect(field(page, name)).toHaveValue(value);
});

Then('I should see an alert {string}', async ({ page }, text: string) => {
  await expect(page.getByRole('alert').filter({ hasText: text }).first()).toBeVisible();
});

Then('the page should have no serious accessibility violations', async ({ page, $testInfo }) => {
  const violations = await scanAccessibility(page, $testInfo, { minImpact: 'serious' });
  expect(
    violations,
    `Accessibility violations:\n${violations.map((v) => `- ${v.id} (${v.impact}): ${v.help} [${v.nodes} element(s)]`).join('\n')}`,
  ).toEqual([]);
});
