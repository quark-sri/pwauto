---
type: Journey
title: Checkout
description: A visitor pays for the cart as a guest and gets an order number.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
steps:
  - { id: cart, label: Review the cart, screen: ordering/screens/cart, actor: account/actors/visitor }
  - { id: form, label: Fill delivery and payment details and Submit, screen: ordering/screens/checkout, actor: account/actors/visitor }
---

# Checkout

Cart, then the checkout form, then the confirmation with the order number. No real payment exists in this test environment (user statement).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start flow -->
## Flow

```mermaid
flowchart TD
  n_cart["Review the cart<br/><small>Cart</small>"]
  n_form["Fill delivery and payment details and Submit<br/><small>Checkout</small>"]
  n_cart --> n_form
```
<!-- generated:end flow -->

<!-- generated:start relations -->
## Relations

- [Visitor](/account/actors/visitor.md) performs this _(actual)_
- [Cart](/ordering/screens/cart.md) step of this _(actual)_
- [Checkout](/ordering/screens/checkout.md) step of this _(actual)_
<!-- generated:end relations -->
