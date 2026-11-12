---
name: pwauto-scenarios
description: "Designs risk-based BDD scenarios in Gherkin from the knowledge base: declarative steps, happy, negative, boundary and role cases, tags, data tables and a traceability table. Writes them as @draft feature files for review. Use when the user says 'write test cases', 'write scenarios', 'BDD', 'feature files' or 'what should we test'. Not for automating them (use pwauto-automate)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-scenarios

## Objective

Write scenarios that a business person can read and approve, that a machine can run, and that would fail if the application broke a rule that matters. Each scenario is traceable to a knowledge page.

## Inputs

- `knowledge/` (read `index.md`, then only the areas in scope; open every Gap and Spec Conflict that touches them).
- Existing `features/app/**` and the step list: `npm run steps:list` (reuse existing step wording).
- Priorities from the user: which journeys must never break.

## Workflow

1. **Risk first.** List the journeys and rules in scope. Rate each: impact (money, security, data, legal, many users) × likelihood (complex, often changed, had bugs). Write the list to `test-plan/test-plan.md` (scope, out of scope, risks, priorities, environments, test data, entry/exit criteria). Keep it to one page.
2. **Choose the right level.** A UI scenario is for a user journey or a rule that the user sees. Pure calculations or API contracts belong to lower-level tests; list them under "Recommended below the UI" in the test plan instead of writing slow UI scenarios.
3. **Design cases per rule** with these techniques, and name the technique in your notes: equivalence partitions, boundary values (min−1, min, max, max+1), decision tables for rule combinations, state transitions (from Entity `states`), error guessing (empty, very long, special characters, double submit, back button), roles and permissions, and one end-to-end journey per critical flow.
4. **Write the feature files**: `features/app/<area>/<feature>.feature`, one feature per capability.
   ```gherkin
   # Knowledge: knowledge/<area>/rules/<rule>.md
   @<area> @draft
   Feature: <capability in business words>
     As a <actor>
     I want <goal>
     So that <value>

     @smoke @regression
     Scenario: <rule or outcome in one sentence>
       Given <state, set up the fastest way>
       When <one user action>
       Then <observable result>
   ```
   Rules for good Gherkin:
   - **Declarative, not imperative.** `When I add 2 hammers to the cart`, not `When I click "+" And I click "Add to cart"`. Generic UI steps (`I click the "X" button`) are only for a quick first draft of a simple page.
   - **One behaviour per scenario**; one `When` (a second When/Then pair only for a true end-to-end journey).
   - **Then = something the user can see**, with the exact text or value from the knowledge base. No "should work", no "page is displayed correctly".
   - **Independent.** Each scenario creates its own state (`Given I am a newly registered customer`, `Given I have added ...`). No scenario depends on another or on order.
   - **Data in the scenario only when it matters to the reader**; otherwise generated (`with a valid text`). Use `Scenario Outline` + `Examples` for partitions and boundaries; a data table for a form.
   - **Reuse step wording** from `npm run steps:list` when the meaning is the same; keep parameters in `"quotes"` or as numbers.
   - `Background` only for a `Given` every scenario in the file shares.
   - Credentials never appear in feature files; use roles (`Given I am logged in as a "customer"`).
5. **Tag** every scenario: `@draft` (until approved), one area tag, `@smoke` (the few that prove the app is up and the main journey works), `@regression`, plus `@negative`, `@boundary`, `@e2e`, `@a11y` as they apply. A scenario that tests a known Gap: tag `@gap` and link the Gap page in a comment. A case that cannot be automated: `@manual` with a reason.
6. **Traceability.** Update `test-plan/traceability.md`: | Knowledge page | Rule / journey | Scenario (file:line) | Technique | Priority |. Every rule in scope has at least one scenario, or a reason why not.
7. **Self-check** before handing over: run `npm run bddgen` (drafts are skipped, so it must still pass); read each scenario once as a business person — would they understand and agree?
8. **Hand over** to `pwauto-review`: list the feature files, the count by tag, and the rules without scenarios.

## Anti-patterns

- UI mechanics in steps (`click`, `xpath`, `wait 3 seconds`).
- Assertions copied from the current app behaviour when the knowledge base says otherwise (that hides the bug — tag `@gap` instead).
- "Kitchen-sink" scenarios that check ten things; long `Background`s; shared accounts across scenarios that change data.

## Done when

- Every in-scope rule and journey in `knowledge/` has scenarios (or a written reason), recorded in `test-plan/traceability.md`.
- All new scenarios are tagged `@draft` and `npm run bddgen` passes.
- The user has the list and knows the next step is the review.
