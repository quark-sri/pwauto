---
type: Actor
title: Visitor
description: An anonymous shopper; can browse, buy, check out and write to the shop without logging in.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  performs: [account/journeys/try-login, catalog/journeys/buy-toys, ordering/journeys/checkout, support/journeys/send-feedback]
aliases: [guest, shopper]
---

# Visitor

No registered user was used. What a logged-in user can do differently is unknown (see open questions).[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- performs → [Try login](/account/journeys/try-login.md) _(actual)_
- performs → [Buy toys](/catalog/journeys/buy-toys.md) _(actual)_
- performs → [Checkout](/ordering/journeys/checkout.md) _(actual)_
- performs → [Send feedback](/support/journeys/send-feedback.md) _(actual)_
<!-- generated:end relations -->
