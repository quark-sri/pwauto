---
type: Entity
title: Order
description: A submitted checkout with an order number.
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
---

# Order

After a successful submit the page says "Thanks Test, your order has been accepted. Your order nuumber is JT1795247083417" (name from the Forename field; the word "nuumber" is spelled this way on screen; the number is "JT" followed by 13 digits and differs per order).[^explore]
The cart is emptied ("Cart (0)").[^explore]

Decision: the spelling "nuumber" is the expected text (drafted as an issue for the site owner).[^decision]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

[^decision]: Tester decision, 2026-11-22: Jupiter Toys is a public practice site owned by someone else; for this exercise its observed behaviour is the expected behaviour. Suspected defects are drafted as issues in test-plan/bugs/ to raise with the site owner.

<!-- generated:start relations -->
## Relations

- [Checkout validation](/ordering/rules/checkout-validation.md) governs this _(actual)_
- [Checkout](/ordering/screens/checkout.md) shows this _(actual)_
<!-- generated:end relations -->
