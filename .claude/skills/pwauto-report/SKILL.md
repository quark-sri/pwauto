---
name: pwauto-report
description: "Runs the pwauto suite (or a tag, area or browser), opens the HTML, Allure and Cucumber reports and writes a plain-language run summary with pass rate, failures by cause, flaky tests, coverage against the knowledge base and evidence links. Use when the user says 'run the tests', 'regression run', 'show the report', 'test results' or 'summary for the team'. Not for fixing failures (use pwauto-heal)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-report

## Objective

Give each audience what it needs from one run: the tester gets evidence per failure, the team lead gets a one-page summary, the pipeline gets machine-readable results.

## Run

| Need | Command |
|---|---|
| Everything for your app | `npm run test:app` |
| Smoke / regression | `npm run test:smoke` · `npm run test:regression` |
| One area or scenario | `npx bddgen && npx playwright test --grep "@checkout"` |
| Other browsers | `BROWSERS=chromium,firefox,webkit npm test` (set in `.env` or the shell) |
| Watch it run | `npm run test:headed` · `npm run test:ui` (time-travel UI) |
| Full evidence | `VIDEO=on TRACE=on STEP_SCREENSHOTS=true npm test` |
| Other environment | `TEST_ENV=qa npm test` (reads `.env.qa`) |

On Windows PowerShell set variables first: `$env:BROWSERS="chromium,firefox"; npm test`.

## Reports (folder `reports/`)

| Report | Open with | For |
|---|---|---|
| Playwright HTML | `npm run report` | testers: steps, screenshots, video, trace, logs, network errors, AI-fix prompt per test |
| Allure | `npm run report:allure` | trends, history, categories, timeline |
| Cucumber HTML | `npm run report:cucumber` | business readers: Gherkin with results |
| JUnit / JSON | `reports/junit.xml`, `reports/results.json`, `reports/cucumber/report.json` | CI dashboards, pipelines |
| Per-test files | `test-results/<test>/` | `error-context.md`, screenshots, `video.webm`, `trace.zip` |

## Workflow

1. Run the requested set. Note the command, environment (`TEST_ENV`, `BASE_URL`), browsers and time.
2. Read `reports/results.json` (stats + each test's status, retries, duration, errors, attachments).
3. Write `test-plan/run-summary.md`:
   ```markdown
   # Test run — <date> — <env>
   Command · browsers · duration · commit
   | Total | Passed | Failed | Flaky | Skipped/fixme | Pass rate |
   ## Failures (by cause)          test · step · cause class (see pwauto-heal) · evidence link
   ## Flaky (passed on retry)      test · retries · first error
   ## Known application bugs       @gap scenarios with their Gap page
   ## Coverage                     areas/rules in knowledge/ with no passing scenario
   ## Slowest scenarios            top 5 with duration
   ```
   Use plain language; a reader who did not run the tests must understand it.
4. Show the summary and the report commands to the user. For each failure, suggest the next step (usually `pwauto-heal`).
5. If the user asks for a shareable report, publish `run-summary.md` (or the Allure report folder) only after a yes.

## Done when

- The run finished and `test-plan/run-summary.md` matches `reports/results.json` (counts are equal).
- Every failure and flaky test is listed with evidence; the user knows how to open each report.
