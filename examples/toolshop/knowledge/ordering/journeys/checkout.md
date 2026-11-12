---
type: Journey
title: Checkout
description: A signed-in customer pays for the cart and gets an invoice number.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
steps:
  - { id: cart, label: Review the cart, screen: ordering/screens/cart, actor: account/actors/customer }
  - { id: signin, label: Confirm signed in, screen: ordering/screens/checkout, actor: account/actors/customer }
  - { id: address, label: Enter the billing address, screen: ordering/screens/checkout, actor: account/actors/customer }
  - { id: pay, label: Choose a payment method and check payment, screen: ordering/screens/checkout, actor: account/actors/customer }
  - { id: confirm, label: Confirm and see the invoice number, screen: ordering/screens/checkout, actor: account/actors/customer }
---

# Checkout

Four steps: Cart → Sign in → Billing Address → Payment.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start flow -->
## Flow

```mermaid
flowchart TD
  n_cart["Review the cart<br/><small>Cart</small>"]
  n_signin["Confirm signed in<br/><small>Checkout</small>"]
  n_address["Enter the billing address<br/><small>Checkout</small>"]
  n_pay["Choose a payment method and check payment<br/><small>Checkout</small>"]
  n_confirm["Confirm and see the invoice number<br/><small>Checkout</small>"]
  n_cart --> n_signin
  n_signin --> n_address
  n_address --> n_pay
  n_pay --> n_confirm
```
<!-- generated:end flow -->

<!-- generated:start relations -->
## Relations

- [Customer](/account/actors/customer.md) performs this _(actual)_
- [Cart](/ordering/screens/cart.md) step of this _(actual)_
- [Checkout](/ordering/screens/checkout.md) step of this _(actual)_
<!-- generated:end relations -->
