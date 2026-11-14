/**
 * Steps only for the framework tests (not for application suites).
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { After, Given } from '../../src/core/fixtures';
import { uniqueId } from '../../src/core/utils/data-factory';
import { manualMarker, sessionFile } from '../../src/core/utils/users';
// @ts-expect-error -- plain .mjs script without type declarations
import { FIXTURE_USER } from './server.mjs';

/**
 * Stands in for `npm run auth:save -- --role <role> --manual`: a person signed in
 * once and the session was saved. The role has no username or password.
 */
Given('a person saved a browser session for a new role', async ({ browser, baseURL, ctx }) => {
  // A role name of its own: parallel runs and old files never share a session.
  const role = uniqueId('role');
  ctx.set('savedRole', role);
  const context = await browser.newContext({ baseURL });
  const response = await context.request.post('/login', {
    form: { email: FIXTURE_USER.username, password: FIXTURE_USER.password },
  });
  if (!response.ok()) throw new Error(`The fixture site refused the login: ${response.status()}`);
  mkdirSync('.auth', { recursive: true });
  await context.storageState({ path: sessionFile(role) });
  writeFileSync(manualMarker(role), 'saved by the fixture test\n');
  await context.close();
});

Given('I am logged in with that saved session', async ({ auth, ctx }) => {
  await auth.loginAs(ctx.get<string>('savedRole'));
});

After(async ({ ctx }) => {
  let role: string | undefined;
  try {
    role = ctx.get<string>('savedRole');
  } catch {
    return; // this scenario saved no session
  }
  rmSync(sessionFile(role), { force: true });
  rmSync(manualMarker(role), { force: true });
});
