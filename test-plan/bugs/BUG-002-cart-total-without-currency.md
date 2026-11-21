# BUG-002: Cart total is shown without the "$" sign

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Low (inconsistent money format) |
| Knowledge | `knowledge/ordering/rules/cart-totals.md` |
| Test | features/app/ordering/cart.feature — "The cart total is the sum of the subtotals" |

## Steps

1. Buy 2 "Stuffed Frog" and 1 "Teddy Bear".
2. Open the cart.

## Expected (suggested)

The total uses the same format as prices and subtotals: "Total: $34.97".

## Actual

Prices and subtotals show "$" ("$21.98", "$12.99"), the total shows "Total: 34.97".

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
