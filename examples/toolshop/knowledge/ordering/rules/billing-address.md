---
type: Rule
title: Billing address validation
description: The billing city, state and postal code must belong to the selected country, or the order is rejected.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  governs: [ordering/entities/order]
---

# Billing address validation

- The form asks for country, postal code and house number first and then looks up and fills street, city and state.[^explore]
- "Proceed to checkout" stays disabled until the address is complete.[^explore]
- When the city does not belong to the country, `POST /invoices` returns 422 "The billing_country does not match the entered address", and no order is placed.[^explore]
- The same 422 also appears, randomly, for a valid address (Vienna, Austria, 1010) — see BUG-001 and the open question.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- governs → [Order](/ordering/entities/order.md) _(actual)_
<!-- generated:end relations -->
