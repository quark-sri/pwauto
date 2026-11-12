---
name: pwauto-framework
description: "Extends or adapts the pwauto framework core while keeping its architecture: new configuration values, fixtures, utilities, reporters, browsers, environments, authentication methods, API clients, CI pipelines and coding rules (SOLID, DRY, layered page objects). Use when the user says 'add a utility', 'support SSO/MFA', 'add an environment', 'add a reporter', 'set up CI' or 'change the framework'. Not for app-specific tests (use pwauto-automate)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-framework

## Objective

Keep the core generic and small so that any team can point it at any web application. Every change must keep the layers clean, stay configurable through `.env`, and be documented.

## Architecture rules

1. **Core knows no application.** `src/core/**` and `src/steps/common/**` never import from `src/app/` or `examples/`, never contain an app URL, label or test ID.
2. **Configuration through environment.** Every new setting: add it to the zod schema in `src/core/config/env.ts` (type, default, clear error), to `.env.example` (comment + safe default) and to `docs/06-configuration.md`. Never read `process.env` elsewhere, except role credentials in `utils/users.ts`.
3. **Extend by composition.** New capabilities are fixtures (`test.extend`) or helpers; suites extend `@core/fixtures` (`src/app/fixtures.ts`, `examples/*/fixtures.ts`). Page objects compose components instead of deep inheritance (BasePage is the only base class).
4. **SOLID in practice.** One reason to change per file (S); add a suite, page or fixture without editing existing ones (O); a page object can replace another with the same intent (L); small fixture interfaces (`Auth`, `ScenarioContext`) (I); steps depend on fixtures, not on `new` (D).
5. **DRY without magic.** Shared behaviour goes in one place (helper, component, fixture). Do not build "smart" generic layers that hide what a test does; readability wins over cleverness.
6. **Evidence by default.** Anything that helps a failure diagnosis is attached to the report by a fixture (as `evidence` does), not printed.
7. **Guardrails are code.** A rule that matters gets an ESLint rule or a hook, not only a sentence.

## Common tasks

| Task | Where |
|---|---|
| New setting | `src/core/config/env.ts` + `.env.example` + `docs/06-configuration.md` |
| New environment (qa, staging) | `.env.<name>` (not committed) + `TEST_ENV=<name>`; CI secrets per environment |
| New browser / device | `browserUse` map in `playwright.config.ts` + `BROWSERS` enum in `env.ts` |
| SSO / MFA login | an app auth fixture in `src/app/fixtures.ts` that logs in through the API or a token, or a Playwright `setup` project saving `storageState`; TOTP via an `otpauth` secret in `.env` |
| API client | `src/app/api/<Name>Api.ts` using the `request` fixture; expose it as a fixture |
| Visual checks | `await expect(page).toHaveScreenshot()` in a dedicated `@visual` step; baseline per browser/OS; run in one OS (CI container) |
| Accessibility | `scanAccessibility()` in `src/core/utils/a11y.ts`; step `the page should have no serious accessibility violations`; `A11Y_CHECKS=true` for a scan of every scenario |
| Reporter | `reporter` array in `playwright.config.ts`; output under `reports/` |
| CI | `.github/workflows/ui-tests.yml` (sharding, artifacts, report); other CI: the same commands (`npm ci`, `npx playwright install --with-deps`, `npm test`) |
| New suite (second app) | `suites` in `playwright.config.ts` like `examples/toolshop/suite.ts` |

## Workflow

1. Read `docs/03-architecture.md` and the files you will change. Say which rule above the change follows.
2. Make the smallest change; keep the public fixture names stable (`page`, `pages`, `log`, `ctx`, `auth`).
3. Verify: `npm run check`, `npm run test:smoke`, and `INCLUDE_EXAMPLES=true npm test` (the example suite is the regression test of the core).
4. Update the docs and `CHANGELOG.md`.

## Done when

- The example suite and the app smoke test pass; `npm run check` passes.
- The new behaviour is configurable, documented and covered by at least one scenario.
