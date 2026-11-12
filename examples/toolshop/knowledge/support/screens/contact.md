---
type: Screen
title: Contact
description: Contact form with name, email, subject, message and an optional attachment.
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
---

# Contact

Route `/contact`. Fields first name, last name, email, subject (Customer service, Webmaster, Return, Payments, Warranty, Status of my order), message, attachment (only empty `.txt` files), button "Send".[^crawl]
A valid message shows "Thanks for your message! We will contact you shortly."[^explore]

[^crawl]: Automated crawl of practicesoftwaretesting.com (npm run explore, 2026-11-12)
[^explore]: Interactive exploration session with Playwright (2026-11-12)
