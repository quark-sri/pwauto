#!/usr/bin/env node
/**
 * Keep the agent skills identical for every AI coding agent.
 *
 * Source of truth: .claude/skills/<name>/  (Claude Code reads it here)
 * Copy:            .agents/skills/<name>/  (OpenAI Codex and other Agent Skills hosts)
 *
 * Only the skill folders that exist in .claude/skills are copied and checked.
 * Other folders in .agents/skills (for example qestack or domainlore skills that a
 * user installed with --project) are left alone. The file .agents/skills/.pwauto-skills
 * lists the folders this script owns, so a skill removed from .claude/skills is
 * also removed from .agents/skills.
 *
 * Copies (not symlinks) so it works on Windows without special git settings.
 *   node scripts/sync-agent-skills.mjs          copy
 *   node scripts/sync-agent-skills.mjs --check  fail if the copies differ (CI)
 */
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function files(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}

/** The skill folder names in the source folder. */
export function skillNames(src) {
  if (!existsSync(src)) return [];
  return readdirSync(src)
    .filter((name) => statSync(path.join(src, name)).isDirectory())
    .sort();
}

export const MANIFEST = '.pwauto-skills';

function owned(dst) {
  const p = path.join(dst, MANIFEST);
  if (!existsSync(p)) return [];
  return readFileSync(p, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#') && !l.includes('/') && !l.includes('\\') && l !== '..');
}

/**
 * Replace each source skill folder in dst with a fresh copy and remove the folders
 * that this script copied before but that are no longer in src. Other folders in dst stay.
 */
export function syncSkills(src, dst) {
  const names = skillNames(src);
  for (const name of owned(dst)) {
    if (!names.includes(name)) rmSync(path.join(dst, name), { recursive: true, force: true });
  }
  for (const name of names) {
    const to = path.join(dst, name);
    rmSync(to, { recursive: true, force: true });
    cpSync(path.join(src, name), to, { recursive: true });
  }
  mkdirSync(dst, { recursive: true });
  writeFileSync(
    path.join(dst, MANIFEST),
    `# Skill folders copied from .claude/skills by scripts/sync-agent-skills.mjs. Do not edit.\n${names.join('\n')}\n`,
  );
}

/** The skill folders whose copy in dst is missing, different or left over from a removed skill. */
export function outOfSync(src, dst) {
  const names = skillNames(src);
  const stale = owned(dst).filter((name) => !names.includes(name) && existsSync(path.join(dst, name)));
  const changed = names.filter((name) => {
    const a = path.join(src, name);
    const b = path.join(dst, name);
    const fa = files(a)
      .map((f) => path.relative(a, f))
      .sort();
    const fb = files(b)
      .map((f) => path.relative(b, f))
      .sort();
    return (
      fa.join('\n') !== fb.join('\n') ||
      fa.some((f) => readFileSync(path.join(a, f), 'utf8') !== readFileSync(path.join(b, f), 'utf8'))
    );
  });
  return [...changed, ...stale];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const src = '.claude/skills';
  const dst = '.agents/skills';
  if (!existsSync(src)) process.exit(0);
  if (process.argv.includes('--check')) {
    const bad = outOfSync(src, dst);
    if (bad.length) {
      console.error(`.agents/skills is out of date (${bad.join(', ')}). Run: node scripts/sync-agent-skills.mjs`);
      process.exit(1);
    }
    console.log('Agent skills in sync.');
  } else {
    syncSkills(src, dst);
  }
}
