# BUG-009: Every page load logs a 403 error in the browser console

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Low (hidden from users; may hide a missing resource) |
| Knowledge | `knowledge/questions.md ("Console error on load")` |
| Test | none (observation) |

## Steps

1. Open any page with the browser developer tools open (Console tab).

## Expected (suggested)

No errors in the console.

## Actual

"Failed to load resource: the server responded with a status of 403 ()" on every load; form interactions log more errors (stack in angular-ui.min.js).

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
