#!/usr/bin/env node
/**
 * pwauto setup: install everything the framework needs, on Windows, macOS or Linux.
 *
 *   npm run setup                       dependencies + browsers from BROWSERS in .env
 *   npm run setup -- --all-browsers     chromium, firefox and webkit
 *   npm run setup -- --with-deps        also OS libraries (Linux, needs sudo; used in CI)
 *
 * Steps (each is safe to re-run):
 *   1. Check Node.js
 *   2. npm install (npm ci when package-lock.json exists and node_modules is missing)
 *   3. Create .env from .env.example if missing
 *   4. Install Playwright browsers
 *   5. Generate the BDD tests (bddgen) to check the project compiles
 *   6. Run the doctor
 */
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync } from 'node:fs';

const args = new Set(process.argv.slice(2));
const step = (n, text) => console.log(`\n[${n}/6] ${text}`);
const sh = (cmd) => execSync(cmd, { stdio: 'inherit', shell: true });

step(1, 'Checking Node.js');
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 19)) {
  console.error(`Node.js ${process.versions.node} is too old. Install Node.js 22 or 24 LTS: https://nodejs.org`);
  process.exit(1);
}
console.log(`Node.js ${process.versions.node} on ${process.platform}/${process.arch}`);

step(2, 'Installing npm dependencies');
if (!existsSync('node_modules') && existsSync('package-lock.json')) sh('npm ci');
else sh('npm install');

step(3, 'Preparing .env');
if (!existsSync('.env')) {
  copyFileSync('.env.example', '.env');
  console.log('Created .env from .env.example. Set BASE_URL to the app you want to test.');
} else {
  console.log('.env already exists (not changed).');
}

step(4, 'Installing Playwright browsers');
const envText = readFileSync('.env', 'utf8');
const configured = (envText.match(/^BROWSERS=(.*)$/m)?.[1] ?? 'chromium')
  .split(',')
  .map((b) => b.trim())
  .map((b) => (b.startsWith('mobile-safari') ? 'webkit' : b.startsWith('mobile-chrome') ? 'chromium' : b))
  .filter(Boolean);
const browsers = args.has('--all-browsers') ? ['chromium', 'firefox', 'webkit'] : [...new Set(configured)];
const withDeps = args.has('--with-deps') ? ' --with-deps' : '';
sh(`npx playwright install${withDeps} ${browsers.join(' ')}`);
if (process.platform === 'linux' && !withDeps) {
  console.log('Linux: if a browser fails to start, run: sudo npx playwright install-deps');
}

step(5, 'Generating BDD tests');
sh('npx bddgen');

step(6, 'Checking the result');
try {
  sh('node scripts/doctor.mjs');
} catch {
  process.exit(1);
}
