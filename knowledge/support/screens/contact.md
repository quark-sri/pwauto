---
type: Screen
title: Contact
description: Feedback form with Forename, Surname, Email, Telephone, Message and Submit.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
relations:
  step_of: [support/journeys/send-feedback]
---

# Contact

Route `#/contact`. Intro "We welcome your feedback - tell it how it is."[^explore]
Fields: Forename * (placeholder "John"), Surname (placeholder "Example"), Email * (placeholder "john.example@planit.net.au"), Telephone (placeholder "02 1234 5678"), Message * (placeholder "Tell us about it..").[^explore]
Hints: "Your email address will only be used in reply to this message." and "We never send spam email or give your email address to others."; telephone "Only provide your telephone number if you want us to contact you this way."[^explore]
Link "Submit" (a link, not a button). No test-ID attributes.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start relations -->
## Relations

- step of → [Send feedback](/support/journeys/send-feedback.md) _(actual)_
- [Home](/catalog/screens/home.md) navigates to this _(actual)_
<!-- generated:end relations -->
