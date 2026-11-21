# BUG-001: Typo "nuumber" in the order confirmation

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Low (cosmetic, visible to every buyer) |
| Knowledge | `knowledge/ordering/entities/order.md` |
| Test | features/app/ordering/checkout.feature — "A visitor buys a toy in the shop and places the order" |

## Steps

1. Add any toy to the cart and open the cart.
2. Click "Check Out" and fill in the required fields (Forename, Email, Address, Card Number).
3. Submit the order and read the confirmation.

## Expected (suggested)

"Your order number is JT…".

## Actual

"Thanks Test, your order has been accepted. Your order **nuumber** is JT1795247083417".

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
