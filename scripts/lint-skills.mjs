#!/usr/bin/env node
/**
 * Static checks of the agent layer (runs in `npm run check`):
 *   pwauto skills  - frontmatter name equals the folder; description has
 *                    "Use when" and "Not for" and is at most 1024 characters;
 *                    every `npm run <script>` exists; every referenced repo
 *                    file (docs/, scripts/, src/core/, examples/) exists.
 *   agents         - name, description, tools, model and an existing skill.
 *   evals          - every pwauto skill has positive and negative trigger cases.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const problems = [];
const scripts = Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).scripts);
const skillsDir = '.claude/skills';
const skills = readdirSync(skillsDir).filter((d) => d.startsWith('pwauto'));

function frontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) {
    problems.push(`${file}: no frontmatter`);
    return { text, fm: {} };
  }
  const fm = {};
  let list = null;
  for (const line of m[1].split('\n')) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && list) fm[list].push(item[1].trim());
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      list = kv[2] === '' ? kv[1] : null;
      fm[kv[1]] = kv[2] === '' ? [] : kv[2].replace(/^"(.*)"$/, '$1');
    }
  }
  return { text, fm };
}

function checkReferences(file, text) {
  for (const m of text.matchAll(/npm run ([a-z:-]+)/g)) {
    if (!scripts.includes(m[1])) problems.push(`${file}: "npm run ${m[1]}" is not a script in package.json`);
  }
  for (const m of text.matchAll(
    /`((?:docs|scripts|src\/core|examples\/toolshop)\/[^`\s<>*]+?\.(?:md|mjs|ts|feature))`/g,
  )) {
    if (!existsSync(m[1])) problems.push(`${file}: referenced file ${m[1]} does not exist`);
  }
}

for (const skill of skills) {
  const file = path.join(skillsDir, skill, 'SKILL.md');
  const { text, fm } = frontmatter(file);
  if (fm.name !== skill) problems.push(`${file}: name "${fm.name}" must equal the folder "${skill}"`);
  const d = fm.description ?? '';
  if (!/Use when/.test(d)) problems.push(`${file}: description needs a "Use when" clause`);
  if (skill !== 'pwauto' && !/Not for/.test(d)) problems.push(`${file}: description needs a "Not for" clause`);
  if (d.length > 1024) problems.push(`${file}: description is ${d.length} characters (max 1024)`);
  if (!/## Done when/.test(text)) problems.push(`${file}: no "## Done when" section`);
  checkReferences(file, text);
}

for (const agent of readdirSync('.claude/agents')) {
  const file = path.join('.claude/agents', agent);
  const { text, fm } = frontmatter(file);
  for (const key of ['name', 'description', 'tools', 'model']) {
    if (!fm[key] || fm[key].length === 0) problems.push(`${file}: frontmatter needs "${key}"`);
  }
  if (fm.name !== agent.replace(/\.md$/, '')) problems.push(`${file}: name must equal the file name`);
  for (const s of fm.skills ?? [])
    if (!existsSync(path.join(skillsDir, s, 'SKILL.md'))) problems.push(`${file}: skill ${s} not found`);
  checkReferences(file, text);
}

const evalFile = 'evals/skills.jsonl';
if (existsSync(evalFile)) {
  const cases = readFileSync(evalFile, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l, i) => {
      try {
        return JSON.parse(l);
      } catch {
        problems.push(`${evalFile}:${i + 1}: not valid JSON`);
        return {};
      }
    });
  for (const skill of skills) {
    const pos = cases.filter((c) => c.kind === 'trigger' && c.expect_skill === skill).length;
    const neg = cases.filter((c) => c.kind === 'trigger' && c.not_skill === skill).length;
    if (pos < 3 || neg < 1)
      problems.push(`${evalFile}: ${skill} needs >= 3 positive and >= 1 negative trigger cases (has ${pos}/${neg})`);
  }
} else {
  problems.push(`${evalFile} is missing`);
}

if (problems.length) {
  console.error(`Agent layer problems:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`lint-skills: ok (${skills.length} skills, ${readdirSync('.claude/agents').length} agents)`);
