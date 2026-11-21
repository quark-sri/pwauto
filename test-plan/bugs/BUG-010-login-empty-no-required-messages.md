# BUG-010: Login with empty fields gives "Your login details are incorrect" instead of saying what is missing

| | |
|---|---|
| Status | **Draft — not raised yet.** To raise with the site owner. |
| Found by | pwauto explore stage (interactive session) |
| Date | 2026-11-21 |
| Environment | https://jupiter.cloud.planittesting.com/ (Jupiter Toys, public practice site run by Planit) |
| Severity (suggested) | Low (usability) |
| Knowledge | `knowledge/account/rules/login-validation.md` |
| Test | features/app/account/login.feature — "Empty login details are refused with the same message" |

## Steps

1. Click "Login" in the menu.
2. Leave Username and Password empty and click "Login".

## Expected (suggested)

Messages that say Username and Password are required, as the contact and checkout forms do.

## Actual

"Your login details are incorrect", the same as for a wrong password.

## Note

The site belongs to someone else. For this exercise the current behaviour is the expected behaviour (tester decision, 2026-11-22), so the test asserts what the site does today and passes. If the owner fixes this, update the knowledge page and the test.
