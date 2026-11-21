# BUG-007: Overlay stays on the page after "No" in the Remove Item dialog (seen once)

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Medium if confirmed (the page cannot be clicked) |
| Knowledge | `knowledge/ordering/rules/cart-quantity.md` |
| Test | none (not reproduced); "Answering No to the removal keeps the toy in the cart" covers the row |

## Steps

1. Buy a toy and open the cart.
2. Click the remove button of the row; the dialog "Remove Item" opens.
3. Click "No".

## Expected (suggested)

The dialog closes and the page can be used.

## Actual

Once in exploration, a transparent overlay (`modal-backdrop`) stayed and blocked clicks until another dialog was opened and closed. **Not reproduced yet — reproduce before raising.**

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
