---
type: Actor
title: Customer
description: A registered shopper who signs in to buy products and manage the account.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  performs: [account/journeys/sign-in, ordering/journeys/checkout]
aliases: [user, shopper]
---

# Customer

A Customer has an account (email and password) and can sign in, see "My account", check out and see invoices.[^explore]
Demo accounts exist for practice (for example `customer@practicesoftwaretesting.com`, shown as "Jane Doe").[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- performs → [Sign in](/account/journeys/sign-in.md) _(actual)_
- performs → [Checkout](/ordering/journeys/checkout.md) _(actual)_
<!-- generated:end relations -->
