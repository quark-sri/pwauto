# 10. Troubleshooting

Start with `npm run doctor`: it checks your machine and prints a fix for each problem.

## Installation

| Message | Fix |
|---|---|
| `node: command not found` / `'node' is not recognized` | Install Node.js 22/24 LTS ([Getting started](01-getting-started.md#12-install-nodejs-and-git)), then reopen the terminal |
| `npm ERR! EACCES` | Do not use `sudo npm` or global installs; run commands inside the project (`npx …`) |
| `Executable doesn't exist at …ms-playwright…` | `npx playwright install` (browsers must match the Playwright version) |
| Linux: `Host system is missing dependencies` | `sudo npx playwright install-deps` |
| Windows PowerShell: `running scripts is disabled` | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Command Prompt / Git Bash |

## Company network (proxy, certificates)

| Message | Fix |
|---|---|
| `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, `SELF_SIGNED_CERT_IN_CHAIN` | Get the company root certificate (.pem) and set `NODE_EXTRA_CA_CERTS=C:\certs\company.pem` (or `/path/company.pem`) |
| Browser download hangs / `ECONNRESET` | Set `HTTPS_PROXY=http://proxy:port`; or an internal mirror: `PLAYWRIGHT_DOWNLOAD_HOST=https://mirror…` |
| Downloads blocked completely | Use installed browsers: `BROWSERS=chrome` or `BROWSERS=msedge` |
| App only reachable on VPN | Connect the VPN; `npm run doctor` shows whether `BASE_URL` is reachable |
| App uses a self-signed certificate (test env) | Add `ignoreHTTPSErrors: true` to `use` in `playwright.config.ts` for that suite |

## Running tests

| Message | Meaning and fix |
|---|---|
| `Invalid test configuration. Fix these values in .env` | A setting has a wrong format; the message names it |
| `Nothing to test: set BASE_URL …` | The example was removed and no `BASE_URL` is set: `npm run env:set -- BASE_URL=…` |
| `Missing step definitions: N` + snippets | A Gherkin step has no code. Reuse an existing sentence (`npm run steps:list`) or implement the snippet (`pwauto-automate`) |
| `Multiple definitions matched …` | Two steps match the same sentence: make one of them more specific |
| `No test user for role "x"` | Add `X_USERNAME` and `X_PASSWORD` to `.env` |
| `strict mode violation: … resolved to 2 elements` | The locator matches more than one element: narrow it (inside a region, `filter({ hasText })`, exact name) |
| `Timeout … waiting for …` | The element never appeared: check the screenshot; slow environment → raise `EXPECT_TIMEOUT`/`ACTION_TIMEOUT`, not sleeps |
| Passes alone, fails in parallel | Shared data or a race: own data per scenario, wait for a condition (see [Reports and debugging](07-reports-and-debugging.md#75-flaky-tests)) |
| `No base URL for project "app-…"` | `BASE_URL` empty for the app suite |
| Example (`toolshop-*`) tests time out | The public practice site is slow or down (check `network-errors.json` for 5xx); try later |
| Scenario not run at all | It is tagged `@draft` or `@manual`, or filtered by `--grep` |

## AI agents

| Problem | Fix |
|---|---|
| Skills not listed in Claude Code | Start `claude` in the project folder; skills are in `.claude/skills/` |
| Codex does not see the skills | `npm install` (copies them to `.agents/skills/`) or `node scripts/sync-agent-skills.mjs` |
| `/qestack:test-review-panel` unknown | `/plugin marketplace add quark-sri/qestack` then `/plugin install qestack@qestack` |
| `lore` not found | Use `uvx --from git+https://github.com/quark-sri/domainlore lore check` (needs [uv](https://docs.astral.sh/uv/)) |
| Agent cannot open pages behind login | `npm run auth:save -- --role <role>` then `npx playwright cli state-load .auth/<role>.json` |
| `playwright cli` behaves differently after an upgrade | `npm run agents:update` refreshes Playwright's agent skills |
| Edit hook reports errors after every change | It is doing its job: fix the reported `bddgen`/ESLint problem first |
