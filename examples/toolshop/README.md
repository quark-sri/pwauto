# Worked example: Toolshop

A complete pwauto suite for the public practice shop [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (made for test automation training). It shows every stage's output, so you can copy the patterns for your own app.

| Stage | Output here |
|---|---|
| Explore | [`knowledge/`](knowledge/index.md): 4 areas, 21 sourced pages (actors, screens, journeys, entities, rules, terms), [open questions](knowledge/questions.md) |
| Scenarios | [`features/`](features/): 22 scenarios — sign-in, catalog search/sort/filter, product details, cart, checkout, contact |
| Automate | [`pages/`](pages/) (page objects + components), [`steps/`](steps/), [`api/`](api/ToolshopApi.ts) (customer registration for isolated checkout data), [`fixtures.ts`](fixtures.ts), [`suite.ts`](suite.ts) |

Run it: `INCLUDE_EXAMPLES=true` in `.env` (default on a fresh clone), then `npx bddgen && npx playwright test --project="toolshop-*"`.

Patterns worth copying:

- **Own data per scenario**: checkout registers a new customer through the API (`Given I am a newly registered customer`), so parallel runs never share a cart.
- **App quirks stay in page objects**: the billing form looks up the address from the postal code and may overwrite fields; `CheckoutPage.fillBillingAddress` handles that, the steps stay clean.
- **Retrying assertions for re-rendered lists**: `expect(async () => …).toPass()` in the catalog steps.
- **Evidence finds causes**: a 422 response body in `network-errors.json` showed that a generated address did not match its country.

Explore it as an agent would: `npm run auth:save -- --role customer --suite toolshop`, then `npx playwright cli open https://practicesoftwaretesting.com` and `npx playwright cli state-load .auth/customer.json`.

Validate the knowledge base: `cd examples/toolshop && uvx --from git+https://github.com/quark-sri/domainlore lore check`.

Remove the example: `npm run example:remove`.
