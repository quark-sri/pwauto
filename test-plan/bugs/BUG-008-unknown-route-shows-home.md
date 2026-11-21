# BUG-008: An unknown address shows the home page instead of a "not found" page

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Low |
| Knowledge | `knowledge/catalog/screens/home.md` |
| Test | features/app/catalog/home.feature — "An unknown address shows the home page" |

## Steps

1. Open https://jupiter.cloud.planittesting.com/#/nonexistent.

## Expected (suggested)

A "page not found" message, so a wrong link is visible as wrong.

## Actual

The home page shows, with no message.

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
