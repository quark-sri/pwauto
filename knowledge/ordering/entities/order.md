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
---

# Order

After a successful submit the page says "Thanks Test, your order has been accepted. Your order nuumber is JT1795247083417" (name from the Forename field; the word "nuumber" is spelled this way on screen; the number is "JT" followed by 13 digits and differs per order).[^explore]
The cart is emptied ("Cart (0)").[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- [Checkout validation](/ordering/rules/checkout-validation.md) governs this _(actual)_
- [Checkout](/ordering/screens/checkout.md) shows this _(actual)_
<!-- generated:end relations -->
