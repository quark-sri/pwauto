#!/usr/bin/env node
/**
 * Guard against weakening tests to get a green run (AGENTS.md hard rule 3).
 * Runs in `npm run check`, so it works for every AI agent and in CI, with or
 * without hooks.
 *
 * Compares the working tree with a base (GUARD_BASE, default HEAD) and fails when:
 *   - more `expect(` lines were removed than added in steps, pages or features code
 *   - more `Scenario` lines were removed than added in feature files
 *   - a line adds @fixme or @skip without @gap or @known-bug (a recorded bug)
 *   - .env.example sets RETRIES above 0
 *
 * A person can approve an intended change once: ALLOW_WEAKENING=1 npm run check
 * (say why in the pull request).
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

/** Analyse a unified diff (-U0) and return a list of problems. */
export function findWeakening(diff, envExample = '') {
  const problems = [];
  let file = '';
  const removedExpect = new Map();
  const removedScenarios = new Map();
  const bump = (map, f, n) => map.set(f, (map.get(f) ?? 0) + n);

  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      file = line.slice(4).replace(/^b\//, '');
      continue;
    }
    if (line.startsWith('--- ')) continue;
    const added = line.startsWith('+');
    const removed = line.startsWith('-');
    if (!added && !removed) continue;
    const text = line.slice(1);
    if (/\bexpect(\.poll|\.soft)?\(/.test(text)) bump(removedExpect, file, removed ? 1 : -1);
    if (file.endsWith('.feature') && /^\s*Scenario( Outline)?:/.test(text))
      bump(removedScenarios, file, removed ? 1 : -1);
    if (added && /@(fixme|skip)\b/.test(text) && !/@(gap|known-bug)\b/.test(text)) {
      problems.push(`${file}: adds @fixme/@skip without @gap or @known-bug (record the bug first): ${text.trim()}`);
    }
  }
  for (const [f, n] of removedExpect) if (n > 0) problems.push(`${f}: ${n} assertion(s) removed (expect)`);
  for (const [f, n] of removedScenarios) if (n > 0) problems.push(`${f}: ${n} scenario(s) removed`);
  const retries = envExample.match(/^RETRIES=(\d+)\s*$/m);
  if (retries && Number(retries[1]) > 0)
    problems.push(`.env.example: RETRIES=${retries[1]} (retries hide failures; keep it empty)`);
  return problems;
}

function main() {
  const base = process.env.GUARD_BASE || 'HEAD';
  let diff = '';
  try {
    diff = execFileSync('git', ['diff', '-U0', base, '--', 'features', 'examples', 'src', ':(exclude).features-gen'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    console.log(`guard-weakening: skipped (no git base "${base}": ${e.message.split('\n')[0]})`);
    return;
  }
  const problems = findWeakening(diff, readFileSync('.env.example', 'utf8'));
  if (!problems.length) {
    console.log(`guard-weakening: ok (compared with ${base})`);
    return;
  }
  const msg = `Possible weakening of tests compared with ${base}:\n- ${problems.join('\n- ')}`;
  if (process.env.ALLOW_WEAKENING === '1') {
    console.warn(`${msg}\nALLOW_WEAKENING=1: accepted by a person. Explain why in the pull request.`);
    return;
  }
  console.error(
    `${msg}\n\nNever weaken a test to get green (AGENTS.md rule 3). If a person approved this change, run again with ALLOW_WEAKENING=1.`,
  );
  process.exit(1);
}

if (process.argv[1]?.endsWith('guard-weakening.mjs')) main();
