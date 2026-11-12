# pwauto

**AI-agent-ready UI test automation for any web application.**
Playwright · TypeScript · BDD (Gherkin) · Claude Code / Codex agents and skills.

Clone it, point it at a web application, and let AI agents help you go from *"here is a URL"* to *reviewed, automated, passing* BDD tests with screenshots, videos, traces and logs. Testers and test analysts with little coding experience write and approve scenarios in plain English; the agents do the technical work under strict guardrails.

```text
  ┌────────┐   ┌─────────┐   ┌───────────┐   ┌────────┐   ┌──────────┐   ┌──────┐   ┌────────┐
  │ setup  │ → │ explore │ → │ scenarios │ → │ review │ → │ automate │ → │ heal │ → │ report │
  └────────┘   └─────────┘   └───────────┘   └────────┘   └──────────┘   └──────┘   └────────┘
   doctor +     crawler +     Gherkin from     qestack      page objects   classify    HTML ·
   installer    Playwright    the knowledge    panel +      + steps,       failures,   Allure ·
                CLI →         base, @draft     your         run until      never       Cucumber
                knowledge/                     approval     stable         weaken
```

## What you get

- **A generic framework** (`src/core`): typed `.env` configuration, page-object base, fixtures for logging, scenario context, login by role with session reuse, test-data factory, accessibility scans, and evidence capture (console errors, failed API calls with response bodies) on every test.
- **28 generic Gherkin steps** that work on any site (`When I click the "Sign in" button`, `Then I should see "Welcome"`), so you can start without code.
- **7 agents and 9 skills** for the whole workflow, in the open [Agent Skills](https://agentskills.io) format — they work in Claude Code and in Codex (and other agents that read `AGENTS.md` / `.agents/skills`).
- **Playwright CLI for agents** (`npx playwright cli`, built into Playwright and version-matched, with Playwright's own `playwright-cli` and `playwright-trace` skills): token-efficient browser control for exploration, locators and debugging. No MCP configuration needed. Logins for agents go through `npm run auth:save`, so the AI never sees a password.
- **A knowledge base** of the application in [domainlore](https://github.com/quark-sri/domainlore) format: the source of every expected result.
- **Review by the [qestack](https://github.com/quark-sri/qestack) panel** of independent reviewer personas, then your approval.
- **Reports**: Playwright HTML (screenshots, video, trace, logs, "fix with AI" prompt per test), Allure, Cucumber HTML, JUnit and JSON.
- **Guardrails**: ESLint rules and an edit hook block sleeps, skips, focused tests, XPath and un-awaited calls; agents may never weaken a test to make it pass.
- **CI**: GitHub Actions with sharding, artifacts and an Allure report.
- **A reference example** kept in the repo (`examples/toolshop/`): 22 scenarios against the public [Toolshop](https://practicesoftwaretesting.com) practice shop, with its knowledge base, page objects, API data setup and steps.

## Quick start

You need [Node.js 22 or 24 LTS](https://nodejs.org) and Git. Details for Windows, macOS and Linux: [docs/01-getting-started.md](docs/01-getting-started.md).

```bash
git clone https://github.com/quark-sri/pwauto.git
cd pwauto
npm run setup                 # installs packages + browsers, creates .env, checks your machine
npm test                      # no BASE_URL yet → runs the reference example
npm run report                # opens the HTML report
npm run env:set -- BASE_URL=https://your-app.example.com
npm run test:smoke            # now your app; the example stays available: npm run test:example
```

Then, with an AI agent in the project folder:

```text
claude            # or: codex
> /pwauto  Automate https://my-app.example.com — start with login and search.
```

The agent checks your machine, explores the application, writes BDD scenarios, asks you to review and approve them, automates them, fixes failures and gives you a report. It stops for your decision at every stage.

## Without AI

Everything also works by hand: write scenarios with the generic steps in `features/app/`, run `npm test`, open `npm run report`. See [docs/05-writing-bdd-scenarios.md](docs/05-writing-bdd-scenarios.md).

```gherkin
Feature: Order history
  Scenario: A customer opens the order history
    Given I am logged in as a "customer"
    When I click the "Orders" link
    Then I should see the "My orders" heading
```

## Documentation

| Guide | For |
|---|---|
| [Getting started](docs/01-getting-started.md) | everyone — install and first run on Windows, macOS, Linux |
| [AI workflow](docs/02-ai-workflow.md) | everyone — stages, agents, skills, what to type, Claude Code and Codex |
| [Architecture](docs/03-architecture.md) | automation engineers, agents |
| [Coding standards](docs/04-coding-standards.md) | automation engineers, agents |
| [Writing BDD scenarios](docs/05-writing-bdd-scenarios.md) | test analysts — Gherkin, tags, generic steps |
| [Configuration](docs/06-configuration.md) | everyone — `.env`, environments, browsers, users |
| [Reports and debugging](docs/07-reports-and-debugging.md) | everyone |
| [Test data and login](docs/08-test-data-and-auth.md) | automation engineers |
| [CI/CD](docs/09-ci-cd.md) | leads, DevOps |
| [Troubleshooting](docs/10-troubleshooting.md) | everyone |
| [Research and design decisions](docs/11-research-and-design.md) | leads, architects |
| [Roadmap](docs/12-roadmap.md) | everyone |
| [Glossary](docs/glossary.md) | everyone |

## Project layout

```text
src/core/            generic engine (never app-specific)
src/steps/common/    generic steps for any site
src/app/             YOUR app: page objects, steps, API clients, fixtures
features/app/        YOUR scenarios (.feature)
knowledge/           YOUR app's knowledge base (domainlore)
test-plan/           test plan, traceability, reviews, bug reports, run summary
examples/toolshop/   reference example (npm run test:example; optional: npm run example:remove)
.claude/             agents, skills, settings, hook   (.agents/skills = copy for Codex & others)
docs/                guides
```

## License

[Apache-2.0](LICENSE)
