---
type: Screen
title: Product details
description: One product with price, description, quantity, Add to cart, favourites, compare and specifications.
basis: actual
sources:
  - id: crawl
    resource: https://practicesoftwaretesting.com
    title: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
    basis: actual
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  shows: [catalog/entities/product]
  navigates_to: [ordering/screens/cart]
---

# Product details

Route `/product/<id>`. Shows name (h1), category and brand, unit price, CO₂ rating, description, a quantity spin button with − and +, "Add to cart", "Add to favourites", "Compare", specifications and related products.[^crawl]
The price element holds the number only (for example `14.15`); the `$` sign is outside it.[^explore]

[^crawl]: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- shows → [Product](/catalog/entities/product.md) _(actual)_
- navigates to → [Cart](/ordering/screens/cart.md) _(actual)_
- [Product catalog](/catalog/screens/product-catalog.md) navigates to this _(actual)_
<!-- generated:end relations -->
