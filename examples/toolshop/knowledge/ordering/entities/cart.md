---
type: Entity
title: Cart
description: The products a shopper has chosen, with quantity, line totals and a cart total.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  has: [catalog/entities/product]
---

# Cart

Adding a product shows the toast "Product added to shopping cart." and a badge with the item count on the cart icon.[^explore]
Each line: product, quantity (editable), unit price, line total. The cart total is the sum of the line totals.[^explore]
Guests have a cart too; checkout asks them to sign in or continue as guest.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- has → [Product](/catalog/entities/product.md) _(actual)_
- [Order](/ordering/entities/order.md) has this _(actual)_
- [Cart totals](/ordering/rules/cart-totals.md) governs this _(actual)_
- [Cart](/ordering/screens/cart.md) shows this _(actual)_
<!-- generated:end relations -->
