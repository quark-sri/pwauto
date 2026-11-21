---
type: Rule
title: Login validation
description: Wrong or empty credentials show one message.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
---

# Login validation

- Unknown user "nosuchuser_x" with a fake password: "Your login details are incorrect"; the dialog stays open and the nav still shows "Login".[^explore]
- Empty username and password: the same message "Your login details are incorrect" (no "required" messages).[^explore]
- A successful login was not tried; what changes after login is unknown.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)
