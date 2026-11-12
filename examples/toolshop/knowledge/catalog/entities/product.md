---
type: Entity
title: Product
description: A tool for sale, with name, price, category, brand, CO2 rating, description, specifications and stock.
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
states: [in-stock, out-of-stock]
---

# Product

Each product has a name, a unit price in dollars, a category (for example Hand Tools > Pliers), a brand (ForgeFlex Tools, MightyCraft Hardware), a CO₂ rating A–E, a description and a specifications table.[^crawl]
Example: "Combination Pliers", $14.15, ForgeFlex Tools.[^crawl] "Long Nose Pliers" is out of stock.[^explore]

[^crawl]: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start lifecycle -->
## Lifecycle

```mermaid
stateDiagram-v2
  [*] --> in-stock
```

_Labels: (intended) = specified only · (actual) = seen in app or code only._
<!-- generated:end lifecycle -->

<!-- generated:start relations -->
## Relations

- [Product search](/catalog/rules/search.md) governs this _(actual)_
- [Out-of-stock products](/catalog/rules/stock.md) governs this _(actual)_
- [Product catalog](/catalog/screens/product-catalog.md) shows this _(actual)_
- [Product details](/catalog/screens/product-details.md) shows this _(actual)_
- [Cart](/ordering/entities/cart.md) has this _(actual)_
<!-- generated:end relations -->
