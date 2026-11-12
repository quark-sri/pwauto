---
type: Screen
title: Login
description: Sign-in form with email address and password, plus links to register and reset the password.
basis: actual
sources:
  - id: crawl
    resource: https://practicesoftwaretesting.com
    title: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
    basis: actual
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
relations:
  navigates_to: [account/screens/my-account]
  step_of: [account/journeys/sign-in]
---

# Login

Route `/auth/login`. Fields "Email address *" and "Password *", button "Login", a "Sign in with Google" button and links "Register your account" and "Forgot your Password?".[^crawl]
Test IDs: `email`, `password`, `login-submit`, `login-error`, `email-error`, `password-error`.[^explore]

[^crawl]: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start relations -->
## Relations

- navigates to → [My account](/account/screens/my-account.md) _(actual)_
- step of → [Sign in](/account/journeys/sign-in.md) _(actual)_
<!-- generated:end relations -->
