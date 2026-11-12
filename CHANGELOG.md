# Changelog

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
