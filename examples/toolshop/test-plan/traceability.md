# Traceability — Toolshop (reference example)

Knowledge pages are under `examples/toolshop/knowledge/`; scenarios under `examples/toolshop/features/`.

| Knowledge page | Rule / journey | Scenario (file:line) | Technique | Priority | Status |
|---|---|---|---|---|---|
| account/journeys/sign-in | valid sign-in lands on My account | account/sign-in.feature:9 | happy path | 1 | automated |
| account/rules/login-validation | wrong credentials → one generic error | account/sign-in.feature:16 | equivalence partition (unknown user) | 1 | automated |
| account/rules/login-validation | email and password required | account/sign-in.feature:23 | error guessing (empty form) | 1 | automated |
| account/journeys/sign-in | sign out returns to guest state | account/sign-in.feature:30 | state transition | 2 | automated |
| ordering/entities/cart | add shows toast and badge count | shopping/cart.feature:9 | happy path | 1 | automated |
| ordering/rules/cart-totals | line total = unit price × quantity; total = sum | shopping/cart.feature:16 | calculation check | 1 | automated |
| ordering/rules/cart-totals | change quantity updates totals | shopping/cart.feature:24 | state transition | 1 | automated |
| ordering/entities/cart | remove last product empties cart | shopping/cart.feature:32 | boundary (1 → 0 items) | 2 | automated |
| catalog/rules/search | search shows only matching products | shopping/catalog.feature:12 | equivalence partition (2 keywords) | 2 | automated |
| catalog/rules/search | no match → "There are no products found." | shopping/catalog.feature:23 | negative | 2 | automated |
| catalog/rules/search | sort by price ascending | shopping/catalog.feature:28 | ordering check | 2 | automated |
| catalog/screens/product-catalog | sort by name A–Z | shopping/catalog.feature:33 | ordering check | 3 | automated |
| catalog/screens/product-catalog | filter by category | shopping/catalog.feature:38 | equivalence partition | 2 | automated |
| catalog/screens/product-catalog | category from the menu | shopping/catalog.feature:43 | navigation | 3 | automated |
| ordering/journeys/checkout | signed-in customer skips the sign-in step | shopping/checkout.feature:11 | journey | 1 | automated |
| ordering/entities/order, ordering/rules/billing-address | place an order (2 payment methods) | shopping/checkout.feature:22 | end-to-end journey, decision table (payment) | 1 | `@known-bug @fixme` (BUG-001) |
| catalog/screens/product-details | name, price, description shown | shopping/product-details.feature:9 | happy path | 2 | automated |
| catalog/rules/stock | out of stock cannot be added | shopping/product-details.feature:17 | negative, state | 2 | automated |
| support/screens/contact | valid message accepted | support/contact.feature:12 | happy path | 3 | automated |
| support/rules/contact-validation | subject and message required | support/contact.feature:17 | error guessing | 3 | automated |
| support/rules/contact-validation | message < 50 characters rejected | support/contact.feature:23 | boundary value | 3 | automated |

Rules without a scenario: none in scope. Not covered (out of scope): `catalog/terms/co2-rating` (sorting by CO₂ rating), registration.
