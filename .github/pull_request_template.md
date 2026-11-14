## What changes

-

## Why

-

## Evidence

- `npm run check`: <pass / output>
- Tests run (command and result, e.g. `npx playwright test --project=app-chromium --grep @cart`: 12 passed). For UI changes, attach the local report summary (CI has no screenshots or videos).

## Breaking change / migration

- <none, or what users must change: .env keys, step sentences, page object names>

## Checklist

- [ ] New scenarios were reviewed and approved (no `@draft` left in scope)
- [ ] `npm run check` passes (types, lint, weakening guard, unit tests, skills lint, skills sync)
- [ ] Affected scenarios pass, and `npm run test:flaky-check -- --project=<suite>-chromium --grep <tag>` is green
- [ ] No secrets in the change; credentials only in `.env` / CI secrets
- [ ] Application bugs found are recorded (bug report + Gap or open question + `@known-bug @fixme`)
- [ ] `CHANGELOG.md` updated under `## Unreleased` for user-visible changes
