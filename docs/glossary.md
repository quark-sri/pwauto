# Glossary

| Term | Meaning |
|---|---|
| **Agent** | An AI assistant with one job and limited tools (e.g. `pwauto-app-explorer`). In Claude Code: `.claude/agents/`. |
| **Skill** | A folder with `SKILL.md`: the step-by-step method for one task. Works in Claude Code (`/name`) and other agents (`.agents/skills/`). |
| **BDD** | Behaviour-Driven Development: describing behaviour with examples in business language before automating it. |
| **Gherkin** | The `Feature / Scenario / Given / When / Then` format of `.feature` files. |
| **Step definition** | Code that runs one Gherkin sentence. |
| **bddgen** | The playwright-bdd command that turns features + steps into Playwright tests (`.features-gen/`). |
| **Page object** | A class that holds the locators and user actions of one page. |
| **Component** | A page object for a part that repeats on many pages (header, dialog). |
| **Fixture** | Something Playwright prepares for a test and passes by name (`page`, `pages`, `log`, `auth`). |
| **Locator** | How a test finds an element (`getByRole('button', { name: 'Save' })`). |
| **Web-first assertion** | `expect(locator).toHaveText(...)`: retries until true or timeout. |
| **Suite** | A set of features + steps + settings (e.g. `app`, `toolshop`), run per browser as a project. |
| **Knowledge base** | `knowledge/`: sourced facts about the application (domainlore format). The test oracle. |
| **Oracle** | The source of the expected result. |
| **basis: intended / actual** | What the product should do (documents) vs what it does (seen in the app). |
| **Gap** | Intended and actual disagree: a likely bug. |
| **Spec Conflict** | Two documents disagree: a question for the product owner. |
| **Review panel** | qestack's independent reviewer personas whose findings are merged into one list. |
| **Smoke / regression** | A few critical checks / the full set. |
| **Flaky test** | Passes and fails without a change; must be fixed, not retried away. |
| **Trace** | A recording of a test run: actions, DOM snapshots, network, console. |
| **Storage state** | Saved cookies and local storage: a logged-in session. |
| **Playwright CLI** | `npx playwright cli`: browser commands for AI agents (open, snapshot, click, generate-locator). |
| **Shard** | One slice of the suite run on a separate CI machine. |
