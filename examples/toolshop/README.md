# Reference example: Toolshop

This example stays in the repository as a reference for testers and AI agents. A complete pwauto suite for the public practice shop [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (made for test automation training). It shows every stage's output, so you can copy the patterns for your own app.

| Stage | Output here |
|---|---|
| Explore | [`knowledge/`](knowledge/index.md): 4 areas, 21 sourced pages (actors, screens, journeys, entities, rules, terms), [open questions](knowledge/questions.md) |
| Scenarios | [`features/`](features/): 23 scenarios — sign-in, catalog search/sort/filter, product details, cart, checkout, contact |
| Automate | [`pages/`](pages/) (page objects + components), [`steps/`](steps/), [`api/`](api/ToolshopApi.ts) (customer registration for isolated checkout data), [`fixtures.ts`](fixtures.ts), [`suite.ts`](suite.ts) |

Run it: `npm run test:example` (add `-- --headed` to watch). It also runs with `npm test` while `BASE_URL` is empty, or with `INCLUDE_EXAMPLES=true`. It tests a public practice site: timeouts or HTTP 500 errors in `network-errors.json` mean the site is down, not that the framework is broken.

Patterns worth copying:

- **Own data per scenario**: checkout registers a new customer through the API (`Given I am a newly registered customer`), so parallel runs never share a cart.
- **App quirks stay in page objects**: the billing form looks up the address from the postal code and may overwrite fields; `CheckoutPage.fillBillingAddress` handles that, the steps stay clean.
- **Retrying assertions for re-rendered lists**: `expect(async () => …).toPass()` in the catalog steps.
- **Evidence finds causes**: `network-errors.json` keeps the request and response of each failed call. It first showed that a generated address did not match its country (a test-data bug, fixed in the test), and later that the shop randomly rejects a *valid* address (an application bug).
- **Application bugs are recorded, not hidden**: [BUG-001](bugs/BUG-001-valid-billing-address-rejected.md) + an open question in the knowledge base; the two order-placing scenarios keep their assertions and are tagged `@known-bug @fixme`, so reports show them as known bugs instead of random failures.

Explore it as an agent would: `npm run auth:save -- --role customer --suite toolshop`, then `npx playwright cli open https://practicesoftwaretesting.com` and `npx playwright cli state-load .auth/customer.json`.

Validate the knowledge base: `cd examples/toolshop && uvx --from git+https://github.com/quark-sri/domainlore lore check`.

Remove the example: `npm run example:remove`.
