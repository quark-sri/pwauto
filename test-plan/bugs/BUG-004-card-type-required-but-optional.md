# BUG-004: Card Type is marked required (*) but an order without it is accepted

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Medium (inconsistent form; order data without a card type) |
| Knowledge | `knowledge/ordering/rules/checkout-validation.md` |
| Test | features/app/ordering/checkout.feature — "An order is accepted without a card type" |

## Steps

1. Add a toy to the cart and click "Check Out".
2. Fill in Forename, Email, Address and Card Number; leave "Card Type*" blank.
3. Submit.

## Expected (suggested)

The order is refused with a message such as "Card Type is required", as for the other fields marked *.

## Actual

The order is accepted: "Thanks …, your order has been accepted."

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
