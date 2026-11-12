---
type: Journey
title: Sign in
description: A customer signs in with email and password and lands on My account.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
steps:
  - { id: open, label: Open the login page, screen: account/screens/login, actor: account/actors/customer }
  - { id: submit, label: Enter email and password and press Login, screen: account/screens/login, actor: account/actors/customer, goto: [{ to: done, when: valid credentials }, { to: error, when: invalid credentials }] }
  - { id: error, label: See "Invalid email or password", screen: account/screens/login, goto: [] }
  - { id: done, label: Land on My account, screen: account/screens/my-account }
---

# Sign in

A valid sign-in redirects to `/account`. Unknown email or wrong password shows "Invalid email or password" and stays on the login page.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)

<!-- generated:start flow -->
## Flow

```mermaid
flowchart TD
  n_open["Open the login page<br/><small>Login</small>"]
  n_submit["Enter email and password and press Login<br/><small>Login</small>"]
  n_error["See #quot;Invalid email or password#quot;<br/><small>Login</small>"]
  n_done["Land on My account<br/><small>My account</small>"]
  n_open --> n_submit
  n_submit -->|"valid credentials"| n_done
  n_submit -->|"invalid credentials"| n_error
```
<!-- generated:end flow -->

<!-- generated:start relations -->
## Relations

- [Customer](/account/actors/customer.md) performs this _(actual)_
- [Login](/account/screens/login.md) step of this _(actual)_
- [My account](/account/screens/my-account.md) step of this _(actual)_
<!-- generated:end relations -->
