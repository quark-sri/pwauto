# 9. CI/CD

## 9.1 GitHub Actions (included)

`.github/workflows/ui-tests.yml`:

| Trigger | What runs |
|---|---|
| Pull request | quality + framework browser tests + `@smoke` of your application on 2 shards |
| Push to `main` | quality + framework browser tests + all scenarios |
| Nightly (Mon–Fri 02:00 UTC) | quality + framework browser tests + full regression |
| Manual (*Run workflow*) | choose a tag filter and browsers; optionally also run the reference example |

| Job | What it does |
|---|---|
| **quality** | `npm run check` (types, lint, weakening guard, framework unit tests, skills checks) and the doctor, on Ubuntu, Windows and macOS with Node.js 22.18 (the minimum) and 24 |
| **framework** | `npm run test:framework`: the generic steps and the core fixtures in a real browser against the **fixture site** of this repository (`tests/fixture-app`). Runs on Ubuntu and Windows. No internet, no secrets, so it runs on every pull request |
| **test** | your scenarios (matrix of shards). Runs only when the `BASE_URL` secret is set (or a manual run asks for the example); otherwise it is skipped with a notice |
| **report** | merges the Allure results and uploads the Allure report |

A fresh fork is green and never depends on the public demo site: the browser tests that always run use the fixture site. CI never runs the reference example on its own (the public site blocks CI runners and can be down).

### Evidence policy: text only in CI

When the `CI` variable is set, the configuration forces `SCREENSHOT=off`, `VIDEO=off`, `TRACE=off` and `STEP_SCREENSHOTS=false`, whatever `.env` or the pipeline says, and `node scripts/check-ci-evidence.mjs` fails the job if an image, video or trace file exists. CI uploads only text results: the HTML report, `results.json`, `junit.xml`, Cucumber HTML/JSON and Allure results. **Screenshots, videos and traces are produced only in local runs.** To investigate a CI failure, rerun the scenario locally (`npx playwright test --grep "<name>"`) and open `npm run report`.

### Secrets and variables

*Settings → Secrets and variables → Actions*:

| Secret | Example |
|---|---|
| `BASE_URL` | `https://qa.my-app.example.com` |
| `CUSTOMER_USERNAME`, `CUSTOMER_PASSWORD` | one pair per role used in scenarios (add them to the workflow `env` block too) |

Without `BASE_URL` the quality and framework jobs run (the quality job still generates and type-checks every scenario, including the example).

### More shards or browsers

- Shards: set the repository variable `SHARDS` to the list of shard numbers, for example `[1, 2, 3, 4]` (default `[1, 2]`).
- Browsers: the manual trigger input, or set `BROWSERS` in the workflow `env`.

## 9.2 Other CI systems

Every CI needs the same five commands:

```bash
npm ci
npx playwright install --with-deps chromium     # or the browsers you test
cp .env.example .env                             # then provide BASE_URL and users as CI secrets
npx bddgen
npx playwright test --shard=1/2                   # one line per shard/agent
```

| CI | Notes |
|---|---|
| GitLab CI | image `mcr.microsoft.com/playwright:v1.65.0-noble`; text-only artifacts: `artifacts: paths: [reports/]` (not `test-results/`); `junit: reports/junit.xml` |
| Azure DevOps | `PublishTestResults@2` with `reports/junit.xml`; `PublishPipelineArtifact@1` for `reports/` |
| Jenkins | `junit 'reports/junit.xml'`; Allure plugin with `reports/allure-results` |
| Bitbucket | `image: mcr.microsoft.com/playwright:v1.65.0-noble`; artifacts `reports/**` |

Use the official Playwright Docker image whose version equals `@playwright/test` in `package.json`.

The evidence policy is the same on every CI system. Most set `CI=true` themselves; if yours does not, set it. Then `SCREENSHOT`, `VIDEO` and `TRACE` stay off and `reports/` holds text results only. Add `node scripts/check-ci-evidence.mjs` after the tests to prove it.

## 9.3 Good pipeline practice

- PRs run `@smoke` (minutes); `main` and nightly run everything.
- Retries: the default is 2 on CI and 0 on your machine. A test that passes only on a retry is shown as **flaky** in the report: fix it. Never raise `RETRIES` to make a run green (`.env.example` must not set it, and `npm run env:set` asks for `--confirm`).
- Keep artifacts 14–30 days. No images, videos or traces in CI; reproduce failures locally.
- Run against a dedicated test environment with its own data; never production unless the scenarios are read-only and tagged for it.
- Publish the run summary (`pwauto-report` skill) to the team channel.
