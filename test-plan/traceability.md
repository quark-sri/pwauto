# Traceability

Each knowledge rule or journey in scope → its scenarios. Maintained by `pwauto-scenarios` and `pwauto-review`.
Knowledge pages are under `knowledge/`; scenarios under `features/app/`. All scenarios are `@draft` (waiting for review).

| Knowledge page | Rule / journey | Scenario (file:line) | Technique | Priority | Status |
|---|---|---|---|---|---|
| catalog/screens/home | heading, welcome text, "Start Shopping »" | catalog/home.feature:9 | happy path | 3 | draft |
| catalog/screens/home | "Start Shopping »" leads to the shop | catalog/home.feature:16 | navigation | 3 | draft |
| catalog/screens/home | same nav bar on every page | catalog/home.feature:22 | equivalence partition (4 pages) | 3 | draft |
| catalog/screens/home | unknown address shows the home page (BUG-008) | catalog/home.feature:36 | error guessing | 3 | draft |
| catalog/entities/product, catalog/screens/shop | 8 toys with their prices | catalog/shop.feature:11 | data check | 1 | draft |
| catalog/rules/add-to-cart | one Buy = +1 in "Cart (N)" | catalog/shop.feature:25 | happy path | 1 | draft |
| catalog/rules/add-to-cart | same toy merged into one row | catalog/shop.feature:31 | state transition | 1 | draft |
| catalog/rules/add-to-cart | "Cart (N)" counts units, not rows | catalog/shop.feature:38 | equivalence partition | 1 | draft |
| catalog/rules/add-to-cart | cart kept across pages | catalog/shop.feature:44 | state transition (3 pages) | 2 | draft |
| ordering/rules/cart-totals | subtotal = price × quantity | ordering/cart.feature:13 | boundary (qty 1) + partitions; 3 × Valentine Bear derived from the rule | 1 | draft |
| ordering/rules/cart-totals | total = sum of subtotals (amount 34.97) | ordering/cart.feature:27 | calculation check | 1 | draft |
| ordering/screens/cart | "There are N items in your cart, …" | ordering/cart.feature:36 | happy path | 2 | draft |
| ordering/rules/cart-totals | quantity change updates subtotal, total, text, "Cart (N)" | ordering/cart.feature:45 | state transition | 1 | draft |
| ordering/rules/cart-quantity | letters cannot be typed in quantity | ordering/cart.feature:57 | error guessing | 2 | draft |
| ordering/rules/cart-quantity | quantity 0 / -1 ignored, totals keep the last valid values (BUG-003) | ordering/cart.feature:65 | boundary value | 1 | draft |
| ordering/rules/cart-quantity | Remove Item dialog text | ordering/cart.feature:79 | happy path | 2 | draft |
| ordering/rules/cart-quantity | "No" keeps the row | ordering/cart.feature:85 | state transition | 2 | draft |
| ordering/rules/cart-quantity | Empty Cart dialog text | ordering/cart.feature:91 | happy path | 2 | draft |
| ordering/rules/cart-quantity | "Yes" empties the cart | ordering/cart.feature:97 | state transition | 2 | draft |
| ordering/screens/cart | empty cart banner and "Start Shopping »" | ordering/cart.feature:107 | boundary (0 items) | 3 | draft |
| ordering/journeys/checkout, ordering/entities/order | shop → cart → checkout → confirmation, order number "JT" + 13 digits | ordering/checkout.feature:14 | end-to-end journey | 1 | draft |
| ordering/screens/checkout | Visa and Mastercard accepted | ordering/checkout.feature:22 | equivalence partition | 1 | draft |
| ordering/entities/order | cart emptied after the order | ordering/checkout.feature:33 | state transition | 1 | draft |
| ordering/rules/checkout-validation | Surname and Telephone optional | ordering/checkout.feature:39 | equivalence partition | 2 | draft |
| ordering/screens/checkout | heading "Almost there - your 1 item …" | ordering/checkout.feature:45 | happy path | 3 | draft |
| ordering/rules/checkout-validation | empty form: intro + 4 messages | ordering/checkout.feature:51 | error guessing | 1 | draft |
| ordering/rules/checkout-validation | each required field alone empty | ordering/checkout.feature:62 | decision table (per-field message derived from the all-empty case) | 1 | draft |
| ordering/rules/checkout-validation | blank Card Type accepted (BUG-004) | ordering/checkout.feature:78 | error guessing | 1 | draft |
| ordering/rules/checkout-validation | card number "abcd": no format message (BUG-005) | ordering/checkout.feature:86 | error guessing | 1 | draft |
| ordering/rules/checkout-validation | `#/checkout` right after an order shows that order again (BUG-006) | ordering/checkout.feature:94 | state transition | 2 | draft |
| support/journeys/send-feedback | required fields only → "Thanks Ada, …" | support/contact.feature:15 | happy path | 2 | draft |
| support/rules/contact-validation | all fields, telephone "+61 2 1234 5678" accepted | support/contact.feature:20 | equivalence partition (valid phone) | 2 | draft |
| support/rules/contact-validation | empty form: intro + 3 messages | support/contact.feature:25 | error guessing | 2 | draft |
| support/rules/contact-validation | each required field alone empty | support/contact.feature:34 | decision table | 2 | draft |
| support/rules/contact-validation | email "bad" | support/contact.feature:46 | equivalence partition (invalid) | 2 | draft |
| support/rules/contact-validation | telephone "abc" | support/contact.feature:51 | equivalence partition (invalid) | 2 | draft |
| support/rules/contact-validation | message disappears when valid | support/contact.feature:56 | state transition | 3 | draft |
| account/screens/login-dialog | dialog fields | account/login.feature:12 | happy path | 3 | draft |
| account/rules/login-validation | unknown user refused, dialog open, nav "Login" | account/login.feature:18 | equivalence partition | 2 | draft |
| account/rules/login-validation | empty details, same message | account/login.feature:26 | error guessing | 2 | draft |
| account/screens/login-dialog | Cancel closes | account/login.feature:32 | state transition | 3 | draft |

## Rules without a scenario (and why)
- account/rules/login-validation, account/journeys/try-login — successful login: no test user (user decision).
- ordering/rules/cart-quantity — overlay after "No" in Remove Item: seen once, not reproduced, so no scenario (BUG-007 draft); "No keeps the row" is covered.
- ordering/rules/cart-quantity — "Yes" in Remove Item: the result is not in the knowledge base (knowledge gap, add it in explore).
- support/rules/contact-validation — length limits; message delivery: unknown (open questions).
