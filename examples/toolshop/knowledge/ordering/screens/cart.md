---
type: Screen
title: Cart
description: Step 1 of checkout, listing cart lines and totals.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  shows: [ordering/entities/cart]
  navigates_to: [ordering/screens/checkout]
  step_of: [ordering/journeys/checkout]
---

# Cart

Route `/checkout`, step 1 "Cart". Buttons "Continue Shopping" and "Proceed to checkout".[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- shows → [Cart](/ordering/entities/cart.md) _(actual)_
- navigates to → [Checkout](/ordering/screens/checkout.md) _(actual)_
- step of → [Checkout](/ordering/journeys/checkout.md) _(actual)_
- [Product details](/catalog/screens/product-details.md) navigates to this _(actual)_
<!-- generated:end relations -->
