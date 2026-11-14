# 13. Release checklist

Run before tagging a release. Record the result in `CHANGELOG.md` (date, OS, Node, Playwright, agent).

## Automated

- [ ] `npm run check` passes (types, lint, weakening guard, unit tests, skills lint, skills sync)
- [ ] CI is green on `main`
- [ ] `npm run test:example` on Chromium, Firefox and WebKit: record passed / fixme / failed and the date
- [ ] `npm run test:flaky-check -- --project=toolshop-chromium` green

## Agent session (manual, per release)

On a fresh clone, once with Claude Code and once with Codex, on Windows, macOS or Linux (rotate):

| # | Stage | Do | Expected |
|---|---|---|---|
| 1 | Setup | `/pwauto-setup` | doctor `--ai` all ✅, smoke passes |
| 2 | Explore | `/pwauto-explore https://demo.playwright.dev/todomvc` | knowledge pages, `lore check` 0 errors |
| 3 | Scenarios | `/pwauto-scenarios` | `@draft` features, traceability filled |
| 4 | Review | `/pwauto-review` | panel run without the Saboteur, decision record |
| 5 | Automate | `/pwauto-automate` | scenarios pass 5× (flaky check) |
| 6 | Heal | break one locator, `/pwauto-heal` | classified as locator change, fixed in the page object |
| 7 | Report | `/pwauto-report` | `test-plan/run-summary.md` counts equal `reports/results.json` |

Also run the behaviour cases in `evals/skills.jsonl` and record them in `evals/results.md`.

## Release

1. Move `## Unreleased` in `CHANGELOG.md` to `## <version> — <date>`.
2. Bump `version` in `package.json` and the skills' `metadata.version`.
3. The owner tags and publishes.
