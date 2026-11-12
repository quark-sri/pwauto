/**
 * YOUR application's fixtures.
 *
 * This file extends the generic core with the page objects of the app under
 * test (BASE_URL in .env). Steps in src/app/steps/ import Given/When/Then from
 * here, so they can use `pages.<name>` next to the core fixtures
 * (page, log, ctx, auth).
 *
 * To add a page object: create src/app/pages/<Name>Page.ts (extend BasePage)
 * and register it in src/app/pages/index.ts. The app-automator agent does
 * this for you.
 */
import { createBdd } from 'playwright-bdd';
import { definePages, test as core } from '@core/fixtures';
import { pages as registry } from './pages';

type AppPages = { [K in keyof typeof registry]: InstanceType<(typeof registry)[K]> };

export const test = core.extend<{ pages: AppPages }>({
  pages: definePages(registry),
});

export const { Given, When, Then, Step, Before, After } = createBdd(test);
