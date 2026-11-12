/** Fixtures of the Toolshop example: the core engine + Toolshop page objects. */
import { createBdd } from 'playwright-bdd';
import { definePages, test as core } from '@core/fixtures';
import { ToolshopApi } from './api/ToolshopApi';
import { pages as registry } from './pages';

type ToolshopPages = { [K in keyof typeof registry]: InstanceType<(typeof registry)[K]> };

export const test = core.extend<{ pages: ToolshopPages; api: ToolshopApi }>({
  pages: definePages(registry),
  api: async ({ request }, use) => use(new ToolshopApi(request)),
});

export const { Given, When, Then } = createBdd(test);
