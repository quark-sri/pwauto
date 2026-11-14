# 1. Getting started

This guide takes you from nothing to a first test report. No programming knowledge is needed. Each step says what to type and what you should see.

## 1.1 What you need

| | Minimum | Recommended |
|---|---|---|
| Computer | Windows 10/11, macOS 13+, Ubuntu 22.04+ (or similar Linux), WSL2 | 8 GB RAM or more |
| Disk | 3 GB free (browsers, videos, traces) | |
| Node.js | 20.19 | 22 or 24 LTS |
| Git | any recent | |
| AI agent (optional) | [Claude Code](https://claude.com/claude-code) or [OpenAI Codex CLI](https://github.com/openai/codex) | |

You do **not** need Java, Python or admin rights for the framework itself. With an AI agent you also need [uv](https://docs.astral.sh/uv/) (`winget install astral-sh.uv`, `brew install uv`, or `curl -LsSf https://astral.sh/uv/install.sh | sh`): it runs the `lore` tool that validates the knowledge base. Check with `npm run doctor -- --ai`.

## 1.2 Install Node.js and Git

Open a terminal (Windows: *Terminal* or *PowerShell*; macOS: *Terminal*; Linux: your terminal) and check:

```bash
node --version     # should print v22.x or v24.x (at least v20.19)
git --version
```

If one is missing:

| | Windows | macOS | Ubuntu / Debian |
|---|---|---|---|
| Node.js | `winget install OpenJS.NodeJS.LTS` | `brew install node@24` or the installer from nodejs.org | `curl -fsSL https://deb.nodesource.com/setup_24.x \| sudo -E bash -` then `sudo apt-get install -y nodejs` |
| Git | `winget install Git.Git` | `xcode-select --install` | `sudo apt-get install -y git` |

Close and reopen the terminal after installing. No admin rights? Use [fnm](https://github.com/Schniz/fnm) or nvm to install Node.js in your user folder.

## 1.3 Get the project and set it up

```bash
git clone https://github.com/quark-sri/pwauto.git
cd pwauto
npm run setup
```

`npm run setup` installs the packages and the Playwright browsers, creates your `.env` settings file and ends with a **doctor** report of your machine:

```text
Required
  ✅ Node.js                            24.21.0
  ✅ npm                                11.19.0
  ✅ git                                git version 2.55.0
Browsers
  ✅ chromium                           installed
...
✅ Ready. Next: npm run test:smoke
```

Run `npm run doctor` at any time to check again. Every ❌ line shows the command that fixes it.

> **Linux:** if a browser does not start, install its system libraries once: `sudo npx playwright install-deps`.
> **Company network:** see [Troubleshooting](10-troubleshooting.md#company-network-proxy-certificates).

## 1.4 Run the example

The project contains a complete reference example against a public practice shop (`examples/toolshop/`). As long as you have not set `BASE_URL`, `npm test` runs it:

```bash
npm test
```

Later, run it any time with `npm run test:example`. It tests a public site: if that site is slow or down, its tests fail with timeouts — that is not a problem with your setup.

You will see each scenario pass (✓) or fail (✘). Then open the report:

```bash
npm run report
```

Click a test to see its Gherkin steps, screenshots, a video of a failure, the trace (a step-by-step replay), and the attached logs.

Watch the browser while tests run: `npm run test:headed`. Explore tests in Playwright's UI with time travel: `npm run test:ui`.

## 1.5 Point it at your application

```bash
npm run env:set -- BASE_URL=https://your-app.example.com
npm run test:smoke
```

The smoke scenario (`features/app/smoke.feature`) only opens the home page and checks that it loads, so it works for every site.

If your app needs a login, open `.env` in a text editor and add one pair per role (these values never leave your computer and are never committed):

```dotenv
CUSTOMER_USERNAME=jane@example.com
CUSTOMER_PASSWORD=...
```

and describe your login form (the labels you see on screen):

```dotenv
LOGIN_PATH=/login
LOGIN_USERNAME_FIELD=Email
LOGIN_PASSWORD_FIELD=Password
LOGIN_SUBMIT_BUTTON=Sign in
LOGIN_SUCCESS=/dashboard
```

Now `Given I am logged in as a "customer"` works in any scenario.

## 1.6 Work with an AI agent

Install one of:

```bash
npm install -g @anthropic-ai/claude-code     # Claude Code
npm install -g @openai/codex                  # OpenAI Codex
```

Start it **in the project folder** and ask:

```text
claude
> /pwauto  Automate https://your-app.example.com. The most important journeys are sign in, search and checkout.
```

(Codex: `codex`, then *"Follow AGENTS.md and the pwauto skill: automate https://your-app.example.com ..."*.)

The first time, Claude Code asks you to trust the project's plugins (`qestack`, `domainlore`). Accept them. What happens next is described in [AI workflow](02-ai-workflow.md).

### Codex setup

Codex has no plugins. It reads the pwauto skills from `.agents/skills/` in the project (`npm install` keeps them up to date). The review panel (qestack) and the knowledge base skills (domainlore) come from their own repositories. Install them once, in your **user folder** `~/.agents/skills/`, so they work in all your projects:

```bash
git clone https://github.com/quark-sri/qestack ~/qestack
~/qestack/scripts/install-skills.sh --agent codex --user        # needs python3

git clone https://github.com/quark-sri/domainlore ~/domainlore
~/domainlore/scripts/install-skills.sh --agent codex --user
```

On Windows, run these commands in Git Bash and add `--copy`. To update later: `git -C ~/qestack pull` (and `~/domainlore`), then run the same install command again. The setup stage (`pwauto-setup`) offers to do this for you, and `npm run doctor -- --ai` shows if the skills are found.

Do not install them with `--project .`: they are third-party skills and must not be committed with the pwauto skills. (If you did, `npm install` keeps them; only the pwauto folders are refreshed.)

What does not work the same in Codex:

| Feature | Claude Code | Codex |
|---|---|---|
| Edit check after each change (`bddgen`, ESLint) | automatic hook | the agent runs `npx bddgen` and `npx eslint <file>`, and `npm run check` before it finishes (`AGENTS.md`) |
| Review panel | separate reviewer agents | one session, one reviewer after the other; the report says "not independent" |
| Stage agents (`.claude/agents/`) | separate context per stage | the main agent follows the stage skill |

## 1.7 Keep or remove the example

The example stays in the repository as a reference for people and agents (`examples/toolshop/README.md` explains what to copy). Once `BASE_URL` is set it no longer runs with `npm test`; use `npm run test:example`. If your team prefers a clean repository:

```bash
npm run example:remove
```

## Next

- [AI workflow](02-ai-workflow.md): what each agent does and what to type.
- [Writing BDD scenarios](05-writing-bdd-scenarios.md): write and read scenarios yourself.
