# 12. Plan and roadmap

## 12.1 Delivered in 0.1

| Area | Delivered |
|---|---|
| Machine setup | `doctor` (Windows/macOS/Linux analysis, JSON for agents), `setup` (packages, browsers, `.env`, bddgen, checks), `env:set` |
| Framework core | typed env config, suites × browsers, fixtures (`pages`, `log`, `ctx`, `auth`, evidence), `BasePage`, generic UI lookup, data factory, users by role, a11y scan, logger with redaction |
| BDD | playwright-bdd, 28 generic steps, `@draft`/`@manual` workflow tags, missing-step snippets, AI-fix prompts |
| Agents & skills | 9 pwauto skills + Playwright's `playwright-cli` and `playwright-trace`; 7 Claude Code agents; `AGENTS.md` for Codex and others; skills sync |
| Exploration | link crawler with ARIA snapshots and screenshots; CLI exploration; `auth:save` sessions; domainlore knowledge base |
| Review | qestack panel integration (no mutation testing), missing-case hunt, approval record |
| Guardrails | ESLint rules, PostToolUse edit hook, `.env` read denial, review personas |
| Reporting | HTML, Allure, Cucumber HTML/JSON, JUnit, JSON; screenshots, video, trace, logs, console and network errors |
| CI | GitHub Actions: quality gate (types, lint, weakening guard, framework unit tests, skills lint); UI tests with sharding when `BASE_URL` is set; text-only artifacts (no images, videos or traces); Allure merge; nightly; manual |
| Example | Toolshop: knowledge base (21 pages), 23 scenarios (21 run, 2 `@known-bug @fixme` for BUG-001), page objects, API setup, test plan and traceability |

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

## 12.3 How to propose a change

Open an issue with the problem, the user who has it and the expected outcome. Framework changes follow `pwauto-framework` (configurable, documented, covered by the example suite).
