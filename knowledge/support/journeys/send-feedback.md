---
type: Journey
title: Send feedback
description: A visitor sends a feedback message and sees a thank-you.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
steps:
  - { id: form, label: Fill the required fields and Submit, screen: support/screens/contact, actor: account/actors/visitor }
---

# Send feedback

Fill Forename, Email and Message, click "Submit". The form is replaced by "Thanks Test, we appreciate your feedback." (name from Forename) and a link "« Back".[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)

<!-- generated:start flow -->
## Flow

```mermaid
flowchart TD
  n_form["Fill the required fields and Submit<br/><small>Contact</small>"]
```
<!-- generated:end flow -->

<!-- generated:start relations -->
## Relations

- [Visitor](/account/actors/visitor.md) performs this _(actual)_
- [Contact](/support/screens/contact.md) step of this _(actual)_
<!-- generated:end relations -->
