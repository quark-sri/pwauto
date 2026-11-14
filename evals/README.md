# Agent evaluations

`skills.jsonl` holds two kinds of cases for the pwauto skills and agents:

| Kind | Fields | Passes when |
|---|---|---|
| `trigger` | `prompt`, `expect_skill`, optional `not_skill` | the agent loads `expect_skill` (and not `not_skill`) for the prompt |
| `behaviour` | `prompt`, `must`, `must_not` | the agent does what `must` says and nothing in `must_not` |

`npm run check` validates the file (every pwauto skill has at least 3 positive and 1 negative trigger case).

## Run the cases

```bash
npm run evals                     # all cases with Claude Code, model sonnet
npm run evals -- --limit 5        # a quick sample
npm run evals -- --ids 8,18       # only these cases (line numbers of skills.jsonl)
npm run evals -- --record         # also add the result to results.md
```

The runner (`scripts/run-evals.mjs`) needs the `claude` CLI and costs model usage (about USD 4 for all cases). Each case runs in a throw-away git worktree of the current commit, with no tools that change files or reach the network: the agent can only read the project, load skills and answer.

- **trigger** passes when the agent loads `expect_skill` and never `not_skill` within 2 turns. A typed command (`/pwauto ...`) passes when the session offers that command.
- **behaviour** gets 10 turns; a second Claude call (model sonnet) judges the answer against `must` and `must_not`.

Raw transcripts: `reports/evals/<time>/` (not committed). Results per run: [`results.md`](results.md). Run the cases before each release and after a change to a skill description or to `AGENTS.md`.

Limits: results come from one machine, so skills installed for the user (outside this project) are also visible to the agent; a model can answer differently on another run. Codex is not covered by the runner yet.
