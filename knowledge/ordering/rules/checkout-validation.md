---
type: Rule
title: Checkout validation
description: Required delivery and payment fields and their messages.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
  - id: decision
    resource: agent session 2026-11-22
    title: Tester decision — the observed behaviour is the expected behaviour for this exercise
    basis: intended
relations:
  governs: [ordering/entities/order]
---

# Checkout validation

- Submit with all fields empty keeps the form and shows "Almost there - but we can't send your items unless you complete the form correctly." plus "Forename is required", "Email is required", "Address is required", "Credit Card is required".[^explore]
- Surname, Telephone and Card Type are not required; an order was accepted with Card Type left blank.[^explore]
- An order was accepted with Card Number "1234 9876 1234 9876"; text "abcd" showed no format message on leaving the field (the card number format rule is not visible).[^explore]
- Valid input leads to the confirmation described in [Order](../entities/order.md).[^explore]
- Opening `#/checkout` right after an order, with an empty cart, still shows the previous confirmation (same order number) instead of an error.[^explore]

- Decision: a blank Card Type, no format message for card number "abcd", and the previous confirmation on `#/checkout` after an order are the expected behaviour (drafted as issues for the site owner).[^decision]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

[^decision]: Tester decision, 2026-11-22: Jupiter Toys is a public practice site owned by someone else; for this exercise its observed behaviour is the expected behaviour. Suspected defects are drafted as issues in test-plan/bugs/ to raise with the site owner.

<!-- generated:start relations -->
## Relations

- governs → [Order](/ordering/entities/order.md) _(actual)_
<!-- generated:end relations -->
