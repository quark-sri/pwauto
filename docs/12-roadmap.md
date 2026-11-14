# 12. Plan and roadmap

## 12.1 Delivered

| Area | Delivered |
|---|---|
| Machine setup | `doctor` (Windows/macOS/Linux analysis, JSON for agents), `setup` (packages, browsers, `.env`, bddgen, checks), `env:set` |
| Framework core | typed env config, suites × browsers, fixtures (`pages`, `log`, `ctx`, `auth`, evidence), `BasePage`, generic UI lookup, data factory, users by role, a11y scan, logger with redaction |
| BDD | playwright-bdd, generic steps for any site (`npm run steps:list`), `@draft`/`@manual` workflow tags, missing-step snippets, AI-fix prompts |
| Agents & skills | pwauto stage skills + Playwright's `playwright-cli` and `playwright-trace`; Claude Code agents per stage; `AGENTS.md` for Codex and others; skills sync |
| Exploration | link crawler with ARIA snapshots and screenshots; CLI exploration; `auth:save` sessions; domainlore knowledge base |
| Review | qestack panel integration (no mutation testing), missing-case hunt, approval record |
| Guardrails | ESLint rules, PostToolUse edit hook, `.env` read denial, review personas |
| Reporting | HTML, Allure, Cucumber HTML/JSON, JUnit, JSON; screenshots, video, trace, logs, console and network errors |
| CI | GitHub Actions: quality gate (types, lint, weakening guard, framework unit tests, skills lint) on Ubuntu, Windows and macOS with Node.js 22 and 24; framework browser tests against the built-in fixture site on every pull request; UI tests with sharding when `BASE_URL` is set; text-only artifacts (no images, videos or traces); Allure merge; nightly; manual |
| Example | Toolshop: knowledge base, scenarios with page objects and API setup, test plan and traceability; parked scenarios: `npm run parked` |

## 12.2 Next

| Priority | Item | Why |
|---|---|---|
| High | Visual regression steps (`toHaveScreenshot`) with a Docker baseline | catch layout breaks |
| High | SSO/MFA login recipes as optional fixtures (Entra ID, Okta, TOTP) | most enterprise apps |
| High | Test management export (Xray / Zephyr / Azure Test Plans) from Cucumber JSON | traceability for QA teams |
| Medium | Network mocking steps (`page.route`) for hard-to-reach states | error and edge states |
| Medium | Dev container + Docker image for identical runs on every OS | onboarding, CI parity |
| Medium | Run-history dashboard (Allure history in CI pages) | trends and flakiness over time |
| Medium | Evaluation set for the agents (seeded apps with known bugs; measure scenario coverage and false "green" healing) | prove the agents improve |
| Low | Mobile web profiles per breakpoint, localisation runs | broader coverage |
| Low | Performance budget checks (Web Vitals) in smoke runs | early signal |

## 12.3 External dependencies

| Dependency | Used for | Version tested | If it is missing |
|---|---|---|---|
| [qestack](https://github.com/quark-sri/qestack) (plugin, not pinned) | review panel in `pwauto-review` | commit `36eec28` (2026-11-14) | the review skill falls back to a checklist review, marked "not independent" |
| [domainlore](https://github.com/quark-sri/domainlore) (plugin and `lore` CLI, not pinned) | knowledge base format, `lore build`, `lore check` | commit `45cd2f2` (2026-11-14) | pages are checked by hand against an example page; the summary says that validation did not run |
| Playwright skills `playwright-cli`, `playwright-trace` (copied into the repository) | browser and traces for agents | same version as `@playwright/test` in `package.json`; refresh with `npm run agents:update` | — |
| [practicesoftwaretesting.com](https://practicesoftwaretesting.com) (public site) | the Toolshop example only | checked on each release | the example fails with timeouts; the framework tests use the built-in fixture site and are not affected |

The two plugins are not pinned: users get the latest version. A release records the commits it was tested with in this table.

## 12.4 Known issues and risks

| Issue or risk | Effect | What we do |
|---|---|---|
| BUG-001 in the public Toolshop site: a valid billing address is rejected at random | two order scenarios are `@known-bug @fixme` | kept in the suite, listed by `npm run parked` |
| The Toolshop example depends on a public third-party site | the example can be slow, down, or blocked for CI runners | CI never runs it on its own; the framework tests use the fixture site |
| qestack and domainlore are not pinned | a plugin change can alter the review or the knowledge checks | tested commits are recorded above; the release checklist runs a full agent session |
| The Codex path is documented but not yet run in a real Codex session | setup steps for Codex can have gaps | planned for the next release check |
| Only the Toolshop example and the fixture site were run end to end | behaviour on other applications is proven by use, not by this repository | report problems as issues |

## 12.5 Releases

Versions follow [Semantic Versioning](https://semver.org); changes are recorded in [`CHANGELOG.md`](../CHANGELOG.md). Before a release, follow the [release checklist](13-release-checklist.md): checks, the example on three browsers with dated results, and an agent session on a fresh clone. The owner tags and publishes.

## 12.6 How to propose a change

Open an issue with the problem, the user who has it and the expected outcome. Framework changes follow `pwauto-framework` (configurable, documented, covered by the example suite).
