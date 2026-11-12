#!/usr/bin/env node
/**
 * Run the reference example (examples/toolshop) on demand, whatever .env says.
 *   npm run test:example [-- extra playwright args, e.g. --headed or --grep @cart]
 * Note: the example tests a public practice site; if that site is slow or
 * down, its tests fail with timeouts — that is not a framework problem.
 */
import { execSync } from 'node:child_process';

const env = { ...process.env, INCLUDE_EXAMPLES: 'true' };
const extra = process.argv
  .slice(2)
  .map((a) => JSON.stringify(a))
  .join(' ');
try {
  execSync('npx bddgen', { stdio: 'inherit', env });
  execSync(`npx playwright test --project="toolshop-*" ${extra}`, { stdio: 'inherit', env });
} catch {
  process.exit(1);
}
