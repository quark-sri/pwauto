# Test plan — <application>

Written by the `pwauto-scenarios` stage; one page. Keep it current.

## Scope
- In scope: <areas / journeys>
- Out of scope: <and why>

## Risks and priorities
| Area / journey | Impact | Likelihood | Priority | Notes |
|---|---|---|---|---|

## Approach
- UI end-to-end scenarios (BDD) for user journeys and user-visible rules.
- Recommended below the UI (not automated here): <calculations, API contracts>

## Environments and data
- Environment(s): <qa, staging> — may tests create data? <yes/no>
- Test users: roles in `.env` (`<ROLE>_USERNAME` / `<ROLE>_PASSWORD`); data created per scenario through <API / UI>

## Entry and exit criteria
- Entry: knowledge base reviewed for the area; scenarios approved (no `@draft`).
- Exit: all `@smoke` pass; `@regression` pass rate ≥ <95>%; every failure classified; no open blocker bug.
