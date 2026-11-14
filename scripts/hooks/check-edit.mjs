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
 *
 * Works on Windows, macOS and Linux. Agents without hooks (Codex and others)
 * run `npm run check` instead.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

/** Path of `file` relative to the project, with forward slashes; null when outside it. */
export function projectRelative(file, root, p = path) {
  if (!file) return null;
  const rel = p.relative(root, p.resolve(root, file)).replaceAll('\\', '/');
  return rel.startsWith('..') || p.isAbsolute(rel) ? null : rel;
}

/** Which checks an edited file needs. */
export function checksFor(rel) {
  if (!rel || !/^(features|src|examples)\//.test(rel)) return [];
  const checks = [];
  if (rel.endsWith('.feature') || /\/(steps|fixtures)/.test(rel) || rel.endsWith('fixtures.ts')) checks.push('bddgen');
  if (rel.endsWith('.ts')) checks.push('eslint');
  return checks;
}

async function main() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const file = JSON.parse(input || '{}')?.tool_input?.file_path ?? '';
  const rel = projectRelative(file, root);
  if (file && rel === null) {
    console.error(`pwauto hook: ${file} is outside the project; not checked.`);
    process.exit(0);
  }

  const problems = [];
  const run = (cmd, args) => {
    try {
      execFileSync(cmd, args, { cwd: root, stdio: 'pipe', timeout: 90_000, shell: process.platform === 'win32' });
    } catch (e) {
      const out = (e.stdout?.toString() ?? '') + (e.stderr?.toString() ?? '');
      problems.push(`$ ${cmd} ${args.join(' ')}\n${out}`.trim().slice(0, 4000));
    }
  };

  for (const check of checksFor(rel)) {
    if (check === 'bddgen') run('npx', ['bddgen']);
    if (check === 'eslint') run('npx', ['eslint', '--no-warn-ignored', rel]);
  }

  if (problems.length) {
    console.error(`pwauto check failed for ${rel}. Fix these before you continue:\n\n${problems.join('\n\n')}`);
    process.exit(2);
  }
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('check-edit.mjs')) {
  await main();
}
