# QA project context

Shared context for QA skills (qestack and pwauto). Keep it short and current; agents read it first.

- **Product:** <one line: what the application does and for whom>
- **Application URL:** see `BASE_URL` in `.env` (environments: `.env.<name>`, `TEST_ENV=<name>`)
- **Stack under test:** web UI (any framework)
- **Test stack:** TypeScript, Playwright, playwright-bdd (Gherkin), Allure
- **Test levels here:** UI end-to-end only. No mutation testing, no fault seeding.
- **Test commands:** `npm run test:app` (all), `npm run test:smoke`, `npx playwright test --grep "<tag>"`, `npm run test:flaky-check`
- **Requirement sources:** `knowledge/` (domainlore knowledge base) — the test oracle; documents listed in `lore.toml`
- **Test design:** `features/app/<area>/*.feature`, `test-plan/test-plan.md`, `test-plan/traceability.md`
- **Conventions:** `docs/04-coding-standards.md`; page objects in `src/app/pages`, steps in `src/app/steps`
- **Critical journeys:** <list, most important first>
- **Environments and data rules:** <which environments may be changed by tests; shared accounts to avoid>
- **Review reports:** `test-plan/reviews`
- **Reports:** `reports/html`, `reports/allure-results`, `reports/cucumber`, `reports/junit.xml`
