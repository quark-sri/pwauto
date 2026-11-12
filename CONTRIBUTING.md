# Contributing to pwauto

Thank you for your interest in pwauto. This guide tells you how to report problems, suggest changes and send pull requests.
## Ways to contribute

- **Report a bug.** Tell us what does not work.
- **Suggest a feature.** Tell us what you need and why.
- **Improve the documentation.** Fix errors, or make a guide easier to understand.
- **Change the code.** Fix a bug, or add a feature to the framework, the generic steps, the agents or the skills.

For a large change, open an issue first. Describe the change and wait for a maintainer to agree. This prevents work that we cannot accept.

## Report a bug

1. Search the [open issues](https://github.com/quark-sri/pwauto/issues). Make sure that nobody reported the bug before.
2. [Open a new issue](https://github.com/quark-sri/pwauto/issues/new).
3. Give this information:
   - the steps to reproduce the bug
   - the result that you expected
   - the result that you got
   - your operating system and Node.js version
   - the output of `npm run doctor`

Do not include secrets, passwords or session files. Remove them from logs and screenshots before you attach them.

To report a security problem, do not open a public issue. Follow the instructions in the [Security section of the README](README.md#security).

## Set up your development environment

1. [Fork the repository](https://github.com/quark-sri/pwauto/fork) on GitHub.
2. Clone your fork:

   ```bash
   git clone https://github.com/<your-user>/pwauto.git
   cd pwauto
   ```

3. Install the project:

   ```bash
   npm run setup
   ```

4. Make sure that everything works:

   ```bash
   npm run check
   npm run test:example
   ```

For help with installation, read [Getting started](docs/01-getting-started.md) and [Troubleshooting](docs/10-troubleshooting.md).

## Make a change

1. Create a branch from `main`:

   ```bash
   git checkout -b fix/short-description
   ```

2. Make your change. Follow the rules in the next section.
3. Run the checks:

   ```bash
   npm run check
   ```

4. Run the tests that your change affects. For example:

   ```bash
   npx playwright test --grep @smoke
   npm run test:example
   ```

5. For changes that users can see, add an entry under `## Unreleased` in [CHANGELOG.md](CHANGELOG.md).
6. Commit your change. Write a clear commit message (see [Commit messages](#commit-messages)).
7. Push the branch to your fork and open a pull request.

## Rules for changes

Read the [coding standards](docs/04-coding-standards.md) and the [architecture](docs/03-architecture.md) before you change code. These are the most important rules:

- **Keep the core generic.** Code in `src/core/` and `src/steps/common/` must work for any web application. Put code for one application in `src/app/` or in `examples/`.
- **Never weaken a test.** Do not add fixed waits (`waitForTimeout`), skipped or focused tests, `force: true` or extra retries. Do not remove or widen assertions to make a test pass. ESLint and the weakening guard block many of these.
- **Use the correct layers.** Steps call page objects. Page objects hold locators and actions, but no business assertions. Then-steps assert with web-first `expect`.
- **Use good locators.** Use this order: role, label, placeholder, text, test ID. Do not use XPath.
- **Keep scenarios independent.** Each scenario creates its own data. No scenario depends on the order of other scenarios.
- **No secrets.** Do not commit credentials, tokens or session files. Use `.env` and CI secrets.
- **Expected results come from the knowledge base.** Do not copy the current output of the application into an assertion. If the application is wrong, record a bug.

### Change skills and agents

- Edit skills only in `.claude/skills/`. `npm install` copies them to `.agents/skills/` for other agents. Do not edit `.agents/skills/` directly.
- Agent definitions are in `.claude/agents/`.
- `npm run check` lints the skills and makes sure that the two copies are the same.
- Keep the instructions in [AGENTS.md](AGENTS.md) and the skills consistent with each other.

### Change the documentation

- Write in plain English. Use short sentences and the active voice.
- Use the same term for the same thing in all guides. The [glossary](docs/glossary.md) lists the terms.
- Do not write counts of agents, skills, steps or scenarios. These numbers change as the project grows.

### Generated files

Do not edit these folders. Tools create them:

- `.features-gen/`
- `reports/`
- `test-results/`

## Commit messages

Use the [Conventional Commits](https://www.conventionalcommits.org) format:

```text
<type>: <short summary in the present tense>
```

Common types:

| Type | Use for |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation only |
| `test` | Tests only |
| `refactor` | A code change that does not change behaviour |
| `ci` | The CI pipeline |
| `chore` | Maintenance, for example dependency updates |

Examples:

```text
feat: add a generic step to select an option from a list
fix: keep $ characters in values that env:set writes
docs: explain how to save a login session for a new role
```

## Pull requests

1. Complete the [pull request template](.github/pull_request_template.md).
2. Keep each pull request to one topic. Small pull requests are easier to review.
3. Explain what changes and why.
4. Give evidence: the output of `npm run check` and the tests that you ran.
5. Describe any breaking change and what users must do.

A maintainer reviews each pull request. The maintainer can ask for changes. When the checks pass and the review is complete, a maintainer merges the pull request.

## Licence

pwauto uses the [Apache License 2.0](LICENSE). When you send a contribution, you agree that it is licensed under the same licence.
