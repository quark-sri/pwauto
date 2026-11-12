---
name: pwauto
description: "Guides a tester from an empty clone to a passing, reviewed UI test suite for any web application: setup, exploration, BDD scenarios, review, automation, healing and reports. Use when the user says 'start', 'automate this website', 'build tests for <url>', 'what next' or '/pwauto'. Not for one step alone when the user names it (use the pwauto-<step> skill)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto — the automation workflow

## Objective

Take the user from "I have a URL" to "I have reviewed BDD scenarios, automated with Playwright, passing, with a report". The user may have little technical knowledge. Do the technical work; ask only for decisions and facts that only a person has.

## The pipeline

| # | Stage | Skill | Agent (Claude Code) | Output | Gate |
|---|---|---|---|---|---|
| 1 | Set up the machine | `pwauto-setup` | `pwauto-env-setup` | `npm run doctor` all ✅ | doctor exit 0 |
| 2 | Explore the app | `pwauto-explore` | `pwauto-app-explorer` | `knowledge/` pages | `lore check` 0 errors |
| 3 | Write BDD scenarios | `pwauto-scenarios` | `pwauto-scenario-designer` | `features/app/<area>/*.feature` with `@draft`, `test-plan/traceability.md` | every scenario traces to a knowledge page |
| 4 | Review the scenarios | `pwauto-review` | qestack review panel | `test-plan/reviews/<date>/` | user approves; `@draft` removed |
| 5 | Automate | `pwauto-automate` | `pwauto-test-automator` | page objects, steps | `npm run check` passes; scenarios run |
| 6 | Heal failures | `pwauto-heal` | `pwauto-test-healer` | fixed tests or recorded app bugs | every failure classified |
| 7 | Report | `pwauto-report` | `pwauto-report-analyst` | `reports/` + `test-plan/run-summary.md` | summary shown to user |

Framework changes (new utility, reporter, config value, CI): `pwauto-framework` / `pwauto-framework-architect`.

## Workflow

1. **Find the current stage.** Check, in order, and start at the first stage that is not done:
   - `npm run doctor -- --json` → `ready: true`? (stage 1)
   - `knowledge/index.md` has Areas for the app in `BASE_URL`? (stage 2)
   - `features/app/` has feature files besides `smoke.feature`? (stage 3)
   - Any `@draft` tag left in `features/app/`? (stage 4 pending)
   - `npm run bddgen` succeeds and `npm run test:app` was run? (stages 5–6)
   Say in one line which stage you start at and why.
2. **Ask for missing facts once**, together, before stage 2: the URL (`BASE_URL`), test users per role (they go in `.env`, never in chat history or files you commit), which areas matter most, and any environment the tests must not change (production? shared data?).
3. **Run each stage with its skill.** In Claude Code, start the stage's agent (they keep the main context small); in other agents, load the skill and follow it.
4. **Stop at every gate.** Show the user the result in plain words (what was found, what was written, what passed, what failed) and ask before the next stage. Stage 4 always needs the user's explicit approval.
5. **Close.** Point the user to `npm run report` and `test-plan/run-summary.md`, and list open questions from `knowledge/questions.md`.

## Rules for every stage

- **Never put secrets in files you commit or in chat.** Credentials live in `.env` (git-ignored) or CI secrets. Agents never read `.env`: pages behind login are explored with a saved session (`npm run auth:save -- --role <role>`, then `npx playwright cli state-load .auth/<role>.json`).
- **Ask before changing data** in a shared or production environment. Exploration never submits forms that create orders, payments or messages unless the user says it is a test environment.
- **The knowledge base is the oracle.** Expected results come from `knowledge/` (intended facts first). Never copy the current app behaviour into an assertion without checking it is the intended behaviour.
- **Tests are never weakened to get green.** No removed assertions, no `skip`, no sleeps, no `force: true`, no widened expected values. An app bug is recorded, not hidden (see `pwauto-heal`).
- **Explain in plain words.** The user may be a manual tester. Avoid jargon or explain it in one short clause.

## Done when

- Every stage gate in the table is met, or the user has decided to stop and knows the next step.
- The user has seen: the knowledge summary, the scenario list, the review verdict, the run result and where the report is.
