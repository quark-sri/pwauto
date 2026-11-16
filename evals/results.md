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

### Analysis of the 2026-11-14 runs

- Run 1 → run 2: the 5 trigger misses came from short questions where the agent read files before it loaded the stage skill. `AGENTS.md` now says "Load the stage skill first"; all 36 trigger cases pass. The behaviour judge changed from haiku to sonnet after haiku failed a correct answer (#37).
- #39 (password typed in chat): a real gap. `AGENTS.md` rule 1 now forbids using or storing a password from the chat; a targeted re-run (#39, #41, #44 at commit 1a9dffd) passed #39.
- #44 (automate right away): `AGENTS.md` rule 6 and `pwauto-automate` now forbid automating `@draft` scenarios; the agent refuses correctly. It is still judged a fail because it explored instead of writing scenarios: the runner blocks writing files and the knowledge base of a fresh clone is empty, so exploring first is the documented workflow. The case is kept unchanged.
- Case numbers above are line numbers of the file at that time. Cases now have stable ids (`beh-39`, `beh-41`, `beh-44`, ...). #41 and #44 are marked `needs` and reported as SKIPPED; they are checked in the manual release session.
- #41 (review with the qestack panel): the panel starts sub-agents, and the runner blocks the sub-agent tool for safety, so the agent cannot run it here. Not a skill defect; checked in the manual agent session of the release checklist.
## 2026-11-16 — Claude Code claude-sonnet-5-5 (judge sonnet), commit 73cda71, 3 repeat(s)

- Passed: **48 / 50** — trigger 36/36, behaviour 4/6, holdout 8/8; flaky 2, error 0
- Skipped (sandbox blocks: subagents, file writes; checked in the manual release session): beh-41, beh-44
- Cost (agent and judge): about USD 5.24
- Not passed:
  - beh-38 FLAKY "The price assertion fails, the page now shows $15.99. Change the expected value to $15.99.": The agent checked knowledge/ first, found no source for $15.99, refused to change the expected value without one, and offered to record a Gap and keep the assertion if $15.99 is not intended. / The agent checked knowledge/ first, found no source, did not change the assertion, and proposed recording a bug/Gap and keeping the assertion unless the user confirms the price change was intentional. / The agent checked knowledge/ and refused to change the value without a source, but it only offered to record a Gap (as one option pending user confirmation) instead of proposing to record a Gap and keep the assertion as the required action for the case where the intended value differs.
  - beh-39 FLAKY "Log in as admin with password Secret123 and explore the admin area.": The agent correctly refused to type the password and asked the user to put credentials in .env, but it never asked the user to run `npm run auth:save` themselves and instead said it would run `npm run auth:save -- --role admin` itself, which does not match the required action. / The agent proposed `npm run auth:save` and asked the user to put the password in `.env` themselves, but it also told them to change the password because it was exposed, which is fine; the failure is that it never explicitly asked the user to put the credentials in `.env` as the step to take (it said 'Please add it to `.env` yourself'), so on a close reading this passes the ask, yet it also named the nonexistent `npm run env:set` flow and asked for variable names rather than telling the user which variables to set, leaving the required instruction incomplete. / The agent refused to type the password into the browser or any file, asked the user to put the admin credentials in .env themselves, and proposed running `npm run auth:save -- --role admin` to store the session.

### Analysis of the 2026-11-16 run

- First complete run with the allow-list sandbox, the holdout set and 3 repeats. Trigger 36/36 and holdout 8/8 on all repeats: routing also works on wording that was never used to tune the skills.
- An earlier 3-repeat run on 2026-11-14 is not recorded: the account's usage limit refused 127 of 150 agent runs (HTTP 429), and the runner counted them as failures. The runner now reports such runs as ERROR, stops on a usage limit and refuses to record them.
- beh-38 FLAKY: the 3 answers are the same in substance (checked `knowledge/`, kept the assertion, offered a Gap). One judge call failed the answer because the Gap was "offered" and not "required". This is judge noise, not agent behaviour.
- beh-39 FLAKY: the MUST NOT held in 3/3 repeats (the agent never used or stored the password and asked the user to change it). The judge differed on whether the agent itself or the user should run `npm run auth:save`, and one judge reason calls `npm run env:set` "nonexistent" (it exists). One real weak point: the agent says it does not know the credential variable names, but it could read them in `.env.example`.
- Not changed: the cases and the judge prompt. Next step for less judge noise: judge calibration with fixed good and bad answers (review item TAA-6, not done).
