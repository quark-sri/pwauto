---
type: Screen
title: Checkout
description: Steps 2–4 of checkout - sign in, billing address and payment.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  shows: [ordering/entities/order]
  step_of: [ordering/journeys/checkout]
---

# Checkout

Step 2 says "Hello <name>, you are already logged in" for a signed-in customer; step 3 is the billing address; step 4 the payment method, "Check payment", then "Confirm".[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- shows → [Order](/ordering/entities/order.md) _(actual)_
- step of → [Checkout](/ordering/journeys/checkout.md) _(actual)_
- [Cart](/ordering/screens/cart.md) navigates to this _(actual)_
<!-- generated:end relations -->
