# 7. Reports and debugging

## 7.1 What every run produces

| Report | Path | Open | Best for |
|---|---|---|---|
| Playwright HTML | `reports/html/` | `npm run report` | testers: per-test steps, screenshots, video, trace, logs |
| Allure | `reports/allure-results/` | `npm run report:allure` | history, trends, categories, timeline, retries |
| Cucumber HTML | `reports/cucumber/report.html` | `npm run report:cucumber` | business readers: the Gherkin with results |
| Cucumber JSON | `reports/cucumber/report.json` | tools (Xray, Zephyr, dashboards) | test management import |
| JUnit XML | `reports/junit.xml` | CI test tabs | pipelines |
| JSON | `reports/results.json` | scripts, the report agent | machine reading |
| Per test | `test-results/<test>/` | file explorer | `error-context.md`, `test-failed-1.png`, `video.webm`, `trace.zip` |

`npm run clean` deletes all of them.

## 7.2 Evidence attached to each test

| Attachment | When | Content |
|---|---|---|
| screenshot | always (`SCREENSHOT=on`) or on failure | full page at the end |
| `step: …` screenshots | `STEP_SCREENSHOTS=true` | after each Gherkin step |
| video | on failure (`VIDEO=retain-on-failure`) or always (`VIDEO=on`) | the whole scenario |
| trace | on failure (`TRACE=…`) | replay: each action, DOM snapshot before/after, network, console, source |
| `execution-log.txt` | always | each step, login, remembered values, data seed, warnings, duration |
| `browser-console-errors.txt` | when the page logged errors | console errors and uncaught exceptions |
| `network-errors.json` | when API/page calls failed | method, URL, status, **first 500 characters of the response body** |
| `accessibility-scan.json` | a11y step or `A11Y_CHECKS=true` | axe violations |
| 🤖 *Fix with AI* prompt | on failure | error + failing step + page snapshot, ready to paste into an AI chat (the healer agent reads it) |
| `error-context.md` | on failure | the page's accessibility snapshot at the moment of failure |

## 7.3 How to diagnose a failure (5 minutes)

1. **Read the error and the step** in the report: *which* Gherkin step failed and what was expected vs received.
2. **Look at the screenshot**: is the page what the step expected? An error banner? A spinner? A different page?
3. **Read `network-errors.json`**: a 4xx/5xx with a body often states the cause in words (real example from the bundled suite: `422 {"billing_country":["The billing_country does not match the entered address…"]}` — a test-data problem, not a UI problem).
4. **Open the trace** (`npx playwright show-trace test-results/<test>/trace.zip`, or the trace link in the HTML report): step through actions, see the DOM before and after each, the network and the console.
5. **Reproduce**: `npx playwright test --grep "<scenario name>" --headed --retries=0`, then `--repeat-each=5` to see if it is flaky.
6. **Classify** (test bug, app bug, data, timing, environment) and act — the [heal skill](../.claude/skills/pwauto-heal/SKILL.md) has the full table.

## 7.4 Interactive tools

| Tool | Command | Use |
|---|---|---|
| UI mode | `npm run test:ui` | run/watch tests, time-travel through steps, pick locators |
| Headed run | `npm run test:headed` | see the browser |
| Debug | `npm run test:debug -- --grep "<name>"` | Playwright Inspector: step through, edit locators live |
| Codegen | `npx playwright codegen <url>` | record actions to learn locators (do not paste recordings as tests) |
| Trace viewer | `npm run trace -- test-results/<test>/trace.zip` | replay a run |

## 7.5 Flaky tests

A test that fails and then passes on retry is **flaky** (shown as such in the HTML and Allure reports). Do not ignore it:

```bash
npm run test:flaky-check -- --grep "<scenario or tag>"   # 5 repeats, 4 workers, no retries
```

Usual causes: reading a list before it re-renders, acting before a single-page app is ready, shared accounts, data created by another test, animations. Fix the cause (wait for a condition, own data); never add sleeps or retries.

## 7.6 Sharing results

- Ask the report agent: *"run the regression and write a summary for the team"* → `test-plan/run-summary.md`.
- CI uploads `reports/` and `test-results/` as artifacts and builds an Allure report (see [CI/CD](09-ci-cd.md)).
