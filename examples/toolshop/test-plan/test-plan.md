# Test plan — Toolshop (reference example)

Filled example of `test-plan/test-plan.md` for the public practice shop https://practicesoftwaretesting.com.

## Scope
- In scope: sign-in and sign-out, catalog search / sort / filter / category navigation, product details and stock, cart and totals, checkout (signed-in), contact form validation.
- Out of scope: registration UI, favourites, invoices, admin area, payments other than Cash on Delivery and Bank Transfer, localisation (language switch), the chat widget — not needed to show the patterns.

## Risks and priorities

| Area / journey | Impact | Likelihood | Priority | Notes |
|---|---|---|---|---|
| Checkout and order placement | High (money) | High (many steps, address rules) | 1 | BUG-001: valid address rejected at random |
| Cart totals | High (money) | Medium | 1 | line total = unit price × quantity |
| Sign-in | High (access) | Low | 1 | never lock a demo account: negative case uses an unknown user |
| Search, sort, filter | Medium | Medium (list re-renders) | 2 | assertions retry until the list settles |
| Product stock | Medium | Low | 2 | out-of-stock cannot be added |
| Contact validation | Low | Low | 3 | 50-character minimum (boundary) |

## Approach
- UI end-to-end BDD scenarios; checkout data (a new customer) is created through the API, results are checked in the UI.
- Recommended below the UI (not automated here): invoice address validation and cart total calculation as API tests.

## Environments and data
- Environment: the public practice site (shared, may be slow or down). Tests may create customers, carts and orders: the site is made for training.
- Users: the published demo customer for sign-in; a fresh customer per checkout scenario (API).

## Entry and exit criteria
- Entry: knowledge base pages exist for the area; scenarios reviewed.
- Exit: all runnable `@smoke` pass; `@regression` pass rate 100 % except `@known-bug @fixme`; every failure classified; flaky check green.
