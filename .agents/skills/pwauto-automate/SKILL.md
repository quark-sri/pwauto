---
name: pwauto-automate
description: "Automates approved BDD scenarios with the pwauto framework: page objects, step definitions, fixtures and test data that follow the project's coding standards, then runs them until they pass for the right reason. Use when the user says 'automate', 'implement the steps', 'write the step definitions', 'make the scenarios run' or after scenarios are approved. Not for designing scenarios (use pwauto-scenarios) or changing the framework core (use pwauto-framework)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-automate

## Objective

Turn approved scenarios into fast, stable, readable Playwright tests that fail only when the application is wrong. Reuse before you write; keep each layer to its one job.

## Read first

- `docs/03-architecture.md` (layers) and `docs/04-coding-standards.md` (rules). The ESLint rules enforce part of them.
- The scenarios to automate (no `@draft` tag) and the knowledge pages they cite.
- What exists: `npm run steps:list`, `src/app/pages/index.ts`, `src/core/` (fixtures `page`, `log`, `ctx`, `auth`; helpers in `src/core/ui.ts`; `data-factory`, `a11y`).
- `examples/toolshop/` is the reference implementation of every pattern below.

## Layers (who does what)

| Layer | Folder | Job | Never |
|---|---|---|---|
| Feature | `features/app/<area>/*.feature` | business behaviour | UI details |
| Step | `src/app/steps/<area>.steps.ts` | map a sentence to page-object calls; **Then-steps assert** | locators, long logic |
| Page object | `src/app/pages/<Name>Page.ts`, `components/` | locators + user actions + queries for one page | business assertions, `test`/`expect` on results |
| API client | `src/app/api/<Name>Api.ts` | fast data setup through the backend | UI |
| Data | `src/core/utils/data-factory.ts` (+ app builders) | unique, valid test data | real personal data |
| Core | `src/core/**` | engine (fixtures, config, logging) | anything app-specific |

## Workflow

1. **Generate and list what is missing.** Run `npx bddgen`. Missing steps fail generation and print snippets; collect them.
2. **Reuse.** For each missing step, check `npm run steps:list` for a step with the same meaning; if the wording differs only slightly, ask whether to change the feature wording instead of adding a near-duplicate.
3. **Inspect the real page** before writing locators: with the Playwright CLI (skill `playwright-cli`): `npx playwright cli open <url>`, `npx playwright cli snapshot`, `npx playwright cli generate-locator <ref>` (for pages behind login: `npm run auth:save -- --role <role>` then `npx playwright cli state-load .auth/<role>.json`), or read `knowledge/<area>/screens/*.md`. Never guess a locator.
4. **Page object** (one per page or reusable component):
   ```ts
   import type { Locator, Page } from '@playwright/test';
   import { BasePage } from '@core/pages/BasePage';

   export class OrdersPage extends BasePage {
     protected readonly path = '/orders';
     readonly heading: Locator;
     readonly newOrder: Locator;

     constructor(page: Page) {
       super(page);
       this.heading = page.getByRole('heading', { name: 'Orders', level: 1 });
       this.newOrder = page.getByRole('button', { name: 'New order' });
     }

     protected readyIndicator(): Locator {
       return this.heading;
     }

     async createOrder(customer: string): Promise<void> {
       await this.newOrder.click();
       await this.page.getByLabel('Customer').fill(customer);
       await this.page.getByRole('button', { name: 'Save' }).click();
     }

     rowFor(customer: string): Locator {
       return this.page.getByRole('row').filter({ hasText: customer });
     }
   }
   ```
   Register it in `src/app/pages/index.ts` (`orders: OrdersPage`). Locator priority: `getByRole` (with name) → `getByLabel` → `getByPlaceholder` → `getByText` → `getByTestId` (attribute from `TEST_ID_ATTRIBUTE`). No CSS chains tied to layout, no XPath, no `nth()` unless the order is the behaviour.
5. **Steps** import from `@app/fixtures`:
   ```ts
   import { expect } from '@playwright/test';
   import { Given, Then, When } from '@app/fixtures';

   When('I create an order for {string}', async ({ pages }, customer: string) => {
     await pages.orders.createOrder(customer);
   });

   Then('the order list should show an order for {string}', async ({ pages }, customer: string) => {
     await expect(pages.orders.rowFor(customer)).toBeVisible();
   });
   ```
   - Assertions use web-first `expect(locator).toHaveText/toBeVisible/toHaveValue/toHaveURL/...` (they retry). For computed values use `expect.poll` or `expect(async () => ...).toPass()`.
   - Share values between steps with `ctx.set/get`, never module-level variables.
   - Data: `buildPerson()`, `uniqueId()`, or an app builder. Data that must exist first: create it through an API client (`request` fixture), not through the UI.
   - Login: `Given I am logged in as a "<role>"` (generic, cached per worker) or `auth.loginWith(...)` for a user the test created.
6. **Run the narrowest set** first: `npx bddgen && npx playwright test --project=<suite>-chromium --grep "<scenario name or @tag>"`. Projects are named `<suite>-<browser>`: `app-chromium` for your app (exists only when `BASE_URL` is set), `toolshop-chromium` for the reference example (or `npm run test:example -- --grep "<name|tag>"`). List them with `npx playwright test --list`. Read failures in the terminal; for details open `npm run report` (screenshots, video, trace, `execution-log.txt`, `network-errors.json`, the "Fix with AI" prompt).
7. **Make it pass for the right reason.** A failure is either a test bug (locator, timing, data) → fix the test; or an application bug → do not change the expected result; follow `pwauto-heal` to record it.
8. **Prove stability**: `npm run test:flaky-check -- --project=<suite>-chromium --grep "<tag>"` (5 repeats, parallel, no retries) must be green. Then `npm run check` (type check, lint, skills sync).
9. **Hand over**: list scenarios automated, new page objects and steps, run result, and anything recorded as an app bug. Offer Review B in `pwauto-review`.

## Never (the linter blocks most of these)

`waitForTimeout`/sleeps · `test.skip`/`only`/`fixme` added to get green · `force: true` · XPath · `page.$`/element handles · assertions in page objects · `console.log` (use `log`) · secrets in code · copying the current wrong value into an assertion · editing `.features-gen/` (generated).

## Done when

- Every approved scenario in scope runs; `bddgen` reports no missing steps.
- The flaky check is green for the new scenarios and `npm run check` passes.
- New steps and page objects follow the layer table; nothing app-specific went into `src/core/`.
