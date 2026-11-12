---
type: Entity
title: Order
description: A placed purchase with a billing address, payment method and an invoice number.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
states: [cart, address-entered, paid, placed]
transitions:
  - { from: cart, to: address-entered, trigger: account/actors/customer, cites: [explore] }
  - { from: address-entered, to: paid, trigger: account/actors/customer, cites: [explore] }
  - { from: paid, to: placed, trigger: account/actors/customer, cites: [explore] }
relations:
  has: [ordering/entities/cart]
---

# Order

After a successful payment check and "Confirm", the shop shows "Thanks for your order! Your invoice number is INV-<number>".[^explore]
Payment methods: Bank Transfer (bank name, account name, account number), Cash on Delivery, Credit Card, Buy Now Pay Later, Gift Card.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start lifecycle -->
## Lifecycle

```mermaid
stateDiagram-v2
  [*] --> cart
  cart --> address-entered : Customer (actual)
  address-entered --> paid : Customer (actual)
  paid --> placed : Customer (actual)
```

_Labels: (intended) = specified only · (actual) = seen in app or code only._
<!-- generated:end lifecycle -->

<!-- generated:start relations -->
## Relations

- has → [Cart](/ordering/entities/cart.md) _(actual)_
- [Billing address validation](/ordering/rules/billing-address.md) governs this _(actual)_
- [Checkout](/ordering/screens/checkout.md) shows this _(actual)_
<!-- generated:end relations -->
