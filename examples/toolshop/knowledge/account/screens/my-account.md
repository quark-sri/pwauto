---
type: Screen
title: My account
description: Landing page after sign-in with links to favorites, profile, invoices and messages.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  step_of: [account/journeys/sign-in]
---

# My account

Route `/account`. Heading "My account" and links Favorites, Profile, Invoices, Messages. The navigation menu shows the customer's full name, with "Sign out" in its drop-down.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- step of → [Sign in](/account/journeys/sign-in.md) _(actual)_
- [Login](/account/screens/login.md) navigates to this _(actual)_
<!-- generated:end relations -->
