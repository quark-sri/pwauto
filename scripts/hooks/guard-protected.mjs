#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook (enabled in .claude/settings.json):
 * asks the person before an agent edits the files that define the guardrails
 * themselves — lint rules, Playwright config, TypeScript config, agent
 * settings and hooks. Agents must not loosen these to get a green run.
 *
 * Registered in .claude/settings.json under hooks.PreToolUse with the
 * matcher "Edit|Write|MultiEdit". Agents without hooks follow the same rule
 * from AGENTS.md ("Without hooks").
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
