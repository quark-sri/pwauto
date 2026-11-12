/**
 * Log in as a role and save the browser session, so AI agents can explore
 * pages behind login with the Playwright CLI without ever seeing a password.
 *
 *   npm run auth:save -- --role customer                 your app (BASE_URL, LOGIN_* and CUSTOMER_* from .env)
 *   npm run auth:save -- --role customer --suite toolshop the bundled example
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
import { mkdirSync } from 'node:fs';
import { env } from '../src/core/config/env.ts';
import type { LoginSettings } from '../src/core/fixtures.ts';
import { field, waitForSuccess } from '../src/core/ui.ts';
import { getUser, roleKey } from '../src/core/utils/users.ts';

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
let defaults = {};

if (suite === 'toolshop') {
  // A variable path keeps type checking working after `npm run example:remove`.
  const examplePath = '../examples/toolshop/suite.ts';
  const { toolshopSuite } = (await import(examplePath)) as {
    toolshopSuite: {
      use: {
        baseURL: string;
        testIdAttribute: string;
        login: LoginSettings;
        defaultUsers: Record<string, { username: string; password: string }>;
      };
    };
  };
  baseURL = toolshopSuite.use.baseURL;
  testIdAttribute = toolshopSuite.use.testIdAttribute;
  login = toolshopSuite.use.login;
  defaults = toolshopSuite.use.defaultUsers;
}

if (!baseURL) {
  console.error('BASE_URL is not set. Run: npm run env:set -- BASE_URL=https://your-app.example.com');
  process.exit(1);
}

const user = getUser(role, defaults);
const browser = await chromium.launch();
const context = await browser.newContext({ baseURL });
const { selectors } = await import('@playwright/test');
selectors.setTestIdAttribute(testIdAttribute);
const page = await context.newPage();

try {
  await page.goto(login.path);
  await field(page, login.usernameField).fill(user.username);
  await field(page, login.passwordField).fill(user.password);
  await page.getByRole('button', { name: login.submitButton, exact: true }).click();
  await waitForSuccess(page, login);
  mkdirSync('.auth', { recursive: true });
  const file = `.auth/${roleKey(role).toLowerCase()}.json`;
  await context.storageState({ path: file });
  console.log(`Saved the ${role} session to ${file} (${new URL(page.url()).origin}).`);
} catch (e) {
  console.error(`Login as ${role} failed: ${(e as Error).message.split('\n')[0]}`);
  console.error('Check LOGIN_* settings and the role credentials in .env.');
  process.exitCode = 1;
} finally {
  await browser.close();
}
