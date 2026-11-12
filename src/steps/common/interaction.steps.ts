/**
 * Generic interaction steps. Use the text the user sees on the screen:
 * button names, link names, field labels or placeholders.
 *
 * Prefer domain steps ("When I add 2 hammers to the cart") for real suites;
 * these generic steps are for fast first drafts and simple pages.
 */
import { Given, When } from '@core/fixtures';
import { button, clickable, field, link } from '@core/ui';

When('I click the {string} button', async ({ page }, name: string) => {
  await button(page, name).click();
});

When('I click the {string} link', async ({ page }, name: string) => {
  await link(page, name).click();
});

When('I click {string}', async ({ page }, name: string) => {
  await clickable(page, name).click();
});

When('I fill {string} with {string}', async ({ page }, name: string, value: string) => {
  await field(page, name).fill(value);
});

When('I clear {string}', async ({ page }, name: string) => {
  await field(page, name).clear();
});

When('I select {string} from {string}', async ({ page }, option: string, name: string) => {
  await field(page, name).selectOption({ label: option });
});

When('I check {string}', async ({ page }, name: string) => {
  await page.getByRole('checkbox', { name }).or(page.getByLabel(name)).first().check();
});

When('I uncheck {string}', async ({ page }, name: string) => {
  await page.getByRole('checkbox', { name }).or(page.getByLabel(name)).first().uncheck();
});

When('I press {string}', async ({ page }, key: string) => {
  await page.keyboard.press(key);
});

When('I fill in the form:', async ({ page }, table: { raw(): string[][] }) => {
  // | Field | Value |   (a header row is optional)
  for (const [name, value] of table.raw()) {
    if (!name || /^field$/i.test(name)) continue;
    const input = field(page, name);
    if ((await input.evaluate((el) => el.tagName)) === 'SELECT') await input.selectOption({ label: value ?? '' });
    else await input.fill(value ?? '');
  }
});

Given('I am logged in as a(n) {string}', async ({ auth }, role: string) => {
  await auth.loginAs(role);
});
