#!/usr/bin/env node
/**
 * Run the agent evaluation cases (evals/skills.jsonl) with headless Claude Code.
 *
 *   npm run evals                       all cases, once, model sonnet
 *   npm run evals -- --repeat 3         each case 3 times (use this for a release)
 *   npm run evals -- --kind trigger     only one kind (trigger | behaviour)
 *   npm run evals -- --ids trig-heal-1  only these case ids (comma-separated)
 *   npm run evals -- --limit 5          the first 5 cases (a quick sample)
 *   npm run evals -- --model opus       another model
 *   npm run evals -- --record           add the result to evals/results.md (full runs only)
 *
 * What it tests: the committed project (HEAD), in a throw-away git worktree. The agent
 * may only use Read, Glob, Grep and Skill (no shell, no edits, no network, no MCP
 * servers, no user-level settings or plugins). It can only read the project, load
 * skills and answer.
 *
 * trigger    passes when the agent loads `expect_skill` (never `not_skill`) within 2 turns.
 *            A typed command ("/pwauto ...") passes when the session offers that command:
 *            this is a configuration check, not a routing check.
 * behaviour  10 turns; a second, short Claude call judges the answer against `must` /
 *            `must_not`. An unreadable verdict is an ERROR (retried once), not a FAIL.
 * needs      cases that need what the sandbox blocks (sub-agents, file writes) are
 *            SKIPPED and checked in the manual agent session of the release checklist.
 * split      "holdout" cases are never used to tune skills or AGENTS.md; their pass rate
 *            is reported apart, as the honest measure of routing on new wording.
 *
 * Costs model usage (about USD 0.05-0.20 per case and repeat). Raw output: reports/evals/<time>/.
 */
import { execFileSync, spawn } from 'node:child_process';
import { appendFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOLS = ['Read', 'Glob', 'Grep', 'Skill'];
const TIMEOUT_MS = 5 * 60_000;

/** Summarise a stream-json transcript: skills loaded, other tools used, answer text, cost, model. */
export function parseRun(jsonl) {
  const run = { skills: [], tools: [], commands: [], text: '', cost: 0, model: '', error: null };
  for (const line of jsonl.split('\n')) {
    let e;
    try {
      e = JSON.parse(line);
    } catch {
      continue;
    }
    if (e.type === 'system' && e.subtype === 'init') {
      run.commands = e.slash_commands ?? [];
      run.model = e.model ?? '';
    }
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

/** Verdict of a trigger case: { status: 'pass' | 'fail', reason }. */
export function triggerVerdict(testCase, run) {
  const typed = testCase.prompt?.match(/^\/([\w:-]+)/)?.[1];
  if (typed && typed === testCase.expect_skill)
    return run.commands.includes(typed)
      ? { status: 'pass', reason: `typed command /${typed} is available (configuration check)` }
      : { status: 'fail', reason: `typed command /${typed} is not offered by the session` };
  if (testCase.expect_skill && !run.skills.includes(testCase.expect_skill))
    return {
      status: 'fail',
      reason: `loaded [${run.skills.join(', ') || 'no skill'}], expected ${testCase.expect_skill}`,
    };
  if (testCase.not_skill && run.skills.includes(testCase.not_skill))
    return { status: 'fail', reason: `loaded ${testCase.not_skill}, which it must not` };
  return { status: 'pass', reason: `loaded [${run.skills.join(', ') || 'no skill'}]` };
}

/** Status of a case over its repeats: pass (all), flaky (some), fail (none), error (no verdict). */
export function combine(statuses) {
  const decided = statuses.filter((s) => s === 'pass' || s === 'fail');
  if (!decided.length) return 'error';
  const passes = decided.filter((s) => s === 'pass').length;
  return passes === decided.length ? 'pass' : passes === 0 ? 'fail' : 'flaky';
}

function claude(args, cwd) {
  return new Promise((resolve) => {
    let out = '';
    const child = spawn('claude', args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    const timer = setTimeout(() => child.kill('SIGTERM'), TIMEOUT_MS);
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve(`${out}\nspawn error: ${e.message}`);
    });
    child.on('close', () => {
      clearTimeout(timer);
      resolve(out);
    });
  });
}

const SANDBOX = ['--tools', ...TOOLS, '--strict-mcp-config', '--setting-sources', 'project'];

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
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await claude(
      ['-p', prompt, '--model', model, '--max-turns', '1', '--output-format', 'json', '--strict-mcp-config'],
      os.tmpdir(),
    );
    try {
      const result = JSON.parse(out);
      const v = JSON.parse(String(result.result ?? '').match(/\{[\s\S]*\}/)?.[0] ?? '');
      return {
        status: v.pass === true ? 'pass' : 'fail',
        reason: String(v.reason ?? ''),
        cost: result.total_cost_usd ?? 0,
      };
    } catch {
      // retry once; then report a judge error, not a product failure
    }
  }
  return { status: 'error', reason: 'the judge gave no readable verdict', cost: 0 };
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
  const ids = opt('ids', '');
  const limit = Number(opt('limit', '0'));
  const repeat = Math.max(1, Number(opt('repeat', '1')));
  const concurrency = Math.max(1, Number(opt('concurrency', '4')));
  if (argv.includes('--record') && (kind || ids || limit)) {
    console.error('--record keeps full runs only: remove --kind, --ids and --limit.');
    process.exit(2);
  }

  let cases = readFileSync('evals/skills.jsonl', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  if (kind) cases = cases.filter((c) => c.kind === kind);
  if (ids) cases = cases.filter((c) => ids.split(',').includes(c.id));
  if (limit) cases = cases.slice(0, limit);
  const skipped = cases.filter((c) => c.needs);
  const runnable = cases.filter((c) => !c.needs);

  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outDir = path.join('reports', 'evals', stamp);
  mkdirSync(outDir, { recursive: true });
  const worktree = mkdtempSync(path.join(os.tmpdir(), 'pwauto-evals-'));
  execFileSync('git', ['worktree', 'add', '--detach', worktree, 'HEAD'], { stdio: 'ignore' });
  const commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  console.log(
    `Running ${runnable.length} case(s) x ${repeat} with ${model} (judge ${judgeModel}); ${skipped.length} skipped`,
  );

  const jobs = runnable.flatMap((c) => Array.from({ length: repeat }, (_, r) => ({ c, r })));
  const byCase = new Map(runnable.map((c) => [c.id, { case: c, statuses: [], reasons: [], cost: 0 }]));
  let resolvedModel = '';
  let next = 0;
  async function worker() {
    while (next < jobs.length) {
      const { c, r } = jobs[next++];
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
          ...SANDBOX,
        ],
        worktree,
      );
      writeFileSync(path.join(outDir, `${c.id}-${r + 1}.jsonl`), raw);
      const run = parseRun(raw);
      resolvedModel ||= run.model;
      const verdict = c.kind === 'trigger' ? { ...triggerVerdict(c, run), cost: 0 } : await judge(c, run, judgeModel);
      const entry = byCase.get(c.id);
      entry.statuses.push(verdict.status);
      entry.reasons.push(verdict.reason);
      entry.cost += run.cost + verdict.cost;
      console.log(
        `${verdict.status.toUpperCase()} ${c.id} (${r + 1}/${repeat}): ${c.prompt.slice(0, 60)} -> ${verdict.reason}`,
      );
    }
  }
  try {
    await Promise.all(Array.from({ length: concurrency }, worker));
  } finally {
    execFileSync('git', ['worktree', 'remove', '--force', worktree], { stdio: 'ignore' });
  }

  const results = [...byCase.values()].map((e) => ({ ...e, status: combine(e.statuses) }));
  const count = (list, status) => list.filter((r) => r.status === status).length;
  const group = (label, list) => (list.length ? `${label} ${count(list, 'pass')}/${list.length}` : `${label} -`);
  const tuned = results.filter((r) => r.case.split !== 'holdout');
  const holdout = results.filter((r) => r.case.split === 'holdout');
  const cost = results.reduce((s, r) => s + r.cost, 0);
  const notPassed = results.filter((r) => r.status !== 'pass');
  const summary = [
    `## ${new Date().toISOString().slice(0, 10)} — Claude Code ${resolvedModel || model} (judge ${judgeModel}), commit ${commit}, ${repeat} repeat(s)`,
    '',
    `- Passed: **${count(results, 'pass')} / ${results.length}** — ${group(
      'trigger',
      tuned.filter((r) => r.case.kind === 'trigger'),
    )}, ${group(
      'behaviour',
      tuned.filter((r) => r.case.kind === 'behaviour'),
    )}, ${group('holdout', holdout)}; flaky ${count(results, 'flaky')}, error ${count(results, 'error')}`,
    `- Skipped (sandbox blocks: ${[...new Set(skipped.map((c) => c.needs))].join(', ') || '-'}; checked in the manual release session): ${skipped.map((c) => c.id).join(', ') || 'none'}`,
    `- Cost (agent and judge): about USD ${cost.toFixed(2)}`,
    ...(notPassed.length
      ? [
          '- Not passed:',
          ...notPassed.map(
            (r) =>
              `  - ${r.case.id} ${r.status.toUpperCase()} "${r.case.prompt}": ${[...new Set(r.reasons)].join(' / ')}`,
          ),
        ]
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
  process.exitCode = notPassed.some((r) => r.status === 'fail') ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
