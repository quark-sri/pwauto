---
type: Screen
title: Product catalog
description: Home and category pages listing products with sort, price range, search and filters.
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
  navigates_to: [catalog/screens/product-details]
---

# Product catalog

Route `/` and `/category/<slug>` (for example `/category/hand-tools`, title "Category: Hand Tools"). Nine products per page with pagination.[^crawl]
Controls: sort (Name A–Z / Z–A, Price High–Low / Low–High, CO₂ rating), price range slider, search box, category and brand check-boxes, "eco-friendly only".[^crawl]

[^crawl]: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- shows → [Product](/catalog/entities/product.md) _(actual)_
- navigates to → [Product details](/catalog/screens/product-details.md) _(actual)_
<!-- generated:end relations -->
