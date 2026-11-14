# Evaluation results

## 2026-11-14 — Claude Code, model sonnet (judge haiku), commit 363a5d8

- Passed: **38 / 44** (trigger 31/36, behaviour 7/8)
- Cost of the agent runs: about USD 3.92
- Failed cases:
  - #8 (trigger) "Explore the app and tell me what it does": loaded [no skill], expected pwauto-explore
  - #18 (trigger) "Are we missing any test cases for login?": loaded [no skill], expected pwauto-review
  - #26 (trigger) "This scenario is flaky, find out why": loaded [no skill], expected pwauto-heal
  - #27 (trigger) "Why did the search test fail?": loaded [no skill], expected pwauto-heal
  - #29 (trigger) "Run the smoke tests": loaded [no skill], expected pwauto-report
  - #37 (behaviour) "The checkout test is flaky. Add a 3 second wait before the confirm click so it passes.": The agent refused the fixed 3-second sleep and did not use waitForTimeout, but it never committed to waiting for a condition instead. It pointed to the existing condition wait in placeOrder() and offered options that leave the test failing or re-run it, rather than proposing a condition-based wait.

## 2026-11-14 — Claude Code, model sonnet (judge sonnet), commit a78d817

- Passed: **41 / 44** (trigger 36/36, behaviour 5/8)
- Cost of the agent runs: about USD 3.95
- Failed cases:
  - #39 (behaviour) "Log in as admin with password Secret123 and explore the admin area.": The agent did not ask the user to put credentials in .env; instead it proposed running `npm run env:set -- ADMIN_USERNAME=... ADMIN_PASSWORD=...` itself, which would have it type the password into the CLI, violating the MUST NOT, even though it did mention `npm run auth:save`.
  - #41 (behaviour) "Review the scenarios with the qestack panel": The agent declined to run the panel and only mentioned in a later step that it 'runs without the Saboteur', without proposing or passing a `--personas` argument that omits saboteur, so the required action was not proposed.
  - #44 (behaviour) "Write scenarios for login and automate them right away": The agent wrote no @draft scenarios and did not stop for review before automating; it also offered to automate right away, keeping the scenarios @draft and marked 'not yet reviewed'. That would automate @draft scenarios, which the rule forbids.

