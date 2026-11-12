#!/usr/bin/env node
/**
 * Keep the agent skills identical for every AI coding agent.
 *
 * Source of truth: .claude/skills/<name>/  (Claude Code reads it here)
 * Copy:            .agents/skills/<name>/  (OpenAI Codex and other Agent Skills hosts)
 *
 * Copies (not symlinks) so it works on Windows without special git settings.
 *   node scripts/sync-agent-skills.mjs          copy
 *   node scripts/sync-agent-skills.mjs --check  fail if the copies differ (CI)
 */
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import path from 'node:path';

const src = '.claude/skills';
const dst = '.agents/skills';
const check = process.argv.includes('--check');

if (!existsSync(src)) process.exit(0);

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

if (check) {
  const a = files(src)
    .map((f) => path.relative(src, f))
    .sort();
  const b = files(dst)
    .map((f) => path.relative(dst, f))
    .sort();
  const differ =
    a.join('\n') !== b.join('\n') ||
    a.some((f) => readFileSync(path.join(src, f), 'utf8') !== readFileSync(path.join(dst, f), 'utf8'));
  if (differ) {
    console.error('.agents/skills is out of date. Run: node scripts/sync-agent-skills.mjs');
    process.exit(1);
  }
  console.log('Agent skills in sync.');
} else {
  rmSync(dst, { recursive: true, force: true });
  cpSync(src, dst, { recursive: true });
}
