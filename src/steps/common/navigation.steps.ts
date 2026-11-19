/**
 * Generic navigation steps. They work on any web application.
 */
import { expect, type Response } from '@playwright/test';
import { Given, Then, When } from '@core/fixtures';
import type { ScenarioContext } from '@core/fixtures';
import { resolvePath } from '@core/ui';

/** The server's answer to the last page this scenario opened, checked by "the page should load without errors". */
const LAST_PAGE = 'navigation:lastPage';
type LastPage = { url: string; status: number };

function remember(ctx: ScenarioContext, response: Response | null): void {
  // No response: same-document navigation (for example a "#" route); nothing to check.
  if (response) ctx.set<LastPage>(LAST_PAGE, { url: response.url(), status: response.status() });
}

Given('I open the {string} page', async ({ page, log, ctx }, target: string) => {
  log.info(`open ${target}`);
  remember(ctx, await page.goto(resolvePath(target)));
});

Given('I am on the home page', async ({ page, ctx }) => {
  remember(ctx, await page.goto(resolvePath('home')));
});

When('I go back', async ({ page, ctx }) => {
  remember(ctx, await page.goBack());
});

When('I reload the page', async ({ page, ctx }) => {
  remember(ctx, await page.reload());
});

Then('the page URL should contain {string}', async ({ page }, part: string) => {
  await expect(page).toHaveURL(new RegExp(part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

Then('the page title should contain {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
});

Then('the page should load without errors', async ({ page, ctx }) => {
  // 1. The server did not answer with an error, when this scenario opened the page itself.
  if (ctx.has(LAST_PAGE)) {
    const last = ctx.get<LastPage>(LAST_PAGE);
    if (last.url === page.url()) {
      expect(last.status, `the server answered HTTP ${last.status} for ${last.url}`).toBeLessThan(400);
    }
  }
  // 2. The page shows content (also a single-page app that renders after the load).
  await expect(page.locator('body'), 'the page shows no text').toHaveText(/\S/);
  // 3. No error page that the server sent with status 200.
  await expect(page.getByText(/^(404|500|page not found|internal server error)$/i)).toHaveCount(0);
});
