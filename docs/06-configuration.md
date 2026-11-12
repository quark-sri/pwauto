# 6. Configuration

All settings are environment variables, validated at start by `src/core/config/env.ts` (a wrong value stops the run with a clear message before any browser opens).

**Where values come from** (first wins): real environment variables (shell, CI secrets) → `.env.<TEST_ENV>` → `.env`. Empty values (`KEY=`) mean "use the default".

Set a value without opening the file: `npm run env:set -- KEY=value`.

## 6.1 Application

| Variable | Default | Meaning |
|---|---|---|
| `BASE_URL` | — | Address of the application under test. Without it, only the example suite can run. |
| `API_URL` | — | Backend address for API data setup (optional). |
| `TEST_ID_ATTRIBUTE` | `data-testid` | Attribute your developers use for test IDs (`data-test`, `data-qa`, `data-cy`, …). |
| `TEST_ENV` | `local` | Name of the environment; loads `.env.<TEST_ENV>` (for example `.env.qa`). |
| `INCLUDE_EXAMPLES` | `false` | Also run `examples/toolshop`. |

## 6.2 Login and users

| Variable | Default | Meaning |
|---|---|---|
| `LOGIN_PATH` | `/login` | Path of the login page. |
| `LOGIN_USERNAME_FIELD` | `Email` | Visible label or placeholder of the user field. |
| `LOGIN_PASSWORD_FIELD` | `Password` | Visible label or placeholder of the password field. |
| `LOGIN_SUBMIT_BUTTON` | `Sign in` | Name of the submit button. |
| `LOGIN_SUCCESS` | — | Path part (`/dashboard`) or visible text (`Welcome`) that proves success. Empty: "left the login page". |
| `<ROLE>_USERNAME`, `<ROLE>_PASSWORD` | — | One pair per role. Role "store admin" → `STORE_ADMIN_USERNAME`. |

Login forms that are not a simple form (SSO, MFA, magic links): see [Test data and login](08-test-data-and-auth.md).

## 6.3 Browsers and execution

| Variable | Default | Meaning |
|---|---|---|
| `BROWSERS` | `chromium` | Comma list: `chromium`, `firefox`, `webkit`, `chrome`, `msedge`, `mobile-chrome` (Pixel 7), `mobile-safari` (iPhone 15). `chrome`/`msedge` use the installed browser. |
| `HEADLESS` | `true` | `false` shows the browser. |
| `SLOW_MO` | `0` | Milliseconds between actions (to watch a run). |
| `WORKERS` | Playwright default | Parallel workers: number or `50%`. The doctor suggests a value for your machine. |
| `RETRIES` | `2` on CI, else `0` | Retries of a failed test. A test that passes on retry is reported as **flaky**. |
| `LOCALE`, `TIMEZONE` | `en-US`, `UTC` | Browser locale and time zone (stable dates and number formats). |
| `VIEWPORT` | `1366x900` | Desktop viewport (mobile projects use the device's). |

## 6.4 Timeouts (milliseconds)

| Variable | Default | Applies to |
|---|---|---|
| `TEST_TIMEOUT` | `60000` | one whole scenario |
| `EXPECT_TIMEOUT` | `10000` | each `expect(...)` retry window |
| `ACTION_TIMEOUT` | `15000` | each click, fill, … |
| `NAVIGATION_TIMEOUT` | `30000` | each page load |

Raise them for a slow environment rather than adding waits to tests.

## 6.5 Evidence and logging

| Variable | Default | Meaning |
|---|---|---|
| `SCREENSHOT` | `on` | `on` (full page, every test), `only-on-failure`, `off`. |
| `VIDEO` | `retain-on-failure` | `on`, `off`, `retain-on-failure`, `on-first-retry`. |
| `TRACE` | `retain-on-failure` | same values; the trace is a full replay with DOM, network and console. |
| `STEP_SCREENSHOTS` | `false` | Screenshot after each Gherkin step. |
| `A11Y_CHECKS` | `false` | axe accessibility scan of every scenario's last page (attached, does not fail). |
| `LOG_LEVEL` | `warn` | Terminal log level. The report always has the full log. |
| `DATA_SEED` | random | Seed for generated data; set it to the `dataSeed` of a failed run to reproduce its data. |

## 6.6 Environments

```bash
cp .env .env.qa          # Windows: copy .env .env.qa
# edit BASE_URL and users in .env.qa
TEST_ENV=qa npm test     # Windows PowerShell: $env:TEST_ENV="qa"; npm test
```

`.env*` files are git-ignored (except `.env.example`). In CI, set the same variables as secrets.

## 6.7 Browser for AI agents (no MCP needed)

Agents drive a browser with Playwright's built-in CLI, `npx playwright cli`, guided by Playwright's own skills `playwright-cli` and `playwright-trace` (in `.claude/skills/`, copied to `.agents/skills/`). Tests themselves never need it.

| Need | Command |
|---|---|
| Open a page, read it | `npx playwright cli open <url>` · `npx playwright cli snapshot` |
| Act | `click <ref>` · `fill <ref> "text"` · `select <ref> "option"` · `goto <url>` · `close` |
| Locator for an element | `npx playwright cli generate-locator <ref>` |
| Page behind login | `npm run auth:save -- --role customer` then `npx playwright cli state-load .auth/customer.json` |
| Inspect a trace | `npx playwright trace open test-results/<test>/trace.zip` · `trace actions` · `trace errors` |
| Refresh the skills after a Playwright upgrade | `npm run agents:update` |

`npm run auth:save` reads the credentials from `.env` itself and saves only the browser session in `.auth/` (git-ignored), so the AI model never sees a password.
