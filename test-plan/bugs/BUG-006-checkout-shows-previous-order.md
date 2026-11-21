# BUG-006: Opening the checkout again after an order shows the previous confirmation

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Medium (the visitor can think a second order was placed) |
| Knowledge | `knowledge/ordering/rules/checkout-validation.md` |
| Test | features/app/ordering/checkout.feature — "Opening the checkout again right after an order shows that order again" |

## Steps

1. Place an order and note the order number.
2. Open `#/checkout` again (the cart is now empty).

## Expected (suggested)

The checkout says the cart is empty, or leads back to the shop.

## Actual

The page shows the previous confirmation again with the same order number.

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
