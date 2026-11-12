---
type: Rule
title: Out-of-stock products
description: An out-of-stock product is labelled and cannot be added to the cart.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  governs: [catalog/entities/product]
---

# Out-of-stock products

An out-of-stock product shows "Out of stock" in the catalog and on its page, and the "Add to cart" button is disabled.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- governs → [Product](/catalog/entities/product.md) _(actual)_
<!-- generated:end relations -->
