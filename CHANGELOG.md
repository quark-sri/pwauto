# Changelog

## Unreleased

### Changed
- The Toolshop example stays in the repository as a reference. It runs with `npm test` only while `BASE_URL` is empty; otherwise run it with `npm run test:example`.
- CI produces and uploads no screenshots, videos or traces (text results only). The UI test job runs only when the `BASE_URL` secret is set (or manually with `run_example`); otherwise it is skipped with a notice, so a green CI can mean that no UI test ran.
- Request and response bodies of failed calls in `network-errors.json` are masked (`redactText`) and are off by default on CI (`CAPTURE_NETWORK_BODIES`).
- `npm run env:set` validates keys, keeps `$` characters in values, quotes values with spaces, and changes retries or timeouts only with `--confirm`.
- The edit hook works on Windows and with file names that contain spaces or quotes.
- Every agent has an explicit tool list and model.
- `npm run doctor -- --ai` requires `uv` (for `lore`) for the AI workflow.
- Heal and automate skills use `<suite>-<browser>` project names.
- `npm install` (skills sync) refreshes only the pwauto skill folders in `.agents/skills/` and keeps skills that other tools installed there; `npm run check` checks only the pwauto folders. A skill removed from `.claude/skills/` is still removed from the copy (`.agents/skills/.pwauto-skills`).

### Added
- `npm run check` now also runs the weakening guard (`scripts/guard-weakening.mjs`), the framework unit tests (`tests/unit`, offline, 37 tests) and the agent-layer lint (`scripts/lint-skills.mjs`).
- Optional PreToolUse hook `scripts/hooks/guard-protected.mjs` that asks before agents edit guardrail files (not enabled by default).
- Agent evaluation cases (`evals/skills.jsonl`, not yet run) and a release checklist (`docs/13-release-checklist.md`).
- Codex setup for the qestack and domainlore skills (user folder `~/.agents/skills/`): guide in `docs/01-getting-started.md#codex-setup`, offered by `pwauto-setup`, reported by `npm run doctor -- --ai`; "Without hooks" rules in `AGENTS.md`; Codex path for the review panel (one session, "not independent") in `pwauto-review`. Not yet verified in a real Codex session.
- Toolshop example: test plan, traceability and review record (`examples/toolshop/test-plan/`); a runnable signed-in checkout scenario.

### Known issues
- BUG-001 in the public Toolshop site: a valid billing address is rejected at random; the two order-placing scenarios are `@known-bug @fixme` (`examples/toolshop/bugs/`).
- The example depends on a public third-party site that can be slow, down, or block CI runners.

## 0.1.0 — 2026-11-12

First release.

- Generic Playwright + TypeScript + playwright-bdd framework core: validated `.env` configuration, suites × browsers, fixtures (`pages`, `log`, `ctx`, `auth`, automatic evidence), `BasePage`, generic UI lookup, data factory, users by role, axe accessibility scan.
- 28 generic Gherkin steps for any web application; `@draft` / `@manual` workflow tags.
- Machine analysis and installation for Windows, macOS and Linux (`npm run doctor`, `npm run setup`).
- AI workflow: 9 pwauto skills (Agent Skills format) and 7 Claude Code agents; `AGENTS.md` for Codex and other agents; Playwright's `playwright-cli` and `playwright-trace` skills; no MCP configuration needed.
- Site crawler, `auth:save` sessions for agents, domainlore knowledge base, qestack review panel integration (no mutation testing).
- Guardrails: ESLint rules (no sleeps, skips, focused tests, XPath, floating promises), Claude Code edit hook, `.env` read denial.
- Reports: Playwright HTML, Allure, Cucumber HTML/JSON, JUnit, JSON, with screenshots, video, trace, logs, console and network errors.
- GitHub Actions pipeline with quality gate, sharding and Allure report.
- Worked example: Toolshop (knowledge base, 23 scenarios, page objects, API setup).
