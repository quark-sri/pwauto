---
name: pwauto-heal
description: "Diagnoses failing or flaky pwauto tests from the report evidence (error, screenshot, video, trace, execution log, network errors, AI-fix prompt), classifies each failure as test bug, application bug, environment or flaky, fixes test bugs without weakening the tests and records application bugs. Use when the user says 'tests are failing', 'fix the tests', 'heal', 'flaky' or 'why did this fail'. Not for new scenarios (use pwauto-scenarios)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-heal

## Objective

A red test is information. Find out who is wrong — the test, the application, the environment or the timing — and act on that. A healer that changes expected results until the suite is green destroys the suite's value.

## Workflow

1. **Collect the failures.** Run the failing set: `npx bddgen && npx playwright test --project=<suite>-chromium --grep "<name|tag>" --retries=0`. Projects are named `<suite>-<browser>`: `app-chromium` for your app (exists only when `BASE_URL` is set), `toolshop-chromium` for the reference example (or `npm run test:example -- --grep "<name|tag>"`). List them with `npx playwright test --list`. For each failure read, in this order:
   - the error and the failing step (terminal or `reports/results.json`);
   - `test-results/<test>/error-context.md` (page snapshot at failure) and `test-failed-1.png`;
   - attachments: `execution-log.txt` (steps, data seed), `network-errors.json` (status + response body), `browser-console-errors.txt`, the "Fix with AI" prompt;
   - when needed, the trace, from the command line with the `playwright-trace` skill: `npx playwright trace open test-results/<test>/trace.zip`, then `trace actions`, `trace action <id>`, `trace requests`, `trace console`, `trace errors`, `trace snapshot <id>`; or reproduce on the live page with the `playwright-cli` skill (`npx playwright cli open <url>`, `snapshot`).
2. **Reproduce.** Run the one test again. Then `--repeat-each=5 --workers=4`. Passes sometimes → flaky (step 3d).
3. **Classify and act** (write the class next to each failure):

   | Class | Signs | Action |
   |---|---|---|
   | a. Locator changed | element not found; snapshot shows it with another name/role | update the page object locator (inspect with `npx playwright cli snapshot` + `generate-locator <ref>`); never in the step |
   | b. Timing | passes alone, fails in parallel; action before the app was ready; list read before re-render | wait for a condition: `waitUntilReady()`, `expect(...).toBeVisible()`, `waitForResponse`, `expect.poll`, `toPass()`; never a sleep |
   | c. Test data | 4xx with a validation body; shared account; data left by another test | own data per test (API setup, `uniqueId()`), valid combinations (see the knowledge rules) |
   | d. Flaky app/env | random 5xx, timeouts on a slow env | report it; at most a targeted retry in config for that project, with a comment and an issue link |
   | e. Application bug | the app does not do what `knowledge/` (intended) says | **do not change the assertion.** Record it (below) |
   | f. Test expectation wrong | the knowledge base or a person confirms the test expected the wrong thing | fix the scenario/step and cite the source; update `knowledge/` |
   | g. Environment | DNS, VPN, cert, browser missing | fix setup (`pwauto-setup`), not the test |

4. **Record an application bug** (class e):
   - `knowledge/conflicts/<slug>.md` with `type: Gap` (intended source vs actual observation), then `lore build && lore check`;
   - a bug report in `test-plan/bugs/<slug>.md`: title, steps (the scenario), expected (with source), actual, evidence (report path, screenshot, network body), environment, data seed;
   - tag the scenario `@gap @fixme` with a comment linking the Gap — the test stays and shows as "fixme" in the report, so nobody forgets it. Never delete it.
5. **Verify.** Re-run the fixed tests with `--repeat-each=5`. Run the whole affected feature once. Run `npm run check`.
6. **Report** a table to the user: test, class, root cause (one line, with evidence), action, result.

## Never

Change an expected text/value to the current app output without a source · remove an assertion or a step · add `skip`, `only`, retries or `force: true` to get green · add a sleep · catch and ignore an error · edit `.features-gen/`. If you are not sure whether the app or the test is wrong, ask the user and show the evidence.

## Done when

- Every failure has a class and evidence; test bugs are fixed and stable over 5 repeats.
- Every application bug has a Gap page, a bug report and an `@gap @fixme` scenario; the user has the table.
