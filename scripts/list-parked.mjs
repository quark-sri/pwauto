#!/usr/bin/env node
/**
 * List the scenarios that do not run: known application bugs (@fixme) and
 * drafts that wait for approval (@draft). Skipped tests are easy to forget;
 * this list keeps them visible in `npm run check` and in the run summary.
 *
 *   npm run parked            list with file, line and bug ID
 *   npm run parked -- --json  machine-readable
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Parked scenarios of one feature file. A bug ID (BUG-001) is read from the comment above the tags. */
export function findParked(text, file = '') {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const featureLine = lines.findIndex((l) => /^\s*Feature:/.test(l));
  const featureTags = featureLine > 0 ? (lines[featureLine - 1].match(/@[\w-]+/g) ?? []) : [];
  const parked = [];
  lines.forEach((line, i) => {
    const m = line.match(/^\s*Scenario(?: Outline)?:\s*(.+)$/);
    if (!m) return;
    // Tag lines and comment lines directly above the scenario.
    let tags = [...featureTags];
    let comment = '';
    for (let j = i - 1; j >= 0 && /^\s*(@|#)/.test(lines[j]); j--) {
      if (/^\s*@/.test(lines[j])) tags = tags.concat(lines[j].match(/@[\w-]+/g) ?? []);
      else comment = `${lines[j]} ${comment}`;
    }
    const kind = tags.includes('@fixme') ? 'known bug' : tags.includes('@draft') ? 'draft' : null;
    if (!kind) return;
    parked.push({ file, line: i + 1, scenario: m[1].trim(), kind, bug: comment.match(/BUG-\d+/)?.[0] ?? null });
  });
  return parked;
}

function featureFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return name === 'node_modules' ? [] : featureFiles(p);
    return name.endsWith('.feature') ? [p] : [];
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const all = ['features', 'examples']
    .flatMap(featureFiles)
    .sort()
    .flatMap((f) => findParked(readFileSync(f, 'utf8'), f.replaceAll('\\', '/')));
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(all, null, 2));
  } else {
    const bugs = all.filter((p) => p.kind === 'known bug');
    const drafts = all.filter((p) => p.kind === 'draft');
    console.log(`parked scenarios: ${bugs.length} known bug(s), ${drafts.length} draft(s) waiting for approval`);
    for (const p of all) {
      const id = p.kind === 'known bug' ? ` [${p.bug ?? 'NO BUG ID: add a comment with BUG-NNN'}]` : '';
      console.log(`- ${p.kind}${id}: ${p.file}:${p.line} ${p.scenario}`);
    }
  }
}
