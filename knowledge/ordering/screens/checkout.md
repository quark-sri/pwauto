---
type: Screen
title: Checkout
description: One form with Delivery Details and Payment Details and a Submit button.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  shows: [ordering/entities/order]
  step_of: [ordering/journeys/checkout]
---

# Checkout

Route `#/checkout`; reachable without login (guest).[^explore]
Heading text "Almost there - your N item is nearly in your hands." (N = units in the cart).[^explore]
Group "Delivery Details": Forename * (placeholder "John"), Surname (placeholder "Example"), Email * (placeholder "john.example@planit.net.au"), Telephone (placeholder "02 1234 5678"), Address * (placeholder "101 Example Road").[^explore]
Group "Payment Details": combobox "Card Type*" with options (blank), "Visa", "Mastercard"; textbox "Card Number *" (placeholder "1234 9876 1234 9876").[^explore]
Button "Submit". After submit a dialog "Processing Order" shows for a few seconds, then the confirmation (see [Order](../entities/order.md)).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- shows → [Order](/ordering/entities/order.md) _(actual)_
- step of → [Checkout](/ordering/journeys/checkout.md) _(actual)_
- [Cart](/ordering/screens/cart.md) navigates to this _(actual)_
<!-- generated:end relations -->
