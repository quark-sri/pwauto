---
type: Open Questions
title: Open questions
description: Ambiguities that neither the Sources nor the code settle, waiting for a person.
---

# Open questions

Add one item per question. Link the pages it affects and say who can answer it.
When it is answered, update the pages, cite the answer as a Source and remove the item.

- **Account lock after failed sign-ins?** The app does not say whether repeated wrong passwords lock an account. Tests use an unknown email for the negative case so that no demo account is locked. Affects [Login validation](account/rules/login-validation.md). Who can answer: the product owner.
- **Duplicate notifications.** "Product added to shopping cart." and "Payment was successful" each appear twice in the page. Is this intended? Affects [Cart](ordering/entities/cart.md). Who can answer: the product owner.
- **Valid billing address rejected at random.** Vienna / Austria / 1010 is rejected with 422 in about 40% of checkouts and accepted otherwise. Bug or deliberate training defect? Affects [Billing address validation](ordering/rules/billing-address.md). Evidence: `examples/toolshop/bugs/BUG-001-valid-billing-address-rejected.md`. Who can answer: the product owner.
