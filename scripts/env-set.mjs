#!/usr/bin/env node
/**
 * Set values in .env without printing the file (agents use this, so they
 * never need to read secrets).
 *
 *   npm run env:set -- BASE_URL=https://myapp.example.com TEST_ID_ATTRIBUTE=data-qa
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

if (!existsSync('.env')) copyFileSync('.env.example', '.env');
let text = readFileSync('.env', 'utf8');
for (const pair of process.argv.slice(2)) {
  const i = pair.indexOf('=');
  if (i < 1) {
    console.error(`Expected KEY=value, got "${pair}"`);
    process.exit(1);
  }
  const key = pair.slice(0, i);
  const value = pair.slice(i + 1);
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  text = re.test(text) ? text.replace(re, line) : `${text.trimEnd()}\n${line}\n`;
  const secret = /PASSWORD|SECRET|TOKEN|KEY/i.test(key);
  console.log(`set ${key}${secret ? ' (hidden)' : `=${value}`}`);
}
writeFileSync('.env', text);
