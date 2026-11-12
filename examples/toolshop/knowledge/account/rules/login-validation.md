---
type: Rule
title: Login validation
description: Email and password are required; wrong credentials give one generic error message.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
---

# Login validation

- Submitting the empty form shows "Email is required" and "Password is required".[^explore]
- Wrong credentials show "Invalid email or password" (it does not say which field is wrong).[^explore]
- Open question: whether repeated failed sign-ins lock the account (see questions).

[^explore]: Interactive exploration session with Playwright (2026-11-12)
