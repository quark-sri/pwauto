# 9. CI/CD

## 9.1 GitHub Actions (included)

`.github/workflows/ui-tests.yml`:

| Trigger | What runs |
|---|---|
| Pull request | quality job (types, lint, Gherkin, skills sync) + `@smoke` on 2 shards |
| Push to `main` | quality + all scenarios |
| Nightly (Mon–Fri 02:00 UTC) | quality + full regression |
| Manual (*Run workflow*) | choose a tag filter and browsers; optionally also run the reference example |

Jobs: **quality** → **test** (matrix of 2 shards) → **report** (merges Allure results, uploads the Allure report).

The **test** job runs only when the `BASE_URL` secret is set (or a manual run asks for the example). Otherwise it is skipped with a notice, so a fresh fork is green and never depends on the public demo site.

### Evidence policy: text only in CI

CI sets `SCREENSHOT=off`, `VIDEO=off`, `TRACE=off` and uploads only text results: the HTML report, `results.json`, `junit.xml`, Cucumber HTML/JSON and Allure results. **Screenshots, videos and traces are produced only in local runs.** To investigate a CI failure, rerun the scenario locally (`npx playwright test --grep "<name>"`) and open `npm run report`.

### Secrets and variables

*Settings → Secrets and variables → Actions*:

| Secret | Example |
|---|---|
| `BASE_URL` | `https://qa.my-app.example.com` |
| `CUSTOMER_USERNAME`, `CUSTOMER_PASSWORD` | one pair per role used in scenarios (add them to the workflow `env` block too) |

Without `BASE_URL` only the quality job runs (it still generates and type-checks every scenario, including the example).

### More shards or browsers

- Shards: change `matrix.shard: [1, 2]` and `--shard=${{ matrix.shard }}/2` together.
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
| GitLab CI | image `mcr.microsoft.com/playwright:v1.65.0-noble`; `artifacts: paths: [reports/, test-results/]`; `junit: reports/junit.xml` |
| Azure DevOps | `PublishTestResults@2` with `reports/junit.xml`; `PublishPipelineArtifact@1` for `reports/` |
| Jenkins | `junit 'reports/junit.xml'`; Allure plugin with `reports/allure-results` |
| Bitbucket | `image: mcr.microsoft.com/playwright:v1.65.0-noble`; artifacts `reports/**` |

Use the official Playwright Docker image whose version equals `@playwright/test` in `package.json`.

## 9.3 Good pipeline practice

- PRs run `@smoke` (minutes); `main` and nightly run everything.
- `RETRIES=2` on CI; flaky tests are visible in the report — fix them, do not hide them.
- Keep artifacts 14–30 days. No images, videos or traces in CI; reproduce failures locally.
- Run against a dedicated test environment with its own data; never production unless the scenarios are read-only and tagged for it.
- Publish the run summary (`pwauto-report` skill) to the team channel.
