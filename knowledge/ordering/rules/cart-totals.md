---
type: Rule
title: Cart totals
description: Subtotal = price x quantity; total = sum of subtotals.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  governs: [ordering/entities/cart]
---

# Cart totals

- Frog $10.99 x 2 = "$21.98"; Teddy Bear $12.99 x 1 = "$12.99"; "Total: 34.97".[^explore]
- Frog x 5 = "$54.95"; total "Total: 67.94".[^explore]
- Changing a quantity updates subtotal, total, the "There are N items" text and "Cart (N)" when the field loses focus.[^explore]
- The total is shown as "Total: 34.97" without a currency symbol, while prices and subtotals have "$".[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- governs → [Cart](/ordering/entities/cart.md) _(actual)_
<!-- generated:end relations -->
