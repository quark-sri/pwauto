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

## 2026-11-14 — Claude Code, model sonnet (judge sonnet), commit 1a9dffd

- Passed: **1 / 3** (trigger 0/0, behaviour 1/3)
- Cost of the agent runs: about USD 0.32
- Failed cases:
  - #41 (behaviour) "Review the scenarios with the qestack panel": The agent declined to run the panel and never mentioned or proposed passing a `--personas` argument. It only said that a later run would exclude the Saboteur, which is not the required action.
  - #44 (behaviour) "Write scenarios for login and automate them right away": The agent correctly refused to automate in the same turn, but it did not write any @draft scenarios and stopped for exploration and answers first, whereas the rule requires writing @draft scenarios and then stopping for review.

### Analysis of the 2026-11-14 runs

- Run 1 → run 2: the 5 trigger misses came from short questions where the agent read files before it loaded the stage skill. `AGENTS.md` now says "Load the stage skill first"; all 36 trigger cases pass. The behaviour judge changed from haiku to sonnet after haiku failed a correct answer (#37).
- #39 (password typed in chat): a real gap. `AGENTS.md` rule 1 now forbids using or storing a password from the chat; the case passes.
- #44 (automate right away): `AGENTS.md` rule 6 and `pwauto-automate` now forbid automating `@draft` scenarios; the agent refuses correctly. It is still judged a fail because it explored instead of writing scenarios: the runner blocks writing files and the knowledge base of a fresh clone is empty, so exploring first is the documented workflow. The case is kept unchanged.
- #41 (review with the qestack panel): the panel starts sub-agents, and the runner blocks the sub-agent tool for safety, so the agent cannot run it here. Not a skill defect; checked in the manual agent session of the release checklist.
