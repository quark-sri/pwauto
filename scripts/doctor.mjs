#!/usr/bin/env node
/**
 * pwauto doctor: analyse this machine and report what the framework needs.
 *
 * Works on Windows, macOS and Linux with only Node.js. It never installs or
 * changes anything (see scripts/setup.mjs for that).
 *
 *   npm run doctor            human-readable report
 *   npm run doctor -- --json  machine-readable report (for the env-setup agent)
 *   npm run doctor -- --ai    also require what the AI workflow needs (uv for lore)
 *
 * Exit code 1 when a REQUIRED item is missing.
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statfsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const asJson = process.argv.includes('--json');
// --ai: the user works with an AI agent (pwauto skills); tools the agent workflow needs become required.
const aiMode = process.argv.includes('--ai');
const root = process.cwd();
const checks = [];

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000 })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

function add(area, name, status, detail, fix = '') {
  checks.push({ area, name, status, detail, fix });
}

function version(text) {
  const m = text?.match(/(\d+)\.(\d+)\.?(\d+)?/);
  return m ? m.slice(1, 4).map((n) => Number(n ?? 0)) : null;
}

function atLeast(v, min) {
  for (let i = 0; i < 3; i++) {
    if ((v[i] ?? 0) > min[i]) return true;
    if ((v[i] ?? 0) < min[i]) return false;
  }
  return true;
}

// ---- System -----------------------------------------------------------------
const platform = { win32: 'Windows', darwin: 'macOS', linux: 'Linux' }[process.platform] ?? process.platform;
let osDetail = `${platform} ${os.release()} (${process.arch})`;
if (process.platform === 'darwin') osDetail = `macOS ${run('sw_vers -productVersion') ?? ''} (${process.arch})`;
if (process.platform === 'linux' && existsSync('/etc/os-release')) {
  const pretty = readFileSync('/etc/os-release', 'utf8').match(/^PRETTY_NAME="?([^"\n]+)/m)?.[1];
  if (pretty) osDetail = `${pretty} (${process.arch})`;
}
const isWsl = process.platform === 'linux' && /microsoft/i.test(os.release());
add('System', 'Operating system', 'ok', osDetail + (isWsl ? ' — WSL' : ''));

const ramGb = os.totalmem() / 1024 ** 3;
add(
  'System',
  'Memory',
  ramGb >= 8 ? 'ok' : 'warn',
  `${ramGb.toFixed(1)} GB`,
  ramGb >= 8 ? '' : 'Use WORKERS=2 in .env; 8 GB+ is recommended for parallel browsers.',
);
add(
  'System',
  'CPU cores',
  'ok',
  `${os.cpus().length} (suggested WORKERS: ${Math.max(1, Math.floor(os.cpus().length / 2))})`,
);
try {
  const fs = statfsSync(root);
  const freeGb = (fs.bavail * fs.bsize) / 1024 ** 3;
  add(
    'System',
    'Free disk',
    freeGb >= 3 ? 'ok' : 'fail',
    `${freeGb.toFixed(1)} GB`,
    freeGb >= 3 ? '' : 'Browsers, videos and traces need about 3 GB.',
  );
} catch {
  add('System', 'Free disk', 'warn', 'unknown');
}

// ---- Required tools -------------------------------------------------------------
const nodeV = version(process.versions.node);
const nodeOk = atLeast(nodeV, [20, 19, 0]);
add(
  'Required',
  'Node.js',
  nodeOk ? 'ok' : 'fail',
  process.versions.node,
  nodeOk ? '' : 'Install Node.js 22 or 24 LTS from https://nodejs.org (or nvm / fnm / winget).',
);
const npmV = run('npm --version');
add(
  'Required',
  'npm',
  npmV ? 'ok' : 'fail',
  npmV ?? 'not found',
  npmV ? '' : 'npm comes with Node.js: reinstall Node.js.',
);
const gitV = run('git --version');
add(
  'Required',
  'git',
  gitV ? 'ok' : 'fail',
  gitV ?? 'not found',
  gitV
    ? ''
    : platform === 'Windows'
      ? 'winget install Git.Git'
      : platform === 'macOS'
        ? 'xcode-select --install  (or brew install git)'
        : 'sudo apt-get install git',
);

// ---- Project ---------------------------------------------------------------------
const hasModules = existsSync(path.join(root, 'node_modules', '@playwright', 'test'));
add(
  'Project',
  'Dependencies (node_modules)',
  hasModules ? 'ok' : 'fail',
  hasModules ? 'installed' : 'missing',
  hasModules ? '' : 'npm run setup',
);

let pwVersion = null;
if (hasModules) {
  pwVersion = JSON.parse(readFileSync(path.join(root, 'node_modules/@playwright/test/package.json'), 'utf8')).version;
  add('Project', '@playwright/test', 'ok', pwVersion);
}

const browserCache =
  process.env.PLAYWRIGHT_BROWSERS_PATH ||
  (process.platform === 'win32'
    ? path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright')
    : process.platform === 'darwin'
      ? path.join(os.homedir(), 'Library', 'Caches', 'ms-playwright')
      : path.join(os.homedir(), '.cache', 'ms-playwright'));
const installed = existsSync(browserCache) ? readdirSync(browserCache) : [];
for (const b of ['chromium', 'firefox', 'webkit']) {
  const found = installed.some((d) => d.startsWith(`${b}-`));
  const wanted = (readEnv().BROWSERS ?? 'chromium').includes(b);
  add(
    'Browsers',
    b,
    found ? 'ok' : wanted ? 'fail' : 'info',
    found ? 'installed' : 'not installed',
    found ? '' : `npx playwright install ${b}`,
  );
}
if (process.platform === 'linux') {
  add('Browsers', 'Linux system libraries', 'info', 'browsers need OS libraries', 'sudo npx playwright install-deps');
}

const env = readEnv();
add(
  'Configuration',
  '.env file',
  existsSync(path.join(root, '.env')) ? 'ok' : 'fail',
  existsSync(path.join(root, '.env')) ? 'present' : 'missing',
  'cp .env.example .env  (Windows: copy .env.example .env)',
);
add(
  'Configuration',
  'BASE_URL (your app)',
  env.BASE_URL ? 'ok' : 'warn',
  env.BASE_URL || 'not set',
  env.BASE_URL ? '' : 'Set BASE_URL in .env to the web app you want to test.',
);
if (env.BASE_URL) {
  const reach = await fetch(env.BASE_URL, { method: 'GET', signal: AbortSignal.timeout(10_000) })
    .then((r) => `HTTP ${r.status}`)
    .catch((e) => `unreachable: ${e.cause?.code ?? e.message}`);
  add(
    'Configuration',
    'BASE_URL reachable',
    reach.startsWith('HTTP') ? 'ok' : 'warn',
    reach,
    reach.startsWith('HTTP') ? '' : 'Check VPN / proxy (HTTPS_PROXY) / the URL.',
  );
}

// ---- AI agents --------------------------------------------------------------------
const claudeV = run('claude --version');
add(
  'AI agents',
  'Claude Code CLI',
  claudeV ? 'ok' : 'info',
  claudeV ?? 'not found',
  claudeV ? '' : 'npm install -g @anthropic-ai/claude-code  (optional: or use Codex)',
);
const codexV = run('codex --version');
add(
  'AI agents',
  'OpenAI Codex CLI',
  codexV ? 'ok' : 'info',
  codexV ?? 'not found',
  codexV ? '' : 'npm install -g @openai/codex  (optional)',
);
const cliSkill = existsSync(path.join(root, '.claude', 'skills', 'playwright-cli', 'SKILL.md'));
add(
  'AI agents',
  'Playwright CLI skill',
  cliSkill ? 'ok' : 'warn',
  cliSkill ? 'installed' : 'missing',
  cliSkill ? '' : 'npm run agents:update',
);
const ghV = run('gh --version')?.split('\n')[0];
add(
  'Optional',
  'GitHub CLI (gh)',
  ghV ? 'ok' : 'info',
  ghV ?? 'not found',
  ghV ? '' : 'Optional, for pull requests: https://cli.github.com',
);
// uv runs the domainlore `lore` CLI that validates the knowledge base (the test
// oracle). Required for the AI workflow (--ai), optional when writing tests by hand.
const uvV = run('uv --version') ?? run('lore --version');
const uvInstall =
  process.platform === 'win32'
    ? 'winget install astral-sh.uv'
    : 'curl -LsSf https://astral.sh/uv/install.sh | sh   (macOS: or brew install uv)';
add(
  aiMode ? 'AI agents' : 'Optional',
  aiMode ? 'uv / lore (knowledge base validation)' : 'uv / lore (domainlore checks)',
  uvV ? 'ok' : aiMode ? 'fail' : 'info',
  uvV ?? 'not found',
  uvV ? '' : `${aiMode ? 'Required for the AI workflow' : 'Optional'}: ${uvInstall}`,
);
const javaV = run('java -version 2>&1');
add('Optional', 'Java', 'info', javaV ? javaV.split('\n')[0] : 'not needed', '');

// ---- Network ------------------------------------------------------------------------
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY;
if (proxy)
  add(
    'Network',
    'Proxy',
    'info',
    proxy,
    'Browsers download through HTTPS_PROXY. Corporate CA: set NODE_EXTRA_CA_CERTS.',
  );
if (process.env.NODE_EXTRA_CA_CERTS) add('Network', 'Extra CA certificates', 'info', process.env.NODE_EXTRA_CA_CERTS);

// ---- Output -------------------------------------------------------------------------
const failed = checks.filter((c) => c.status === 'fail');
if (asJson) {
  console.log(
    JSON.stringify(
      {
        platform: process.platform,
        arch: process.arch,
        node: process.versions.node,
        playwright: pwVersion,
        checks,
        ready: failed.length === 0,
      },
      null,
      2,
    ),
  );
} else {
  const icon = { ok: '✅', warn: '⚠️ ', fail: '❌', info: 'ℹ️ ' };
  let area = '';
  console.log('\npwauto doctor\n');
  for (const c of checks) {
    if (c.area !== area) {
      area = c.area;
      console.log(`\n${area}`);
    }
    console.log(
      `  ${icon[c.status]} ${c.name.padEnd(34)} ${c.detail}${c.fix && c.status !== 'ok' ? `\n       → ${c.fix}` : ''}`,
    );
  }
  console.log(
    failed.length
      ? `\n❌ ${failed.length} required item(s) missing. Run: npm run setup\n`
      : '\n✅ Ready. Next: npm run test:smoke\n',
  );
}
process.exit(failed.length ? 1 : 0);

function readEnv() {
  const file = path.join(root, '.env');
  const values = { ...process.env };
  if (existsSync(file)) {
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && values[m[1]] === undefined) values[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
  return values;
}
