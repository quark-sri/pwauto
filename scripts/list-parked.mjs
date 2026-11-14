#!/usr/bin/env node
/**
 * List the scenarios that do not run: known application bugs (@fixme) and
 * drafts that wait for approval (@draft). Skipped tests are easy to forget;
 * this list keeps them visible in `npm run check` and in the run summary.
 *
 *   npm run parked            list with file, line and bug ID; fails when a known
 *                             bug is not skipped, has no bug ID or has no bug report
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
    const fixme = tags.includes('@fixme');
    const marked = tags.includes('@known-bug') || tags.includes('@gap');
    const kind = fixme || marked ? 'known bug' : tags.includes('@draft') ? 'draft' : null;
    if (!kind) return;
    const bug = comment.match(/BUG-\d+/)?.[0] ?? null;
    const entry = { file, line: i + 1, scenario: m[1].trim(), kind, bug };
    // A known bug must be skipped (@fixme) and must name its bug report.
    if (kind === 'known bug' && !fixme) entry.problem = 'has @known-bug without @fixme: it runs and fails';
    else if (kind === 'known bug' && !bug) entry.problem = 'has no bug ID: add a comment with BUG-NNN above the tags';
    parked.push(entry);
  });
  return parked;
}

/** Folders that hold bug reports: test-plan/bugs and examples/<name>/bugs. */
function bugReports() {
  const dirs = [
    'test-plan/bugs',
    ...(existsSync('examples') ? readdirSync('examples').map((n) => `examples/${n}/bugs`) : []),
  ];
  return dirs.filter((d) => existsSync(d)).flatMap((d) => readdirSync(d));
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
  const reports = bugReports();
  for (const p of all) {
    if (p.bug && !p.problem && !reports.some((f) => f.startsWith(`${p.bug}-`) || f === `${p.bug}.md`))
      p.problem = `names ${p.bug}, but no ${p.bug}-<slug>.md exists in test-plan/bugs or examples/<name>/bugs`;
  }
  const broken = all.filter((p) => p.problem);
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(all, null, 2));
  } else {
    const bugs = all.filter((p) => p.kind === 'known bug');
    const drafts = all.filter((p) => p.kind === 'draft');
    console.log(`parked scenarios: ${bugs.length} known bug(s), ${drafts.length} draft(s) waiting for approval`);
    for (const p of all) {
      const id = p.kind === 'known bug' && p.bug ? ` [${p.bug}]` : '';
      console.log(`- ${p.kind}${id}: ${p.file}:${p.line} ${p.scenario}`);
    }
  }
  if (broken.length) {
    console.error(`\nKnown bugs must be recorded (AGENTS.md rule 2):`);
    for (const p of broken) console.error(`- ${p.file}:${p.line} "${p.scenario}" ${p.problem}`);
    process.exit(1);
  }
}
