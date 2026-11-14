# Agent evaluations

`skills.jsonl` holds two kinds of cases for the pwauto skills and agents:

| Kind | Fields | Passes when |
|---|---|---|
| `trigger` | `prompt`, `expect_skill`, optional `not_skill` | the agent loads `expect_skill` (and not `not_skill`) for the prompt |
| `behaviour` | `prompt`, `must`, `must_not` | the agent does what `must` says and nothing in `must_not` |

`npm run check` validates the file (every pwauto skill has at least 3 positive and 1 negative trigger case). Running the cases needs a model:

```bash
# one case, Claude Code (in a throw-away clone, not in your working copy)
claude -p "<prompt>" --output-format json > out.json   # inspect which skill/tool calls were made
```

Record each release's results in `evals/results.md`: date, agent and model, cases passed / total, the failing cases and what was changed. Status: **not yet run** — the first recorded run is a release task (see [docs/13-release-checklist.md](../docs/13-release-checklist.md)).
