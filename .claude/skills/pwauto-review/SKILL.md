---
name: pwauto-review
description: "Reviews BDD scenarios (and later the automation code) with the qestack test review panel, finds missing cases, applies the accepted changes and gets the user's approval to move scenarios from @draft to ready. Use when the user says 'review the scenarios', 'review the test cases', 'panel review', 'are we missing cases' or 'approve'. Not for running tests (use pwauto-report) or fixing failures (use pwauto-heal)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-review

## Objective

An author does not review their own work. Before scenarios are automated, independent reviewers check that the expected results are right, that important cases are not missing, and that the scenarios are readable and at the right level. A person then approves. This project is UI test automation only: **no mutation testing and no fault seeding.**

## Requirements

The [qestack](https://github.com/quark-sri/qestack) plugin (skills `test-review-panel`, `edge-case-hunter`, `testcase-reviewer`; reviewer agents). The project settings enable it; otherwise: `/plugin marketplace add quark-sri/qestack` and `/plugin install qestack@qestack`. In Codex or other agents: `qestack/scripts/install-skills.sh --agent codex --project .` from a qestack clone.

## Review A — scenarios (after `pwauto-scenarios`, before automation)

1. **Brief.** Collect: the `@draft` feature files, the knowledge pages they cite (and every Gap / Spec Conflict linked from them), `test-plan/test-plan.md`, `test-plan/traceability.md`. State that no test may run against shared environments during review.
2. **Missing cases.** Run the qestack `edge-case-hunter` method on the rules in scope (boundaries, empty/invalid input, roles, states, concurrency, back/refresh, double submit) and compare with the scenarios. List each missing case with the rule it belongs to.
3. **Panel.** Run `/qestack:test-review-panel <feature files> --personas domain-oracle-reviewer,test-automation-architect,maintainability-craftsperson,ai-behavior-auditor,hallucination-checker`.
   - Always pass `--personas` so the **Saboteur is never selected** and no fault plan or mutation probe runs.
   - Tell the panel: the requirement source is `knowledge/`; the work was written by an AI agent; tests must not be run.
   - Reports go to `test-plan/reviews/<YYYY-MM-DD>-scenarios/` (the `Review reports` line of `.agents/qa-project-context.md`).
4. **Decide.** For each blocker and major finding and each missing case, propose: accept (with the exact change), reject (with the reason), or ask the user. Do not apply findings that contradict the knowledge base; flag them as questions instead.
5. **Approve with the user.** Show a short table: scenario, verdict, changes. Ask the user to approve per feature file (they may add or remove cases). Only after a clear "yes":
   - apply the accepted changes and the user's additions;
   - remove `@draft` from approved scenarios (keep it on the others);
   - update `test-plan/traceability.md`;
   - write `test-plan/reviews/<date>-scenarios/decision.md`: who approved, when, what changed.

## Review B — automation code (after `pwauto-automate`, before merge)

Run `/qestack:test-review-panel <changed step, page and feature files> --personas ai-behavior-auditor,hallucination-checker,test-automation-architect,determinism-flakiness-engineer,maintainability-craftsperson` (add `suite-cost-speed-reviewer` for a large suite or CI change). Focus: weakened or missing assertions, invented locators or fixtures, assertions inside page objects, sleeps, shared state, duplicated steps. The personas may run `npm run test:app -- --grep <tag>` only against a test environment. Fix the accepted findings with `pwauto-automate`.

## Without qestack

If the plugin is not available and cannot be installed, review with the checklist below yourself, one lens at a time, and state in `decision.md` that the review was **not independent**.

- Expected result is the intended behaviour from `knowledge/`, with exact text/values?
- Negative, boundary, role and state cases present for each rule?
- One behaviour per scenario, declarative steps, independent data?
- Right level (UI only for user-visible behaviour)?
- Every step, page and locator referenced exists (no invented ones)?

## Done when

- `test-plan/reviews/<date>-scenarios/` has the panel report, the missing-case list and `decision.md` with the user's approval.
- Approved scenarios have no `@draft`; `npm run bddgen` still passes.
- Rejected findings and open questions are written down with reasons.
