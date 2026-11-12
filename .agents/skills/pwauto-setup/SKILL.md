---
name: pwauto-setup
description: "Analyses the user's computer (Windows, macOS or Linux), then installs and verifies everything pwauto needs: Node.js check, npm packages, Playwright browsers, .env, the agent skills and the qestack and domainlore plugins. Use when the user says 'set up', 'install', 'it does not run', 'browser not found', or on a fresh clone. Not for application exploration (use pwauto-explore)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-setup

## Objective

A tester clones the repository on any laptop and, without knowing Node.js or Playwright, ends with a machine that runs `npm run test:smoke`. Detect first, explain, then install — and only what is missing.

## Workflow

1. **Analyse.** Run `node scripts/doctor.mjs --json` (works before `npm install`). Read `platform`, `arch` and each check. Tell the user in 3–6 lines: their OS and version, CPU/RAM (and the suggested `WORKERS`), what is installed, what is missing.
2. **Fix what blocks `npm`.** If Node.js is missing or older than 20.19, do not try to install it silently. Give the one command for their OS and ask them to run it (prefix `!` in Claude Code so the output lands in the session):

   | OS | Node.js 22/24 LTS |
   |---|---|
   | Windows | `winget install OpenJS.NodeJS.LTS` (then reopen the terminal) |
   | macOS | `brew install node@24` or the installer from nodejs.org |
   | Linux (Debian/Ubuntu) | `curl -fsSL https://deb.nodesource.com/setup_24.x \| sudo -E bash - && sudo apt-get install -y nodejs` |
   | Any, without admin rights | `fnm` or `nvm` (nvm-windows on Windows) |

   Git missing: Windows `winget install Git.Git`, macOS `xcode-select --install`, Linux `sudo apt-get install git`.
3. **Install.** Run `npm run setup` (it runs `npm ci`/`npm install`, creates `.env` from `.env.example`, installs the browsers listed in `BROWSERS`, runs `bddgen` and the doctor). Options: `-- --all-browsers`, and on Linux CI `-- --with-deps` (needs sudo; otherwise ask the user to run `sudo npx playwright install-deps`).
4. **Configure.** Ask for the application URL and set `BASE_URL` in `.env`. Ask which attribute developers use for test IDs (look at the page if unsure: `data-testid`, `data-test`, `data-qa`, `data-cy`) and set `TEST_ID_ATTRIBUTE`. Ask the user to add test users to `.env` themselves (`<ROLE>_USERNAME`, `<ROLE>_PASSWORD`) — do not ask them to paste passwords in chat. Fill the `LOGIN_*` values after exploration if the login form labels are not known yet.
5. **AI tooling.**
   - Browser for agents: Playwright's built-in CLI (`npx playwright cli`) with the skills `playwright-cli` and `playwright-trace` in `.claude/skills/` (copied to `.agents/skills/`). No MCP servers are needed. After a Playwright upgrade run `npm run agents:update` to refresh these skills.
   - Claude Code plugins: the project settings enable `qestack` and `domainlore`; if `/plugin` shows them missing, run `/plugin marketplace add quark-sri/qestack` and `/plugin marketplace add quark-sri/domainlore`, then `/plugin install qestack@qestack` and `/plugin install domainlore@domainlore`.
   - Codex and other agents: skills are in `.agents/skills/` (kept in sync by `npm install`); instructions in `AGENTS.md`.
   - Optional: `uv` (for `lore check`), `gh` (pull requests).
6. **Write the QA project context** used by the qestack skills: create or update `.agents/qa-project-context.md` from its template (stack: TypeScript + Playwright + playwright-bdd; test commands; report folders; `Review reports: test-plan/reviews`). Keep existing human edits.
7. **Verify.** Run `npm run doctor` (expect exit 0), then `npm run test:smoke`. Show the result. If a browser fails to launch on Linux, it is almost always missing OS libraries (step 3).

## Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Executable doesn't exist at ...ms-playwright...` | Browsers not installed for this Playwright version: `npx playwright install` |
| `EACCES` / permission denied on `npm install -g` | Do not use global installs; everything runs through `npx` |
| `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`, `SELF_SIGNED_CERT_IN_CHAIN` | Corporate proxy: set `NODE_EXTRA_CA_CERTS=<path to company CA .pem>` and `HTTPS_PROXY` |
| Download of browsers blocked | Set `PLAYWRIGHT_DOWNLOAD_HOST` to an internal mirror, or use `BROWSERS=chrome` / `msedge` (installed browsers) |
| Windows: scripts disabled in PowerShell | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`, or use Git Bash / cmd |
| WSL: headed browser does not open | Use `HEADLESS=true`, or WSLg on Windows 11 |
| Apple Silicon: Rosetta warnings | Use the arm64 Node.js build (`node -p process.arch` → `arm64`) |

## Done when

- `npm run doctor` exits 0 and the user has seen its summary.
- `.env` has `BASE_URL` (and test users if the app needs a login); nothing secret was committed or echoed.
- `npm run test:smoke` passes, or the user knows the one remaining action and why.
