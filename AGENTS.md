# pwauto — instructions for AI coding agents

pwauto is a UI test automation scaffold: **Playwright + TypeScript + BDD (Gherkin via playwright-bdd)**, driven by AI agents. Users are testers with little coding experience: do the technical work, ask them only for decisions and facts, explain in plain words.

## Start here

- Workflow and stage detection: `.agents/skills/pwauto/SKILL.md` (Claude Code: `/pwauto`).
- Stage skills (Agent Skills format, in `.agents/skills/` and `.claude/skills/`):
  `pwauto-setup` → `pwauto-explore` → `pwauto-scenarios` → `pwauto-review` → `pwauto-automate` → `pwauto-heal` → `pwauto-report`; framework changes: `pwauto-framework`.
- Read the skill before you do the stage. Follow its "Done when".

## Map

| Path | What |
|---|---|
| `src/core/` | generic engine: config (`config/env.ts`), fixtures (`fixtures.ts`: `log`, `ctx`, `auth`, evidence), `BasePage`, `ui.ts`, utils. **Never app-specific.** |
| `src/steps/common/` | generic steps for any site (`npm run steps:list`) |
| `src/app/` | the app under test: `pages/` (+ `index.ts` registry), `steps/`, `api/`, `fixtures.ts` |
| `features/app/<area>/` | Gherkin scenarios of the app |
| `knowledge/` | domainlore knowledge base of the app (the test oracle) |
| `test-plan/` | test plan, traceability, reviews, bug reports, run summary |
| `examples/toolshop/` | reference example (own URL): copy its patterns; run with `npm run test:example` |
| `docs/` | guides for people and agents |
| `.features-gen/`, `reports/`, `test-results/` | generated — never edit |

## Commands

`npm run doctor` · `npm run setup` · `npm run env:set -- KEY=value` · `npm run explore -- --url <url>` · `npm run auth:save -- --role <role>` · `npx playwright cli <command>` (browser for agents, skill `playwright-cli`) · `npx playwright trace <command>` (skill `playwright-trace`) · `npx bddgen` · `npm run steps:list` · `npm run test:app` · `npm run test:smoke` · `npx playwright test --grep "<tag|name>"` · `npm run test:flaky-check` · `npm run report` · `npm run check` (types, lint, skills sync).

## Hard rules

1. **No secrets** in files you commit, in logs or in chat. Never read `.env`; set values with `npm run env:set`. For pages behind login run `npm run auth:save -- --role <role>` and load the session in the CLI (`npx playwright cli state-load .auth/<role>.json`); never type a password yourself.
2. **Expected results come from `knowledge/`**, never from the current app output alone. App wrong → Gap + bug report + `@gap @fixme`, assertion unchanged.
3. **Never weaken a test to get green**: no `waitForTimeout`, `skip`/`only`, `force: true`, removed/widened assertions, extra retries. ESLint enforces part of this.
4. **Layers**: steps call page objects; Then-steps assert with web-first `expect`; page objects hold locators and actions, no business assertions; locators: role → label → placeholder → text → test ID.
5. **Independent scenarios**: own data per scenario (API setup, `uniqueId()`), no order dependence.
6. New scenarios are `@draft` until a person approves them in `pwauto-review`. Review uses the qestack panel **without the Saboteur** (no mutation testing in this project).
7. Ask before actions with real-world effects (orders, payments, emails, deletes) unless the user confirmed a test environment.
8. Before you finish: `npm run check` and the affected tests pass.

<!-- domainlore:start -->
## Domain knowledge

Business domain facts live in `knowledge/` (OKF v0.2 markdown, built with domainlore).

- Start at `knowledge/index.md`; open only the Area and pages you need.
- Each page cites its Sources. Prefer `human-reviewed` facts; treat `unverified` ones as hints.
- `basis: intended` = what the product should do; `basis: actual` = what it does.
- Check open Gaps and Spec Conflicts (listed in the index) before you write tests or code.
- For cross-cutting questions run `lore query "<question>"`,
  `lore explain <page>` or `lore path <a> <b>`.
- Do not edit generated blocks or files; change frontmatter and run `lore build`.
<!-- domainlore:end -->
