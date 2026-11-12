# 11. Research and design decisions

This page records what existing AI-agentic UI test automation projects do, what we took from them, and why pwauto is built the way it is. Research date: November 2026.

## 11.1 Projects analysed

| Project | What it is | Architecture | Notable practices | Limits for our goal |
|---|---|---|---|---|
| [microsoft/playwright](https://github.com/microsoft/playwright) — Test Agents (v1.56+), `init-agents`, `init-skills`, `playwright cli` | Official planner, generator and healer agents; official agent skills; a CLI for agents | `npx playwright init-agents --loop=claude\|codex\|copilot\|…` writes agent definitions and an MCP config; `init-skills` installs `playwright-cli`, `playwright-trace` skills | Agents tied to the Playwright version; seed test; plans saved as Markdown in `specs/`; generator writes `.spec.ts` | Plain specs, no BDD; no domain knowledge; healer is allowed to change expected values and to mark tests `fixme` |
| [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) (★39k) | MCP server for browser control | Accessibility-tree snapshots instead of pixels; tools `browser_*` | `--secrets` masking, `--isolated`, capabilities (`testing`, `vision`, `pdf`) | Large tool schemas and snapshots cost context; configuration differs per agent |
| [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) (★15k) | CLI + skills for coding agents | Shell commands, element refs from snapshots, sessions, state save/load | Microsoft's guidance: CLI + skills for coding agents (token-efficient); MCP for long autonomous loops | No secret masking built in |
| [vitalets/playwright-bdd](https://github.com/vitalets/playwright-bdd) (★830) | Gherkin on the Playwright Test runner | `bddgen` generates Playwright tests from features + steps | All Playwright features (fixtures, traces, parallel, sharding); `missingSteps` snippets; AI-fix prompt attachment; step hooks; tags from paths | — (chosen) |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) (★26k) | AI-native browser SDK (`act`, `extract`, `observe`) | LLM decides actions at run time | Natural-language actions, caching of resolved actions | Non-deterministic and paid per run; hard to audit expected results in regression |
| [web-infra-dev/midscene](https://github.com/web-infra-dev/midscene) (★15.6k) | Vision-based natural-language E2E | Visual model locates elements | Works where the DOM is poor (canvas, games) | Same run-time AI trade-offs; slower |
| [lackeyjb/playwright-skill](https://github.com/lackeyjb/playwright-skill) (★3.3k) | General Playwright skill for agents | One skill, scripts run by the agent | Simple onboarding | Ad-hoc scripts, no framework |
| [niteshqa/playwright-bdd-ai-test-automation](https://github.com/niteshqa/playwright-bdd-ai-test-automation) | playwright-bdd + Claude agents | Planner, generator, healer agents; `/qa` pipeline command; skills for generation and healing | Health matrix, Docker, Husky, Allure, multiple CI files | One pipeline command does everything; no separate review gate or knowledge base |
| [EvgeniaChatzi/PlaywrightAutomation-AI](https://github.com/EvgeniaChatzi/PlaywrightAutomation-AI) | Cucumber + Claude agents | `.claude/agents` + `.mcp.json` | Planner → generator → healer | Single demo site; cucumber-js runner |
| [KKoygun/Playwright-cucumber-ai-framework](https://github.com/KKoygun/Playwright-cucumber-ai-framework) | Cucumber + own LLM agents | Own Planner/Generator/Healer classes over several model providers | Measured healer evaluation with recorded cassettes; axe scans; GitHub + Azure CI | Own agent code to maintain; provider keys required |
| Duchung1995/playwright-cucumber-ai-qa (no longer public) | Cucumber + Claude Code harness | Orchestrator, role agents, skills, hooks, rules, rubrics in `.claude/` | Rubrics and hooks as guardrails | Not available any more |
| [quark-sri/qestack](https://github.com/quark-sri/qestack) | QA skills and reviewer personas | 39 skills, 8 read-only reviewer agents, review panel | Independent reviewers, evidence rule, merged ranked findings | (used for review) |
| [quark-sri/domainlore](https://github.com/quark-sri/domainlore) | Sourced domain knowledge base | OKF pages: Entity, Rule, Actor, Journey, Screen, Term, Gap | Every fact has a source, a basis (intended/actual) and a trust tier | (used as the oracle) |

## 11.2 Common patterns (and what we adopted)

| Pattern seen | Adopted? | How in pwauto |
|---|---|---|
| Planner → generator → healer agents | ✅ extended | 7 stages with a **knowledge base** before planning and a **human review gate** before generation |
| BDD on the Playwright runner | ✅ | playwright-bdd; `missingSteps: fail-on-gen`; AI-fix prompt attached to failures |
| Accessibility snapshots instead of screenshots | ✅ | crawler saves ARIA snapshots; agents use `playwright cli snapshot` |
| Page Object Model | ✅ | `BasePage` + lazy registry (`definePages`) + components |
| Agents defined per role with limited tools | ✅ | `.claude/agents/*` (read-only tools for analysis roles), skills hold the method |
| Allure / HTML reports, CI artifacts | ✅ | HTML, Allure, Cucumber HTML/JSON, JUnit, JSON; sharded CI |
| Healer edits expected values / marks `fixme` | ❌ rejected | healer classifies; an app bug keeps its assertion and becomes a Gap + bug report + `@gap @fixme` |
| AI decides actions at run time | ❌ rejected for regression | AI writes deterministic Playwright code at authoring time; runs are fast, free and reproducible |
| One command that does everything | ❌ | gates between stages; the user approves scenarios |

## 11.3 Gaps we saw, and how pwauto closes them

1. **No oracle.** Agents wrote tests from what the page shows today, so tests confirm bugs. → `knowledge/` (domainlore) with intended vs actual facts and Gaps; scenarios cite their source.
2. **Self-review.** The agent that wrote the tests judged them. → qestack panel of independent reviewer personas + human approval.
3. **"Green at any cost" healing.** → explicit failure classes; lint rules and an edit hook block sleeps, skips, `force`, XPath; review persona *AI Behavior Auditor* checks for weakened assertions.
4. **Secrets in prompts.** → agents never read `.env`; `npm run auth:save` creates sessions without exposing passwords; logger redaction.
5. **One app, one vendor.** → generic core + suites; Agent Skills format works in Claude Code and Codex; CLI instead of per-agent MCP config.
6. **Hard onboarding for non-programmers.** → `npm run setup`/`doctor` for Windows/macOS/Linux, generic steps, plain-language docs.

## 11.4 Decisions (ADR summary)

| # | Decision | Alternatives | Why |
|---|---|---|---|
| D1 | **playwright-bdd** as BDD layer | cucumber-js + Playwright library | keeps the Playwright runner: fixtures, traces, video, parallel, sharding, UI mode, reporters |
| D2 | **Playwright CLI + skills** for agents, **no MCP** | Playwright MCP server | tests never need MCP; the CLI is built in and version-matched, uses fewer tokens, needs no per-agent configuration; sessions via `auth:save` keep credentials away from the model |
| D3 | **AI at authoring time**, deterministic tests at run time | Stagehand/Midscene-style run-time AI | reproducible, fast, free runs; auditable expected results |
| D4 | **domainlore knowledge base** as oracle | free-form notes, Playwright planner Markdown plans | sourced facts, intended vs actual, Gaps, validation with `lore check` |
| D5 | **qestack review panel**, personas chosen explicitly, **never the Saboteur** | single reviewer; mutation testing | independent review; this project is UI automation only, no mutation testing |
| D6 | **Suites** (`app`, examples) in one config | separate repositories | one engine; the example is the regression test of the core |
| D7 | **Generic steps + domain steps** | only domain steps; only generic steps | testers can start without code; real suites stay declarative |
| D8 | **Evidence fixture** on every test | manual attachments | console errors and failed calls with response bodies diagnose most failures (it found the 422 address bug in the example in one run) |
| D9 | **Configuration only through validated env** (zod) | config files per environment | one place, fail fast, CI-friendly |
| D10 | **Skills as the single source of method**, agents as thin wrappers | long agent prompts | DRY; the same method works in agents without subagents (Codex) |

## 11.5 Industry standards and practices followed

- ISTQB test design techniques (equivalence partitioning, boundary values, decision tables, state transitions, error guessing) in `pwauto-scenarios`.
- Risk-based testing: impact × likelihood drives priorities and the `@smoke` set.
- Test pyramid: UI tests only for user journeys and user-visible rules; lower-level candidates listed in the test plan.
- BDD / Specification by Example: declarative Gherkin, one behaviour per scenario, business language (Cucumber guidance).
- Playwright best practices: user-facing locators, web-first assertions, isolation, no sleeps, API setup, traces on failure.
- WCAG 2.1 A/AA checks with axe-core.
- Clean code: SOLID, DRY, KISS; strict TypeScript; ESLint with `eslint-plugin-playwright`.
- Security: secrets out of code and prompts, redaction in logs.

## 11.6 Sources

- Playwright Test Agents: https://playwright.dev/docs/test-agents
- Playwright agents in practice: https://dev.to/playwright/playwright-agents-planner-generator-and-healer-in-action-5ajh
- Playwright AI ecosystem overview: https://testdino.com/blog/playwright-ai-ecosystem-2026
- Playwright CLI vs MCP: https://github.com/microsoft/playwright-cli
- playwright-bdd docs: https://vitalets.github.io/playwright-bdd/
- Repositories listed in 11.1.
