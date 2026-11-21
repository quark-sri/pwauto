---
type: Rule
title: Add to cart
description: Each click on Buy adds one unit and the same toy is merged into one cart row.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  governs: [ordering/entities/cart]
---

# Add to cart

- One click on "Buy" raises "Cart (N)" by 1.[^explore]
- Clicking "Buy" twice on "Stuffed Frog" gives one cart row with quantity 2 and subtotal "$21.98".[^explore]
- The nav link text is "Cart (N)", N = total units over all rows, not the number of rows.[^explore]
- The cart is kept while moving between pages (home, shop, contact, checkout).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- governs → [Cart](/ordering/entities/cart.md) _(actual)_
<!-- generated:end relations -->
