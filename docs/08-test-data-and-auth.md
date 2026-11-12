# 8. Test data and login

## 8.1 Principles

1. **Each scenario owns its data.** It creates what it needs and never depends on another scenario.
2. **Set up through the API, check through the UI.** UI setup is slow and fails for reasons unrelated to the scenario.
3. **Unique and valid.** Generated values are unique per run and worker; combinations follow the business rules (from `knowledge/`).
4. **Reproducible.** Each test logs its data seed; `DATA_SEED=<seed>` repeats the same data.
5. **No real personal data, no production data.**

## 8.2 Data factory

`src/core/utils/data-factory.ts`:

```ts
import { buildPerson, buildAddress, uniqueId } from '@core/utils/data-factory';

const person = buildPerson();                             // firstName, lastName, unique email, strong password, phone, dateOfBirth
const vip = buildPerson({ lastName: 'Vip' });             // override what matters
const address = buildAddress({ country: 'Austria', city: 'Vienna', postalCode: '1010' });
const orderRef = uniqueId('ord');                          // e.g. ord3m1x9k2ab
```

Add builders for your domain objects next to these (or in `src/app/data/`). Builders return plain data; they never call the UI or an API.

## 8.3 API clients for setup

```ts
// src/app/api/ShopApi.ts
export class ShopApi {
  constructor(private readonly request: APIRequestContext, private readonly baseUrl = process.env.API_URL!) {}

  async registerCustomer(overrides: Partial<Person> = {}): Promise<Person> {
    const person = buildPerson(overrides);
    const res = await this.request.post(`${this.baseUrl}/users/register`, { data: { /* map fields */ } });
    expect(res.status(), await res.text()).toBe(201);
    return person;
  }
}

// src/app/fixtures.ts
export const test = core.extend<{ pages: AppPages; api: ShopApi }>({
  pages: definePages(registry),
  api: async ({ request }, use) => use(new ShopApi(request)),
});
```

Then a step: `Given I am a newly registered customer` → `api.registerCustomer()` + `auth.loginWith(...)`. The Toolshop example (`examples/toolshop/api/ToolshopApi.ts`) does exactly this so that parallel checkouts never share a cart.

## 8.4 Login

### Simple login form (no code)

Describe the form in `.env` (`LOGIN_PATH`, `LOGIN_USERNAME_FIELD`, `LOGIN_PASSWORD_FIELD`, `LOGIN_SUBMIT_BUTTON`, `LOGIN_SUCCESS`) and add users per role. Then:

```gherkin
Given I am logged in as a "customer"
```

The first login per user and worker goes through the form; the session (cookies + local storage) is cached and reused for the next scenarios of that worker, so login is fast and still isolated between workers.

### A user the test created

```ts
await auth.loginWith({ role: 'new customer', username: person.email, password: person.password });
```

### SSO, MFA, magic links, tokens

Replace the form login with your own fixture in `src/app/fixtures.ts` (ask the framework architect agent):

| Situation | Approach |
|---|---|
| App accepts an API token | call the token endpoint with `request`, then `context.addCookies` / `addInitScript` to set it |
| SSO (Azure AD, Okta, Google) | a Playwright `setup` project that logs in once through the identity provider and saves `storageState` per role; test projects depend on it |
| TOTP MFA | secret in `.env` (`<ROLE>_TOTP_SECRET`); generate the code with a TOTP library in the login fixture |
| Email links / codes | a test mailbox API (Mailpit, MailHog, Mailosaur) read by an API client |
| CAPTCHA | ask for a test bypass key or a test environment without CAPTCHA — never automate solving it |

## 8.5 Secrets

- Only in `.env` (git-ignored) or CI secrets. `.env.example` holds names and safe defaults only.
- Agents never read `.env` (denied in `.claude/settings.json`); they set values with `npm run env:set`.
- Agents that explore pages behind login use `npm run auth:save -- --role <role>`: the script reads the credentials and saves only the session (`.auth/<role>.json`), which the agent loads into the Playwright CLI. The model never sees the password.
- The logger masks keys containing `password`, `secret`, `token`, `authorization`, `cookie`, `api key`.
