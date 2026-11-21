---
type: Journey
title: Buy toys
description: A visitor picks toys in the shop and adds them to the cart.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
steps:
  - { id: shop, label: Click Buy on a toy, screen: catalog/screens/shop, actor: account/actors/visitor }
  - { id: cart, label: Open the cart, screen: ordering/screens/cart, actor: account/actors/visitor }
---

# Buy toys

Visitor opens "Shop", clicks "Buy" on a toy (once per unit), then follows "Cart (N)". Continues in [Checkout](../../ordering/journeys/checkout.md).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start flow -->
## Flow

```mermaid
flowchart TD
  n_shop["Click Buy on a toy<br/><small>Shop</small>"]
  n_cart["Open the cart<br/><small>Cart</small>"]
  n_shop --> n_cart
```
<!-- generated:end flow -->

<!-- generated:start relations -->
## Relations

- [Visitor](/account/actors/visitor.md) performs this _(actual)_
- [Shop](/catalog/screens/shop.md) step of this _(actual)_
- [Cart](/ordering/screens/cart.md) step of this
<!-- generated:end relations -->
