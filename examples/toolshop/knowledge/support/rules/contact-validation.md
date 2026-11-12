---
type: Rule
title: Contact form validation
description: Subject and message are required; the message needs at least 50 characters.
basis: actual
sources:
  - id: explore
    resource: https://practicesoftwaretesting.com
    title: Interactive exploration session with Playwright (2026-11-12)
    basis: actual
---

# Contact form validation

- Sending without subject and message shows "Subject is required" and "Message is required".[^explore]
- A message shorter than 50 characters shows "Message must be minimal 50 characters".[^explore]

[^explore]: Interactive exploration session with Playwright (2026-11-12)
