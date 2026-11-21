---
type: Journey
title: Try login
description: A visitor opens the login dialog and submits credentials.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
steps:
  - { id: dialog, label: Open the Login dialog and submit, screen: account/screens/login-dialog, actor: account/actors/visitor }
---

# Try login

Only the negative case was explored (unknown user, fake password). The positive case needs a test user.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start flow -->
## Flow

```mermaid
flowchart TD
  n_dialog["Open the Login dialog and submit<br/><small>Login dialog</small>"]
```
<!-- generated:end flow -->

<!-- generated:start relations -->
## Relations

- [Visitor](/account/actors/visitor.md) performs this _(actual)_
- [Login dialog](/account/screens/login-dialog.md) step of this _(actual)_
<!-- generated:end relations -->
