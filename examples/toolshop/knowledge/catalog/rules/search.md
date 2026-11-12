---
type: Rule
title: Product search
description: Search lists the products whose name matches the keyword, or a no-results message.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  governs: [catalog/entities/product]
---

# Product search

- Searching "pliers" shows "Searched for: pliers" and only products with "pliers" in the name.[^explore]
- A keyword with no match shows "There are no products found." and no product cards.[^explore]
- Sorting by price low–high orders the listed prices ascending.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- governs → [Product](/catalog/entities/product.md) _(actual)_
<!-- generated:end relations -->
