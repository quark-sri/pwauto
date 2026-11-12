#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook: after an agent edits a feature file or a
 * TypeScript file, check it at once, so mistakes are fixed while the context
 * is fresh.
 *   - .feature or step/fixture files -> `bddgen` (Gherkin syntax, missing or
 *     ambiguous steps)
 *   - .ts files                       -> ESLint on that file (the coding
 *     standards: no sleeps, no skips, no XPath, awaited promises, ...)
 * Exit code 2 sends the problems back to the agent.
 */
import { execSync } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const file = JSON.parse(input || '{}')?.tool_input?.file_path ?? '';
const rel = file.replace(process.cwd() + '/', '').replaceAll('\\', '/');
if (!/^(features|src|examples)\//.test(rel) || rel.startsWith('.features-gen')) process.exit(0);

const problems = [];
const run = (cmd) => {
  try {
    execSync(cmd, { stdio: 'pipe', timeout: 90_000 });
  } catch (e) {
    problems.push(`$ ${cmd}\n${(e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '')}`.trim().slice(0, 4000));
  }
};

if (rel.endsWith('.feature') || /\/(steps|fixtures)/.test(rel) || rel.endsWith('fixtures.ts')) run('npx bddgen');
if (rel.endsWith('.ts')) run(`npx eslint --no-warn-ignored "${rel}"`);

if (problems.length) {
  console.error(`pwauto check failed for ${rel}. Fix these before you continue:\n\n${problems.join('\n\n')}`);
  process.exit(2);
}
