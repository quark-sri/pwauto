---
type: Rule
title: Cart totals
description: Line total = unit price × quantity; cart total = sum of line totals.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  governs: [ordering/entities/cart]
---

# Cart totals

Two "Combination Pliers" at $14.15 give a line total and cart total of $28.30.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- governs → [Cart](/ordering/entities/cart.md) _(actual)_
<!-- generated:end relations -->
