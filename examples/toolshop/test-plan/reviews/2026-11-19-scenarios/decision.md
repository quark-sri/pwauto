# Review record — 2026-11-19 (scenarios)

- **What was reviewed:** the 3 draft scenarios of the example:
  - `support/contact.feature` — "A message of 49 characters is rejected"
  - `support/contact.feature` — "A message of 50 characters is accepted"
  - `shopping/checkout.feature` — "Checkout cannot continue while the billing address is incomplete"
- **Oracle:** `knowledge/support/rules/contact-validation.md` and `knowledge/ordering/rules/billing-address.md`. Both rules come from the exploration of 2026-11-12 (observed behaviour, not a written specification).
- **Independent:** no. The agent session that wrote the drafts showed them to the owner with the rule for each one; the qestack panel did not run on these 3 scenarios.
- **Findings:** the expected results match the rules (both sides of the 50-character limit; the continue button stays disabled without a postal code). Open, accepted for the example: only the postal code is tested as a missing field; country and house number are not tested on their own.
- **Changes:** none to the scenarios. `@draft` removed.
- **Approved by:** the project owner, in the agent session of 2026-11-19, after seeing the 3 scenarios and their rules.
