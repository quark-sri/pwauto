@AGENTS.md

## Claude Code specifics

- Slash commands: `/pwauto` (guided workflow) and `/pwauto-<stage>` for one stage.
- Subagents in `.claude/agents/`: `pwauto-env-setup`, `pwauto-app-explorer`, `pwauto-scenario-designer`, `pwauto-framework-architect`, `pwauto-test-automator`, `pwauto-test-healer`, `pwauto-report-analyst`. Delegate a stage to its agent to keep the main context small.
- Browser for agents: `npx playwright cli` (skill `playwright-cli`); traces: `npx playwright trace` (skill `playwright-trace`). No MCP servers are used.
- Plugins enabled by `.claude/settings.json`: `qestack` (review panel, QA skills) and `domainlore` (knowledge base skills).
- A hook (`scripts/hooks/check-edit.mjs`) runs `bddgen` and ESLint after each edit of a feature or TypeScript file; fix what it reports before you continue.
- A hook (`scripts/hooks/guard-protected.mjs`) asks the person before you edit a guardrail file (lint rules, Playwright and TypeScript config, `.claude/settings.json`, hooks). Do not loosen these to get a green run.
- Deny rules block reading `.env` and `.auth/`. Do not try other ways to read them.
- Edit skills only in `.claude/skills/`; `npm install` copies them to `.agents/skills/` for other agents.
