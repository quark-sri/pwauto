/**
 * Log in as a role and save the browser session, so AI agents can explore
 * pages behind login with the Playwright CLI without ever seeing a password.
 *
 *   npm run auth:save -- --role customer                  your app (BASE_URL, LOGIN_* and CUSTOMER_* from .env)
 *   npm run auth:save -- --role customer --suite toolshop  the bundled example
 *   npm run auth:save -- --role manager --manual           single sign-on or MFA: a browser opens, YOU sign in,
 *                                                          then press Enter in the terminal. No password in .env.
 *
 * Tests use the saved session too: "Given I am logged in as a manager" loads
 * .auth/manager.json when the role has no username and password.
 *
 * Then, in the agent's shell:
 *   npx playwright cli open <BASE_URL>
 *   npx playwright cli state-load .auth/customer.json
 *   npx playwright cli goto <BASE_URL>/account
 *
 * The script reads the credentials itself and prints only the file path.
 * .auth/ is git-ignored.
 */
import { chromium } from '@playwright/test';
import { existsSync, mkdirSync } from 'node:fs';
import { env } from '../src/core/config/env.ts';
import type { Suite } from '../src/core/config/suite.ts';
import type { LoginSettings } from '../src/core/fixtures.ts';
import { field, waitForSuccess } from '../src/core/ui.ts';
import { getUser, sessionFile } from '../src/core/utils/users.ts';

const argv = process.argv.slice(2);
const arg = (name: string): string | undefined => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

const role = arg('role') ?? 'customer';
const suite = arg('suite') ?? 'app';

let baseURL = env.BASE_URL;
let testIdAttribute = env.TEST_ID_ATTRIBUTE;
let login: LoginSettings = {
  path: env.LOGIN_PATH,
  usernameField: env.LOGIN_USERNAME_FIELD,
  passwordField: env.LOGIN_PASSWORD_FIELD,
  submitButton: env.LOGIN_SUBMIT_BUTTON,
  success: env.LOGIN_SUCCESS,
};
let defaults: Record<string, { username: string; password: string }> = {};

if (suite !== 'app') {
  // An example suite: examples/<name>/suite.ts (a variable path keeps type checking
  // working after `npm run example:remove`).
  const examplePath = `../examples/${suite}/suite.ts`;
  if (!/^[a-z][a-z0-9]*$/.test(suite) || !existsSync(new URL(examplePath, import.meta.url))) {
    console.error(`Unknown suite "${suite}". Use "app" (your application) or the name of a folder in examples/.`);
    process.exit(1);
  }
  const { use } = ((await import(examplePath)) as { default: Suite }).default;
  baseURL = use?.baseURL ?? baseURL;
  testIdAttribute = use?.testIdAttribute ?? testIdAttribute;
  login = use?.login ?? login;
  defaults = use?.defaultUsers ?? {};
}

if (!baseURL) {
  console.error('BASE_URL is not set. Run: npm run env:set -- BASE_URL=https://your-app.example.com');
  process.exit(1);
}

const manual = argv.includes('--manual');
let user: ReturnType<typeof getUser> | undefined;
try {
  user = manual ? undefined : getUser(role, defaults);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
const browser = await chromium.launch({ headless: !manual });
const context = await browser.newContext({ baseURL });
const { selectors } = await import('@playwright/test');
selectors.setTestIdAttribute(testIdAttribute);
const page = await context.newPage();

try {
  await page.goto(login.path);
  if (user) {
    await field(page, login.usernameField).fill(user.username);
    await field(page, login.passwordField).fill(user.password);
    await page.getByRole('button', { name: login.submitButton, exact: true }).click();
    await waitForSuccess(page, login);
  } else {
    // The person signs in (identity provider, MFA code, ...). The script never sees a password.
    console.log(`A browser window is open. Sign in as the ${role} user there.`);
    console.log('When you see the application as a signed-in user, come back here and press Enter.');
    await new Promise<void>((resolve) => process.stdin.once('data', () => resolve()));
    process.stdin.pause();
  }
  mkdirSync('.auth', { recursive: true });
  const file = sessionFile(role);
  await context.storageState({ path: file });
  console.log(`Saved the ${role} session to ${file} (${new URL(page.url()).origin}).`);
} catch (e) {
  console.error(`Login as ${role} failed: ${(e as Error).message.split('\n')[0]}`);
  console.error('Check LOGIN_* settings and the role credentials in .env. For single sign-on or MFA use --manual.');
  process.exitCode = 1;
} finally {
  await browser.close();
}
