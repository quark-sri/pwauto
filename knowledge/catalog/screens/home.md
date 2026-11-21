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
  - id: decision
    resource: agent session 2026-11-22
    title: Tester decision — the observed behaviour is the expected behaviour for this exercise
    basis: intended
relations:
  navigates_to: [catalog/screens/shop, support/screens/contact, account/screens/login-dialog]
---

# Home

Route `#/home` (also `#/`; an unknown route such as `#/nonexistent` shows the same home page).[^explore]
Navigation bar on every page: links "Jupiter Toys", "Home", "Shop", "Contact", "Login", "Cart (N)".[^explore]
Heading h1 "Jupiter Toys", text "toys, games, puzzles, art and craft, novelties, teddy bears, bicycles, kites, models, sports, gifts..." and a link "Start Shopping »" to the shop. Footer "© Jupiter Toys 2026".[^explore]
No test-ID attributes are present; elements are found by role and name.[^explore]

Decision: an unknown route showing the home page is the expected behaviour (drafted as an issue for the site owner).[^decision]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

[^decision]: Tester decision, 2026-11-22: Jupiter Toys is a public practice site owned by someone else; for this exercise its observed behaviour is the expected behaviour. Suspected defects are drafted as issues in test-plan/bugs/ to raise with the site owner.

<!-- generated:start relations -->
## Relations

- navigates to → [Shop](/catalog/screens/shop.md) _(actual)_
- navigates to → [Contact](/support/screens/contact.md) _(actual)_
- navigates to → [Login dialog](/account/screens/login-dialog.md) _(actual)_
<!-- generated:end relations -->
