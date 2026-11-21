---
type: Rule
title: Cart quantity
description: Quantity edits and removal in the cart.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
  - id: decision
    resource: agent session 2026-11-22
    title: Tester decision — the observed behaviour is the expected behaviour for this exercise
    basis: intended
relations:
  governs: [ordering/entities/cart]
---

# Cart quantity

- Quantity 0 or -1 is not rejected with a message: the field keeps the typed value, but subtotal, total and "Cart (N)" keep the last valid values and the links "Checkout" (in the text) and "Check Out" lose their target (href `JavaScript:;`, no pointer cursor). Typing a valid quantity again restores them.[^explore]
- Text "abc" cannot be entered in the number field (field kept the previous value).[^explore]
- "Remove Item" opens a dialog "Remove Item": "Are you sure that you want to remove Stuffed Frog from your cart?" with "Yes" and "No". "No" keeps the row.[^explore]
- "Empty Cart" opens a dialog "Empty Cart": "Are you sure that you want to empty your cart?" with "Yes" and "No". "Yes" gives "Your cart is empty".[^explore]
- After the "Remove Item" dialog was closed with "No", a transparent overlay (`modal-backdrop`) stayed and blocked clicks on the page (see open question).[^explore]
- The upper limit of a quantity is not known.[^explore]

- Decision: the behaviour above for quantity 0 or -1 is the expected behaviour (drafted as an issue for the site owner).[^decision]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

[^decision]: Tester decision, 2026-11-22: Jupiter Toys is a public practice site owned by someone else; for this exercise its observed behaviour is the expected behaviour. Suspected defects are drafted as issues in test-plan/bugs/ to raise with the site owner.

<!-- generated:start relations -->
## Relations

- governs → [Cart](/ordering/entities/cart.md) _(actual)_
<!-- generated:end relations -->
