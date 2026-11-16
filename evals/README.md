# Agent evaluations

`skills.jsonl` holds two kinds of cases for the pwauto skills and agents:

| Kind | Fields | Passes when |
|---|---|---|
| `trigger` | `prompt`, `expect_skill`, optional `not_skill` | the agent loads `expect_skill` (and not `not_skill`) for the prompt |
| `behaviour` | `prompt`, `must`, `must_not` | the agent does what `must` says and nothing in `must_not` |

`npm run check` validates the file (every pwauto skill has at least 3 positive and 1 negative trigger case).

## Run the cases

```bash
npm run evals                       # all cases once, Claude Code, model sonnet
npm run evals -- --repeat 3         # each case 3 times: use this before a release
npm run evals -- --ids trig-heal-1  # only these cases (the "id" field)
npm run evals -- --repeat 3 --record   # full run, added to results.md
```

The runner (`scripts/run-evals.mjs`) needs the `claude` CLI and costs model usage (about USD 4 per repeat of all cases).

- **What it tests:** the committed project (`HEAD`), not your uncommitted changes, in a throw-away git worktree. The agent may only use Read, Glob, Grep and Skill: no shell, no edits, no network, no MCP servers, no user-level settings or plugins.
- **trigger** passes when the agent loads `expect_skill` (and never `not_skill`) within 2 turns. The 2-turn limit is a runner choice: it checks that the agent picks the skill first. A typed command (`/pwauto ...`) only checks that the session offers that command.
- **behaviour** gets 10 turns; a second Claude call (sonnet) judges the answer against `must` and `must_not`. An unreadable verdict is ERROR (retried once), not FAIL.
- **errors:** a run that the API stops (usage limit, overload) or that times out is ERROR, not FAIL. A usage limit stops the whole run; `--record` refuses a run with agent errors.
- **needs:** cases that need what the sandbox blocks (sub-agents, file writes) are SKIPPED and checked in the manual agent session of the release checklist.
- **split: holdout:** paraphrases that are never used to tune skills or `AGENTS.md`. Their pass rate is reported apart: it is the honest measure of routing on new wording. The other cases prove "no regression on known prompts".
- **repeats:** a case is PASS when all repeats pass, FLAKY when some pass, FAIL when none pass. Only FAIL makes the command exit with 1.

Raw transcripts: `reports/evals/<time>/` (not committed). Results per run: [`results.md`](results.md). Run the cases before each release and after a change to a skill description or to `AGENTS.md`. `--record` accepts full runs only. Codex is not covered by the runner yet.
