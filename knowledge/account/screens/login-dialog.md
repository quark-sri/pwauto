---
type: Screen
title: Login dialog
description: Modal dialog opened by the nav link Login.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  step_of: [account/journeys/try-login]
---

# Login dialog

Opened by "Login" on any page; no route change. Heading "Login". Fields: textbox "Username" (placeholder "User Name"), textbox "Password"; buttons "Login", "Cancel". "Cancel" closes the dialog.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- step of → [Try login](/account/journeys/try-login.md) _(actual)_
- [Home](/catalog/screens/home.md) navigates to this _(actual)_
<!-- generated:end relations -->
