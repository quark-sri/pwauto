# Test plan — Jupiter Toys

Written by the `pwauto-scenarios` stage; one page. Keep it current.
Oracle: `knowledge/` (all facts `basis: actual`, from exploration on 2026-11-21; no intended-behaviour document exists). Suspected bugs are questions for the tester, not expected results.

## Scope
- In scope: home page and navigation; shop (toys, prices, Buy); cart (quantities, subtotals, total, remove, empty); guest checkout (validation, confirmation, order number); contact form (required fields, formats, confirmation); login dialog as seen by a visitor (wrong or empty details, Cancel).
- Out of scope: successful login and anything after it (no test user known — user decision); real payment (none in this environment); whether a contact message is stored or emailed (not visible in the UI); field length limits (unknown, see `knowledge/questions.md`); the 403 console error on load (observation, cause unknown).

## Risks and priorities

| Area / journey | Impact | Likelihood | Priority | Notes |
|---|---|---|---|---|
| Checkout and order confirmation | High (money, orders) | Medium (validation gaps seen) | 1 | blank Card Type and card number "abcd" accepted, old confirmation shown again: questions for the tester |
| Cart subtotals and total | High (money) | Medium (recalculation on blur) | 1 | total shown without "$": question for the tester; amount is asserted |
| Cart quantity edits, remove, empty | High (money) | High (0 / -1 silently kept, overlay after "No") | 1 | questions for the tester; "No" keeps the row is asserted |
| Shop: prices and Buy | High (money, every buyer) | Low | 1 | 8 toys, fixed prices |
| Contact form validation and confirmation | Medium (customer contact) | Medium | 2 | most depth requested by the user |
| Login dialog (visitor) | Medium (security message) | Low | 2 | only refusal paths; made-up user, no lock risk |
| Home and navigation | Low | Low | 3 | unknown route shows home: question for the tester, no scenario |

## Approach
- UI end-to-end BDD scenarios for the journeys and user-visible rules; risk-based tags: `@smoke` (6 key journeys), `@regression`, `@negative`, `@boundary`, `@e2e`. Questions for the tester are drafted as `@needs-decision` with a placeholder Then until the tester decides.
- Techniques: equivalence partitions (card types, required fields), boundary values (quantity 0 / -1, 1 → many), decision table (each required field empty), state transitions (cart: add, change, remove, empty, order placed), error guessing (letters in number fields, empty forms, bad email).
- Recommended below the UI (not automated here): subtotal and total calculation (price × quantity, sum, rounding) as a unit or API test if an API is available; card number format and email format validation rules.

## Environments and data
- Environment: https://jupiter.cloud.planittesting.com/ (shared test site). Tests may send contact messages, fill carts and submit orders with fake data (user decision).
- Test users: none. Each scenario starts in a fresh browser session with its own empty cart (the cart lives in the session; no API known); names like "Ada" and generated emails are fake.

## Entry and exit criteria
- Entry: knowledge base reviewed for the area; scenarios approved in `pwauto-review` (no `@draft`); tester answers for `@needs-decision` scenarios (or those stay parked).
- Exit: all `@smoke` pass; `@regression` pass rate 100 % except `@known-bug @fixme`; every failure classified; flaky check green.
