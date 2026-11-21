---
type: Screen
title: Cart
description: Cart table with quantities, subtotals, total, Check Out and Empty Cart.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  shows: [ordering/entities/cart]
  navigates_to: [ordering/screens/checkout, catalog/screens/shop]
  step_of: [ordering/journeys/checkout]
---

# Cart

Route `#/cart`.[^explore]
With items: text "There are N items in your cart, you can Checkout or carry on Shopping." (N = total units).[^explore]
Per row: Item name, Price ("$10.99"), Quantity (number field, spinbutton), Subtotal ("$21.98"), action "Remove Item".[^explore]
Footer: "Total: 34.97" (no "$" sign in the total text), link "Check Out" (to `#/checkout`), "Empty Cart".[^explore]
Empty cart: banner "Your cart is empty - there's nothing to see here." with a link "Start Shopping »" and a close button "×".[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- shows → [Cart](/ordering/entities/cart.md) _(actual)_
- navigates to → [Checkout](/ordering/screens/checkout.md) _(actual)_
- navigates to → [Shop](/catalog/screens/shop.md) _(actual)_
- step of → [Checkout](/ordering/journeys/checkout.md) _(actual)_
- step of → [Buy toys](/catalog/journeys/buy-toys.md)
- [Shop](/catalog/screens/shop.md) navigates to this _(actual)_
<!-- generated:end relations -->
