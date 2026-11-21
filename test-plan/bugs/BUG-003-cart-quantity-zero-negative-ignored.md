# BUG-003: Cart quantity 0 or -1 is accepted without a message and breaks the Check Out links

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Medium (the visitor cannot see why checkout stops working) |
| Knowledge | `knowledge/ordering/rules/cart-quantity.md` |
| Test | features/app/ordering/cart.feature — "A quantity of <quantity> is ignored and the totals keep the last valid values" |

## Steps

1. Buy 2 "Stuffed Frog" and open the cart.
2. Change the quantity to 0 (or -1) and leave the field.

## Expected (suggested)

The value is refused with a message, or 0 removes the row. Totals always match the quantities shown.

## Actual

No message. The field shows 0 (or -1), but subtotal "$21.98", "Total: 21.98" and "Cart (2)" keep the old values. The "Checkout" and "Check Out" links lose their target (`JavaScript:;`) until a valid quantity is typed again.

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
