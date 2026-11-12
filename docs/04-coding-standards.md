# 4. Coding standards

These rules apply to people and AI agents. Rules marked 🔒 are enforced by ESLint (`npm run lint`) and the edit hook; the others are checked in review.

## 4.1 General

- TypeScript `strict`; no `any` 🔒; every promise awaited 🔒 (`@typescript-eslint/no-floating-promises`).
- Imports through aliases: `@core/...`, `@app/...`. The core never imports from `src/app` or `examples`.
- Names say intent: `addToCart`, `rowFor(customer)`, `the cart total should equal …`. No `click1`, `helper2`, `utils.ts` dumping grounds.
- No `console.log` 🔒 — use the `log` fixture (it goes into the report).
- No secrets in code, features or logs. The logger redacts keys like `password`, `token`, `cookie`.
- Prettier formatting (`npm run format`); 120 columns, single quotes.

## 4.2 Locators

Use what the user perceives, in this order:

1. `page.getByRole('button', { name: 'Save' })` — role + accessible name (best)
2. `page.getByLabel('Email')` — form fields
3. `page.getByPlaceholder('Search')`
4. `page.getByText('Out of stock', { exact: true })` — non-interactive text
5. `page.getByTestId('cart-total')` — stable test ID (attribute from `TEST_ID_ATTRIBUTE`)

Narrow with `locator.filter({ hasText })`, `{ has: … }` and chaining inside a region (`page.getByRole('row').filter({ hasText: 'Pliers' }).getByRole('spinbutton')`).

Never: XPath 🔒, `page.$`/`$$`/element handles 🔒, long CSS chains (`div > div:nth-child(3) span`), auto-generated class names (`.css-1x2y3z`), `nth()` unless order is the behaviour under test. Ask developers for test IDs where accessible names are missing — and record the gap as a finding.

## 4.3 Waiting

- No fixed sleeps: `waitForTimeout` is blocked 🔒.
- Actions (`click`, `fill`) auto-wait for the element to be visible, enabled and stable.
- Assertions retry: `await expect(locator).toHaveText('Saved')`.
- To wait for the app, wait for **what the user waits for**: a heading, a list re-render, a toast, a URL, or a specific response (`page.waitForResponse(r => r.url().includes('/orders'))`).
- For computed values use `expect.poll(() => pages.cart.totalAmount()).toBe(28.3)` or `expect(async () => { … }).toPass()`.
- `force: true` is blocked 🔒: it clicks things a user cannot click.

## 4.4 Page objects

```ts
export class CartPage extends BasePage {
  protected readonly path = '/checkout';      // where open() goes
  readonly total: Locator;                    // locators are readonly fields

  constructor(page: Page) {
    super(page);
    this.total = this.testId('cart-total');
  }

  protected readyIndicator(): Locator {        // proves the page is ready
    return this.page.getByRole('button', { name: 'Proceed to checkout' });
  }

  row(product: string): Locator {             // queries return locators
    return this.page.getByRole('row').filter({ hasText: product });
  }

  async remove(product: string): Promise<void> {   // actions are user intentions
    await this.row(product).getByRole('button', { name: 'Remove' }).click();
  }
}
```

- One class per page; a **component** (`pages/components/`) for UI that repeats on many pages (header, dialogs, toasts, tables). Compose, do not inherit (only `BasePage` is a base class).
- Register each page object in `src/app/pages/index.ts`; steps use it as `pages.<name>`.
- **No business assertions** in page objects. Waiting for readiness (`waitUntilReady`, `expect(...).toBeVisible()` before acting, `toPass` loops that converge a form) is allowed.
- Methods return `Promise<void>`, data (`Promise<number>`) or a `Locator` — never `this` chains that hide steps.
- Keep app quirks in the page object with a comment (e.g. *"the postal-code lookup fills the street; fill it after the lookup"*). Steps stay clean.

## 4.5 Step definitions

```ts
import { expect } from '@playwright/test';
import { Given, Then, When } from '@app/fixtures';

Given('I have added {int} {string} to the cart', async ({ pages, ctx }, qty: number, product: string) => {
  await pages.catalog.open();
  await pages.catalog.openProduct(product);
  ctx.set(`price:${product}`, await pages.product.price());
  await pages.product.addToCart(qty);
});

Then('the cart total should be {string}', async ({ pages }, total: string) => {
  await expect(pages.cart.total).toHaveText(total);
});
```

- One file per business area: `src/app/steps/<area>.steps.ts`.
- **Given** = set up state (fastest way: API, cached login), **When** = one user action, **Then** = assertions only.
- Every Then asserts something the user can see, with the exact expected value. No empty or "smoke" Thens.
- Parameters: `{string}` in quotes, `{int}`, `{float}`, `{word}`; data tables for forms.
- Reuse before writing: `npm run steps:list`. Same meaning, same sentence.
- Share data between steps with `ctx` — never module-level variables (they leak between parallel tests).
- No `test.skip/only/fixme` in code 🔒. A known application bug is tagged `@gap @fixme` in the feature (see the heal skill).

## 4.6 Test data

- Generate unique data: `buildPerson()`, `buildAddress()`, `uniqueId()` from `@core/utils/data-factory`. Each run logs its `dataSeed`; set `DATA_SEED` to reproduce.
- Data that must exist before the scenario is created **through an API client**, not the UI.
- Never share a mutable account between scenarios that change it (carts, orders, profiles). Use a fresh user per scenario, or a role reserved for read-only checks.
- Valid combinations come from the knowledge base (e.g. city must match country).
- No real personal data. Example domains only (`@example.com`).

## 4.7 Gherkin

See [Writing BDD scenarios](05-writing-bdd-scenarios.md). In short: declarative, one behaviour per scenario, exact expected values, independent, tagged, traceable to `knowledge/`.

## 4.8 Files and naming

| Thing | Location | Name |
|---|---|---|
| Feature | `features/app/<area>/` | `kebab-case.feature` |
| Steps | `src/app/steps/` | `<area>.steps.ts` |
| Page object | `src/app/pages/` | `PascalCasePage.ts`, class `PascalCasePage` |
| Component | `src/app/pages/components/` | `PascalCaseComponent.ts` |
| API client | `src/app/api/` | `PascalCaseApi.ts` |
| Registry key | `src/app/pages/index.ts` | `camelCase` (`orderDetails`) |
| Tags | features | `@lowercase-with-dashes` |

## 4.9 Definition of done for a scenario

- [ ] Approved scenario (no `@draft`), traced in `test-plan/traceability.md`
- [ ] Steps reuse existing sentences where the meaning is the same
- [ ] Locators follow 4.2; no sleeps; no assertions in page objects
- [ ] Own data; passes alone, in parallel and 5 times in a row (`npm run test:flaky-check`)
- [ ] Fails with a clear message when the behaviour breaks
- [ ] `npm run check` passes
