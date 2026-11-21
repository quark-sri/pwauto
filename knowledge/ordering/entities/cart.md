---
type: Entity
title: Cart
description: The toys a visitor chose, with quantity, subtotal per row and a total.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  has: [catalog/entities/product]
---

# Cart

Guests have a cart; no login is needed. Table columns: "Item", "Price", "Quantity", "Subtotal", "Actions".[^explore]
Rules: [Cart totals](../rules/cart-totals.md), [Cart quantity](../rules/cart-quantity.md), [Add to cart](../../catalog/rules/add-to-cart.md).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- has → [Product](/catalog/entities/product.md) _(actual)_
- [Add to cart](/catalog/rules/add-to-cart.md) governs this _(actual)_
- [Cart quantity](/ordering/rules/cart-quantity.md) governs this _(actual)_
- [Cart totals](/ordering/rules/cart-totals.md) governs this _(actual)_
- [Cart](/ordering/screens/cart.md) shows this _(actual)_
<!-- generated:end relations -->
