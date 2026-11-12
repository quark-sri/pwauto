---
name: pwauto-explore
description: "Explores a web application with the Playwright CLI browser and the site crawler, learns its purpose, users, screens, journeys and rules, and records them as a sourced domainlore knowledge base in knowledge/. Use when the user says 'explore', 'learn the app', 'crawl', 'build the domain knowledge', or before writing scenarios for a new app or area. Not for writing scenarios (use pwauto-scenarios)."
license: Apache-2.0
metadata:
  version: "0.1.0"
---

# pwauto-explore

## Objective

Tests are only as good as their expected results. Before anyone writes a scenario, build a knowledge base that says what the application is for, who uses it, which screens and journeys exist, and which rules apply — each fact with a source and a trust level. This is the oracle for every later stage.

## Inputs

- `BASE_URL` (and test users in `.env`, referenced by name only).
- Scope from the user: whole app, or some areas; what must not be changed (production data, payments, emails to real people).
- Optional documents: requirements, user stories, help pages. Facts from them are `basis: intended`; facts seen in the app are `basis: actual`.

## Workflow

1. **Map the site (cheap, no clicks).** Run `npm run explore -- --url <BASE_URL> --max-pages 40 --depth 3`. Add `--storage-state` for pages behind login, `--include /path` to focus, `--exclude /logout`. Read `.explore/<host>/summary.md` first, then only the page files you need. The crawler follows links only; it never submits forms.
2. **Understand the purpose.** From the home page, titles, headings and navigation, write 3–5 sentences: what the product does, for whom, and the main business objects. Confirm with the user if unsure.
3. **Explore interactively (Playwright CLI).** Follow the `playwright-cli` skill: `npx playwright cli open <url>`, `snapshot` (accessibility tree with element refs), `click <ref>`, `fill <ref> "<text>"`, `select <ref> "<option>"`, `goto <url>`, `network` / `console`, `close`. Prefer `snapshot` over `screenshot` (fewer tokens). For pages behind login, run `npm run auth:save -- --role <role>` (it logs in with the credentials in `.env`, which you never read) and then `npx playwright cli state-load .auth/<role>.json`. For each area:
   - walk the main journey end to end (happy path);
   - try the obvious negative paths: empty required fields, invalid formats, wrong credentials (use an unknown user, never lock a real account), out-of-range values;
   - note validation messages word for word, enabled/disabled states, redirects, toasts, and API errors (status + body) that explain rules;
   - note how elements are identified: roles and names, labels, and the test-ID attribute in use.
   Never read `.env` and never type a real password into the CLI; use saved sessions. To test a wrong-password case, type an obviously fake password for an unknown user.
   Ask before any action that creates real-world effects (orders, payments, emails, deletions) unless the user said the environment is a test one.
4. **Record the knowledge** in domainlore format (one page per concept; see `knowledge/` and the `lore-use` skill of the domainlore plugin, or `examples/toolshop/knowledge/` for a complete example):
   - `lore.toml`: one `[areas.<area>]` per business area, with a one-line description.
   - Per area: `actors/`, `screens/`, `journeys/`, `entities/`, `rules/`, `terms/`.
   - Every page: `type`, `title`, `description`, `basis`, and `sources` with `id`, `resource` (URL or document), `title`; cite facts in the body with `[^id]` footnotes.
   - Screen pages: route, purpose, main controls with their visible names, the test IDs present, and `navigates_to` / `shows` / `step_of` relations.
   - Rule pages: each rule as a short bullet with the exact message text.
   - Journey pages: `steps` with `screen`, `actor` and branches (`goto ... when`).
   - Intended (documents) vs actual (app) disagree → a `type: Gap` page in `knowledge/conflicts/`. Two documents disagree → `type: Spec Conflict`. Something nobody can settle → `knowledge/questions.md`.
   - Never add `verified:`; only a person does that.
5. **Validate.** Run `uvx --from git+https://github.com/quark-sri/domainlore lore build` then `... lore check` (or `lore build` / `lore check` when installed). Fix every error. If `uv` is missing, check the frontmatter by hand against an example page and say that validation did not run.
6. **Summarise for the user** in plain words: purpose, areas, number of screens/journeys/rules, risky areas (money, auth, data loss, legal), open questions and gaps. Append one line to `knowledge/log.md`.

## Rules

- A fact without a source does not go in. "I think" is a question, not a fact.
- Copy messages and labels exactly (they become assertions later).
- Keep pages short; link instead of repeating (DRY).
- Do not explore outside `BASE_URL`'s origin (third-party sites, payment providers) except to note that a link exists.
- Delete nothing in `knowledge/` that a person verified.

## Done when

- `knowledge/index.md` lists every area in scope; each area has its screens, at least one journey and its rules.
- `lore check` reports 0 errors (or the summary says it could not run).
- Every Gap, Spec Conflict and open question is recorded, and the user has the summary.
