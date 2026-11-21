# BUG-005: Card number accepts letters without a format message

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Medium (invalid payment data reaches the order) |
| Knowledge | `knowledge/ordering/rules/checkout-validation.md` |
| Test | features/app/ordering/checkout.feature — "A card number with letters shows no format message" |

## Steps

1. Add a toy to the cart and click "Check Out".
2. Type "abcd" in "Card Number" and leave the field.

## Expected (suggested)

A message that the card number is not valid (digits only, valid length).

## Actual

No message. Only an empty field gives "Credit Card is required".

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
