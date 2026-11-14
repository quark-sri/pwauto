#!/usr/bin/env node
/**
 * Run the framework's own browser tests against the fixture site of this
 * repository (tests/fixture-app). No internet and no application needed.
 *   npm run test:framework [-- extra playwright args, e.g. --headed]
 */
import { execSync } from 'node:child_process';

const env = { ...process.env, FRAMEWORK_SMOKE: 'true' };
const extra = process.argv
  .slice(2)
  .map((a) => JSON.stringify(a))
  .join(' ');
try {
  execSync('npx bddgen', { stdio: 'inherit', env });
  execSync(`npx playwright test --project="fixture-*" ${extra}`, { stdio: 'inherit', env });
} catch {
  process.exit(1);
}
