# Security policy

## Supported versions

The latest release and the `main` branch get security fixes.

## Report a vulnerability

Do not open a public issue for a security problem.

Report it privately through [GitHub security advisories](https://github.com/quark-sri/pwauto/security/advisories/new). Give the steps to reproduce the problem and the version or commit. You get a first answer within 7 days.

## What is in scope

pwauto is a test automation scaffold that you run on your own machine and in your own pipeline. In scope:

- a way for the framework, a script or an agent instruction to leak credentials from `.env`, `.auth/` or CI secrets into logs, reports, commits or the conversation with an AI agent
- a way for content of a tested web page to make an agent run commands or change files (prompt injection) in spite of the rules in `AGENTS.md`
- a vulnerable dependency that affects how pwauto is used

Out of scope: vulnerabilities of the application that you test with pwauto, and of the public demo site of the example.

## How pwauto protects secrets

- Credentials live only in `.env` (git-ignored) and CI secrets. Saved login sessions live in `.auth/` (git-ignored).
- Agents are told not to read `.env`; they set values with `npm run env:set` and get sessions with `npm run auth:save`. Claude Code also has deny rules for these files. Other agents (for example Codex) have only the written rule, so use test accounts with test data, never production accounts.
- The logger masks passwords, tokens and cookies. CI keeps text results only: no screenshots, videos or traces.

## Known dependency findings

`npm audit` reports moderate findings in development tools (the Allure report generator and the TypeScript lint parser, through `glob` and `minimatch`). They affect file pattern handling on the developer's machine, not the tested application. No fixed versions exist yet without a breaking change; Dependabot proposes the updates when they exist.
