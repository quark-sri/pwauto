---
type: Open Questions
title: Open questions
description: Ambiguities that neither the Sources nor the code settle, waiting for a person.
---

# Open questions

Add one item per question. Link the pages it affects and say who can answer it.
When it is answered, update the pages, cite the answer as a Source and remove the item.

- **Test user for login?** The login dialog asks for "Username" and "Password". No test user is known; none was tried. Is a test user needed, and which role (for example a customer)? What changes after login (nav, checkout, order history)? Affects [Login validation](account/rules/login-validation.md). Who can answer: the product owner / the user.
- **Message and field length limits.** The contact form shows no maximum length for Forename, Surname, Email, Telephone or Message, and no minimum for Message. Which limits are intended? Affects [Contact validation](support/rules/contact-validation.md). Who can answer: the product owner.
- **Card number format and Card Type.** Checkout accepted a blank Card Type, and showed no format message for card number "abcd" (only "Credit Card is required" when empty). Intended? Affects [Checkout validation](ordering/rules/checkout-validation.md). Who can answer: the product owner.
- **Quantity 0 / negative / upper limit.** Quantity 0 or -1 shows no message; totals stay at the last valid value and checkout links stop working. Intended behaviour and the maximum quantity are unknown. Affects [Cart quantity](ordering/rules/cart-quantity.md).
- **Overlay stays after "No" in Remove Item dialog.** A `modal-backdrop` kept blocking clicks until another dialog was handled. Possible application bug; reproduce in a fresh session. Affects [Cart quantity](ordering/rules/cart-quantity.md).
- **Typo "nuumber" in the order confirmation** ("Your order nuumber is"). Is the spelling intended? Affects [Order](ordering/entities/order.md).
- **Checkout with an empty cart.** `#/checkout` after an order shows the previous confirmation again. Intended? Affects [Checkout validation](ordering/rules/checkout-validation.md).
- **Total without currency symbol.** "Total: 34.97" has no "$" while prices have. Intended? Affects [Cart totals](ordering/rules/cart-totals.md).
- **Console error on load.** Every page load logs "Failed to load resource: the server responded with a status of 403 ()" (crawl and CLI), and form interactions logged more console errors (stack in angular-ui.min.js). Observation only; cause unknown.
- **Contact message delivery.** It is unknown whether a sent feedback message is stored or emailed. Affects [Send feedback](support/journeys/send-feedback.md).
