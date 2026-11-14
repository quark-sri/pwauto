/**
 * Suite of the framework tests: the generic steps and core fixtures run against
 * the fixture site of this repository (tests/fixture-app/server.mjs).
 *
 * It runs only with FRAMEWORK_SMOKE=true (`npm run test:framework`), never with
 * `npm test`. playwright.config.ts starts the fixture site for it.
 */
import { defineSuite } from '../../src/core/config/suite.ts';

// The port is the default of server.mjs (FIXTURE_PORT). playwright.config.ts reads this URL.
export const FIXTURE_URL = 'http://127.0.0.1:4173';

export default defineSuite({
  name: 'fixture',
  features: 'tests/fixture-app/features/**/*.feature',
  steps: ['tests/fixture-app/steps.ts'],
  use: {
    baseURL: FIXTURE_URL,
    testIdAttribute: 'data-testid',
    login: {
      path: '/login',
      usernameField: 'Email',
      passwordField: 'Password',
      submitButton: 'Sign in',
      success: '/account',
    },
    // The fixture site has one user. It exists only on localhost; this is not a secret.
    defaultUsers: {
      customer: { username: 'tester@example.com', password: 'fixture-pass' },
    },
  },
});
