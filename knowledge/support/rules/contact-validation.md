---
type: Rule
title: Contact validation
description: Required fields and format messages of the contact form.
basis: actual
sources:
  - id: explore
    resource: https://jupiter.cloud.planittesting.com/
    title: Interactive exploration session with Playwright (2026-11-21)
    basis: actual
---

# Contact validation

- Click "Submit" with empty fields: the intro changes to "We welcome your feedback - but we won't get it unless you complete the form correctly." and the messages "Forename is required", "Email is required", "Message is required" appear. Surname and Telephone are optional.[^explore]
- Email "bad": "Please enter a valid email".[^explore]
- Telephone "abc": "Please enter a valid telephone number". "+61 2 1234 5678" is accepted.[^explore]
- Messages appear next to the field while typing/leaving the field; they disappear when the value is valid.[^explore]
- Valid Forename, Email and Message: confirmation "Thanks Test, we appreciate your feedback." The limit on Message length (and other fields) was not tested or shown; an email was not verified to be sent.[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-21)
