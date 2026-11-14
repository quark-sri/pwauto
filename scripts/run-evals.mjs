#!/usr/bin/env node
/**
 * Run the agent evaluation cases (evals/skills.jsonl) with headless Claude Code.
 *
 *   npm run evals                       all cases, model sonnet
 *   npm run evals -- --kind trigger     only one kind (trigger | behaviour)
 *   npm run evals -- --limit 5          the first 5 cases (a quick sample)
 *   npm run evals -- --ids 8,18         only these case numbers (line numbers in the file)
 *   npm run evals -- --model opus       another model
 *   npm run evals -- --record           also add the result to evals/results.md
 *
 * Safety: the cases run in a throw-away git worktree of HEAD, and the agent gets no
 * tools that change files or reach the network (Bash, Edit, Write, WebFetch, ...).
 * It can only read the project, load skills and answer.
 *
 * trigger    passes when the agent loads `expect_skill` (and never `not_skill`).
 * behaviour  a second, short Claude call judges the answer against `must` / `must_not`.
 *
 * Costs model usage (about USD 0.05-0.20 per case). Raw output: reports/evals/<time>/.
 */
import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BLOCKED_TOOLS = 'Bash Edit Write MultiEdit NotebookEdit WebFetch WebSearch Agent';

/** Summarise a stream-json transcript: skills loaded, other tools used, answer text, cost. */
export function parseRun(jsonl) {
  const run = { skills: [], tools: [], commands: [], text: '', cost: 0, error: null };
  for (const line of jsonl.split('\n')) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.type === 'system' && e.subtype === 'init') run.commands = e.slash_commands ?? [];
    if (e.type === 'assistant') {
      for (const c of e.message?.content ?? []) {
        if (c.type === 'tool_use' && c.name === 'Skill')
          run.skills.push(String(c.input?.skill ?? '').replace(/^.*:/, ''));
        else if (c.type === 'tool_use') run.tools.push(c.name);
        else if (c.type === 'text') run.text += `${c.text}\n`;
      }
    }
    if (e.type === 'result') {
      run.cost = e.total_cost_usd ?? 0;
      if (e.is_error) run.error = e.subtype ?? 'error';
    }
  }
  return run;
}

/** Verdict of a trigger case. */
export function triggerVerdict(testCase, run) {
  // A typed slash command ("/pwauto ...") puts the skill into the prompt itself, with no
  // Skill tool call. The case then checks that the session offers that command.
  const typed = testCase.prompt?.match(/^\/([\w:-]+)/)?.[1];
  if (typed && typed === testCase.expect_skill)
    return run.commands.includes(typed)
      ? { pass: true, reason: `typed command /${typed} is available` }
      : { pass: false, reason: `typed command /${typed} is not offered by the session` };
  if (testCase.expect_skill && !run.skills.includes(testCase.expect_skill))
    return {
      pass: false,
      reason: `loaded [${run.skills.join(', ') || 'no skill'}], expected ${testCase.expect_skill}`,
    };
  if (testCase.not_skill && run.skills.includes(testCase.not_skill))
    return { pass: false, reason: `loaded ${testCase.not_skill}, which it must not` };
  return { pass: true, reason: `loaded [${run.skills.join(', ') || 'no skill'}]` };
}

function claude(args, cwd) {
  return new Promise((resolve) => {
    const child = spawn('claude', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', () => resolve(out));
  });
}

async function judge(testCase, run, model) {
  const prompt = [
    'You judge one answer of an AI coding agent against a rule. Reply with JSON only:',
    '{"pass": true|false, "reason": "<one sentence>"}',
    '',
    `User request: ${testCase.prompt}`,
    `The agent MUST: ${testCase.must}`,
    `The agent MUST NOT: ${testCase.must_not}`,
    `Tools the agent used: ${run.tools.join(', ') || 'none'}; skills loaded: ${run.skills.join(', ') || 'none'}`,
    'The agent could not edit files or run commands in this test, so judge what it said and proposed:',
    'proposing or offering the right action counts as doing it; doing nothing wrong is not enough when MUST asks for an action.',
    '',
    'Agent answer:',
    run.text.slice(-6000),
  ].join('\n');
  const out = await claude(
    ['-p', prompt, '--model', model, '--max-turns', '1', '--output-format', 'text'],
    os.tmpdir(),
  );
  const m = out.match(/\{[\s\S]*\}/);
  try {
    const v = JSON.parse(m?.[0] ?? '');
    return { pass: v.pass === true, reason: String(v.reason ?? '') };
  } catch {
    return { pass: false, reason: `judge gave no verdict: ${out.slice(0, 120)}` };
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : fallback;
  };
  const model = opt('model', 'sonnet');
  const judgeModel = opt('judge-model', 'sonnet');
  const kind = opt('kind', '');
  const limit = Number(opt('limit', '0'));
  const concurrency = Number(opt('concurrency', '4'));

  let cases = readFileSync('evals/skills.jsonl', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l, i) => ({ id: i + 1, ...JSON.parse(l) }));
  if (kind) cases = cases.filter((c) => c.kind === kind);
  const ids = opt('ids', '');
  if (ids) cases = cases.filter((c) => ids.split(',').map(Number).includes(c.id));
  if (limit) cases = cases.slice(0, limit);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join('reports', 'evals', stamp);
  mkdirSync(outDir, { recursive: true });
  const worktree = mkdtempSync(path.join(os.tmpdir(), 'pwauto-evals-'));
  execFileSync('git', ['worktree', 'add', '--detach', worktree, 'HEAD'], { stdio: 'ignore' });
  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(`Running ${cases.length} case(s) with ${model} (judge ${judgeModel}) in ${worktree}`);

  const results = [];
  let next = 0;
  async function worker() {
    while (next < cases.length) {
      const c = cases[next++];
      const turns = c.kind === 'trigger' ? '2' : '10';
      const raw = await claude(
        [
          '-p',
          c.prompt,
          '--output-format',
          'stream-json',
          '--verbose',
          '--model',
          model,
          '--max-turns',
          turns,
          '--disallowedTools',
          BLOCKED_TOOLS,
        ],
        worktree,
      );
      writeFileSync(path.join(outDir, `case-${String(c.id).padStart(2, '0')}.jsonl`), raw);
      const run = parseRun(raw);
      const verdict = c.kind === 'trigger' ? triggerVerdict(c, run) : await judge(c, run, judgeModel);
      results.push({ ...c, ...verdict, cost: run.cost });
      console.log(
        `${verdict.pass ? 'PASS' : 'FAIL'} #${c.id} ${c.kind}: ${c.prompt.slice(0, 70)} -> ${verdict.reason}`,
      );
    }
  }
  try {
    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  } finally {
    execFileSync('git', ['worktree', 'remove', '--force', worktree], { stdio: 'ignore' });
  }

  results.sort((a, b) => a.id - b.id);
  const passed = results.filter((r) => r.pass).length;
  const cost = results.reduce((s, r) => s + (r.cost || 0), 0);
  const failed = results.filter((r) => !r.pass);
  const summary = [
    `## ${new Date().toISOString().slice(0, 10)} — Claude Code, model ${model} (judge ${judgeModel}), commit ${commit}`,
    '',
    `- Passed: **${passed} / ${results.length}** (trigger ${results.filter((r) => r.kind === 'trigger' && r.pass).length}/${results.filter((r) => r.kind === 'trigger').length}, behaviour ${results.filter((r) => r.kind === 'behaviour' && r.pass).length}/${results.filter((r) => r.kind === 'behaviour').length})`,
    `- Cost of the agent runs: about USD ${cost.toFixed(2)}`,
    ...(failed.length
      ? ['- Failed cases:', ...failed.map((r) => `  - #${r.id} (${r.kind}) "${r.prompt}": ${r.reason}`)]
      : []),
    '',
  ].join('\n');
  writeFileSync(path.join(outDir, 'summary.md'), summary);
  console.log(`\n${summary}`);
  if (argv.includes('--record')) {
    if (!existsSync('evals/results.md')) writeFileSync('evals/results.md', '# Evaluation results\n\n');
    appendFileSync('evals/results.md', `${summary}\n`);
    console.log('Recorded in evals/results.md');
  }
  process.exitCode = failed.length ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
