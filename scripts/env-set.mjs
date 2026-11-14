#!/usr/bin/env node
/**
 * Set values in .env without printing the file (agents use this, so they
 * never need to read secrets).
 *
 *   npm run env:set -- BASE_URL=https://myapp.example.com TEST_ID_ATTRIBUTE=data-qa
 *
 * Guard: settings that can hide failures (retries and timeouts) are changed
 * only with --confirm, after a person agreed:
 *   npm run env:set -- RETRIES=1 --confirm
 */
import { copyFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';

const GUARDED = /^(RETRIES|TEST_TIMEOUT|EXPECT_TIMEOUT|ACTION_TIMEOUT|NAVIGATION_TIMEOUT)$/;
const SECRET = /PASSWORD|SECRET|TOKEN|KEY/i;

/** Return the new .env text with KEY=value set. Throws on an invalid key or value. */
export function setValue(text, key, value) {
  if (!/^[A-Z][A-Z0-9_]*$/.test(key)) throw new Error(`Invalid key "${key}": use UPPER_CASE letters, digits and _.`);
  if (/[\r\n]/.test(value)) throw new Error(`The value of ${key} must be on one line.`);
  // Quote values with spaces or # so dotenv reads them back unchanged.
  let safe = value;
  if (/[\s#"']/.test(value) && !/^(".*"|'.*')$/.test(value)) {
    if (!value.includes('"')) safe = `"${value}"`;
    else if (!value.includes("'")) safe = `'${value}'`;
    else throw new Error(`The value of ${key} contains both kinds of quotes; edit .env by hand.`);
  }
  const line = `${key}=${safe}`;
  const re = new RegExp(`^${key}=.*$`, 'm');
  // A replacer function: "$&" or "$1" inside a password stay literal.
  return re.test(text) ? text.replace(re, () => line) : `${text.trimEnd()}\n${line}\n`;
}

function main() {
  const args = process.argv.slice(2);
  const confirmed = args.includes('--confirm');
  const pairs = args.filter((a) => a !== '--confirm');
  if (!existsSync('.env')) copyFileSync('.env.example', '.env');
  let text = readFileSync('.env', 'utf8');
  for (const pair of pairs) {
    const i = pair.indexOf('=');
    if (i < 1) {
      console.error(`Expected KEY=value, got "${pair}"`);
      process.exit(1);
    }
    const key = pair.slice(0, i);
    const value = pair.slice(i + 1);
    if (GUARDED.test(key) && !confirmed) {
      console.error(`${key} can hide failing or slow tests. Change it only after a person agreed, then add --confirm.`);
      process.exit(1);
    }
    try {
      text = setValue(text, key, value);
    } catch (e) {
      console.error(e.message);
      process.exit(1);
    }
    console.log(`set ${key}${SECRET.test(key) ? ' (hidden)' : `=${value}`}`);
  }
  writeFileSync('.env', text);
}

if (process.argv[1]?.endsWith('env-set.mjs')) main();
