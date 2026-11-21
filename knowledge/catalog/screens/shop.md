---
type: Screen
title: Shop
description: List of 8 toys with price and a Buy link each.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  shows: [catalog/entities/product]
  navigates_to: [ordering/screens/cart]
  step_of: [catalog/journeys/buy-toys]
---

# Shop

Route `#/shop`. Each toy is a heading level 4 (name), the price as text (for example "$12.99") and a link "Buy".[^explore]
Clicking "Buy" adds one unit to the cart and raises the nav link "Cart (N)" by one; there is no toast and the page stays the same.[^explore]
The shop has no search, sort or filter and no quantity field. Price list: see [Product](../entities/product.md).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- shows → [Product](/catalog/entities/product.md) _(actual)_
- navigates to → [Cart](/ordering/screens/cart.md) _(actual)_
- step of → [Buy toys](/catalog/journeys/buy-toys.md) _(actual)_
- [Home](/catalog/screens/home.md) navigates to this _(actual)_
- [Cart](/ordering/screens/cart.md) navigates to this _(actual)_
<!-- generated:end relations -->
