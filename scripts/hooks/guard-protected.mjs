#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (optional, see docs/06-configuration.md):
 * asks the person before an agent edits the files that define the guardrails
 * themselves — lint rules, Playwright config, TypeScript config, agent
 * settings and hooks. Agents must not loosen these to get a green run.
 *
 * Register it in .claude/settings.json under hooks.PreToolUse with the
 * matcher "Edit|Write|MultiEdit" and the command
 * "node scripts/hooks/guard-protected.mjs".
 */
import path from 'node:path';

export const PROTECTED = [
  /^eslint\.config\.mjs$/,
  /^playwright\.config\.ts$/,
  /^tsconfig\.json$/,
  /^\.claude\/settings(\.local)?\.json$/,
  /^scripts\/hooks\//,
  /^scripts\/guard-weakening\.mjs$/,
];

export function isProtected(file, root) {
  const rel = path.relative(root, path.resolve(root, file)).replaceAll('\\', '/');
  return PROTECTED.some((re) => re.test(rel));
}

if (process.argv[1]?.endsWith('guard-protected.mjs')) {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  const file = JSON.parse(input || '{}')?.tool_input?.file_path ?? '';
  const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  if (file && isProtected(file, root)) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `${file} defines pwauto guardrails (lint, config, hooks). Confirm that you asked for this change.`,
        },
      }),
    );
  }
}
