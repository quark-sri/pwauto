---
type: Screen
title: Home
description: Landing page with a welcome text and the Start Shopping button.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  navigates_to: [catalog/screens/shop, support/screens/contact, account/screens/login-dialog]
---

# Home

Route `#/home` (also `#/`; an unknown route such as `#/nonexistent` shows the same home page).[^explore]
Navigation bar on every page: links "Jupiter Toys", "Home", "Shop", "Contact", "Login", "Cart (N)".[^explore]
Heading h1 "Jupiter Toys", text "toys, games, puzzles, art and craft, novelties, teddy bears, bicycles, kites, models, sports, gifts..." and a link "Start Shopping »" to the shop. Footer "© Jupiter Toys 2026".[^explore]
No test-ID attributes are present; elements are found by role and name.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- navigates to → [Shop](/catalog/screens/shop.md) _(actual)_
- navigates to → [Contact](/support/screens/contact.md) _(actual)_
- navigates to → [Login dialog](/account/screens/login-dialog.md) _(actual)_
<!-- generated:end relations -->
