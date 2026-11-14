/**
 * Steps only for the framework tests (not for application suites).
 */
import { mkdirSync } from 'node:fs';
import { Given } from '../../src/core/fixtures';
import { sessionFile } from '../../src/core/utils/users';
// @ts-expect-error -- plain .mjs script without type declarations
import { FIXTURE_USER } from './server.mjs';

/**
 * Stands in for `npm run auth:save -- --role <role> --manual`: a person signed in
 * once and the session was saved. The role has no username or password.
 */
Given('a person saved a browser session for the {string} role', async ({ browser, baseURL }, role: string) => {
  const context = await browser.newContext({ baseURL });
  const response = await context.request.post('/login', {
    form: { email: FIXTURE_USER.username, password: FIXTURE_USER.password },
  });
  if (!response.ok()) throw new Error(`The fixture site refused the login: ${response.status()}`);
  mkdirSync('.auth', { recursive: true });
  await context.storageState({ path: sessionFile(role) });
  await context.close();
});
