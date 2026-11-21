---
type: Open Questions
title: Open questions
description: Ambiguities that neither the Sources nor the code settle, waiting for a person.
---

# Open questions

Add one item per question. Link the pages it affects and say who can answer it.
When it is answered, update the pages, cite the answer as a Source and remove the item.

Answered 2026-11-22 (tester decision): the observed behaviour is the expected behaviour for this exercise. Removed: card type and card number format, quantity 0 / -1, the spelling "nuumber", checkout after an order, total without "$". Each is drafted as an issue in test-plan/bugs/ to raise with the site owner.

- **Highest cart quantity.** Not explored. Affects [Cart quantity](ordering/rules/cart-quantity.md).

- **Test user for login?** The login dialog asks for "Username" and "Password". No test user is known; none was tried. Is a test user needed, and which role (for example a customer)? What changes after login (nav, checkout, order history)? Affects [Login validation](account/rules/login-validation.md). Who can answer: the user.
- **Message and field length limits.** The contact form shows no maximum length for Forename, Surname, Email, Telephone or Message, and no minimum for Message. Which limits are intended? Affects [Contact validation](support/rules/contact-validation.md). Not explored yet.
- **Overlay stays after "No" in Remove Item dialog.** A `modal-backdrop` kept blocking clicks until another dialog was handled. Possible application bug; reproduce in a fresh session. Affects [Cart quantity](ordering/rules/cart-quantity.md).
- **Console error on load.** Every page load logs "Failed to load resource: the server responded with a status of 403 ()" (crawl and CLI), and form interactions logged more console errors (stack in angular-ui.min.js). Observation only; cause unknown.
- **Contact message delivery.** It is unknown whether a sent feedback message is stored or emailed. Affects [Send feedback](support/journeys/send-feedback.md).
