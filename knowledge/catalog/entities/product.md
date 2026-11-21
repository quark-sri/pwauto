---
type: Entity
title: Product
description: A toy for sale with a name and a unit price.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
---

# Product

Products as listed in the shop (name, price):[^explore]

- Teddy Bear, $12.99
- Stuffed Frog, $10.99
- Handmade Doll, $10.99
- Fluffy Bunny, $9.99
- Smiley Bear, $14.99
- Funny Cow, $10.99
- Valentine Bear, $14.99
- Smiley Face, $9.99

Prices are shown with a "$" in the shop and the cart rows. The list order was the same on every visit.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- [Shop](/catalog/screens/shop.md) shows this _(actual)_
- [Cart](/ordering/entities/cart.md) has this _(actual)_
<!-- generated:end relations -->
