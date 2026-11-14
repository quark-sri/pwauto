import { expect, test } from '@playwright/test';
import { execFileSync, spawnSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error -- plain .mjs scripts without type declarations
import { setValue } from '../../scripts/env-set.mjs';
// @ts-expect-error -- plain .mjs scripts without type declarations
import { findWeakening } from '../../scripts/guard-weakening.mjs';
// @ts-expect-error -- plain .mjs scripts without type declarations
import { checksFor, projectRelative } from '../../scripts/hooks/check-edit.mjs';
// @ts-expect-error -- plain .mjs scripts without type declarations
import { isProtected } from '../../scripts/hooks/guard-protected.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

test.describe('env:set', () => {
  test('replaces an existing key and appends a new one', () => {
    const out = setValue('A=1\nBASE_URL=old\n', 'BASE_URL', 'https://x.example.com');
    expect(out).toBe('A=1\nBASE_URL=https://x.example.com\n');
    expect(setValue('A=1\n', 'B', '2')).toBe('A=1\nB=2\n');
  });

  test('keeps $ patterns in values literally', () => {
    expect(setValue('PW=old\n', 'PW', 'pa$&ss$1')).toBe('PW=pa$&ss$1\n');
  });

  test('quotes values with spaces or #', () => {
    expect(setValue('', 'LOGIN_SUBMIT_BUTTON', 'Sign in')).toContain('LOGIN_SUBMIT_BUTTON="Sign in"');
    expect(setValue('', 'X', 'a#b')).toContain('X="a#b"');
  });

  test('rejects invalid keys and multi-line values', () => {
    expect(() => setValue('', 'base_url', 'x')).toThrow(/Invalid key/);
    expect(() => setValue('', 'A.*', 'x')).toThrow(/Invalid key/);
    expect(() => setValue('', 'A', 'x\ny')).toThrow(/one line/);
  });

  test('refuses retries and timeouts without --confirm', () => {
    const r = spawnSync('node', ['scripts/env-set.mjs', 'RETRIES=3'], { cwd: root, encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(r.stderr).toMatch(/--confirm/);
  });
});

test.describe('edit hook', () => {
  test('finds the project path on POSIX and Windows', () => {
    expect(projectRelative('/repo/src/x.ts', '/repo', path.posix)).toBe('src/x.ts');
    expect(projectRelative('C:\\repo\\src\\x.ts', 'C:\\repo', path.win32)).toBe('src/x.ts');
    expect(projectRelative('src\\steps\\a.steps.ts', 'C:\\repo', path.win32)).toBe('src/steps/a.steps.ts');
    expect(projectRelative('/elsewhere/x.ts', '/repo', path.posix)).toBeNull();
  });

  test('chooses the checks per file', () => {
    expect(checksFor('features/app/a.feature')).toEqual(['bddgen']);
    expect(checksFor('src/app/steps/a.steps.ts')).toEqual(['bddgen', 'eslint']);
    expect(checksFor('src/app/pages/A.ts')).toEqual(['eslint']);
    expect(checksFor('docs/a.md')).toEqual([]);
  });

  test('returns exit 2 with the lint problem for a file that breaks the standards', () => {
    const probe = path.join(root, 'src', `zz-hook-probe-${process.pid}.ts`);
    writeFileSync(
      probe,
      "import type { Page } from '@playwright/test';\nexport async function f(page: Page) {\n  await page.waitForTimeout(1000);\n}\n",
    );
    try {
      const r = spawnSync('node', ['scripts/hooks/check-edit.mjs'], {
        cwd: root,
        input: JSON.stringify({ tool_input: { file_path: probe } }),
        encoding: 'utf8',
        timeout: 90_000,
      });
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(/waitForTimeout|No fixed sleeps/);
    } finally {
      rmSync(probe, { force: true });
    }
  });

  test('guard-protected flags guardrail files only', () => {
    expect(isProtected('eslint.config.mjs', root)).toBe(true);
    expect(isProtected(path.join(root, 'playwright.config.ts'), root)).toBe(true);
    expect(isProtected('.claude/settings.json', root)).toBe(true);
    expect(isProtected('scripts/hooks/check-edit.mjs', root)).toBe(true);
    expect(isProtected('src/app/steps/a.steps.ts', root)).toBe(false);
  });
});

test.describe('weakening guard', () => {
  const diff = (file: string, lines: string[]) => `--- a/${file}\n+++ b/${file}\n${lines.join('\n')}\n`;

  test('flags removed assertions and scenarios', () => {
    expect(findWeakening(diff('src/app/steps/a.steps.ts', ['-  await expect(x).toHaveText("1");']))).toEqual([
      'src/app/steps/a.steps.ts: 1 assertion(s) removed (expect)',
    ]);
    expect(findWeakening(diff('features/app/a.feature', ['-  Scenario: one']))[0]).toMatch(/scenario\(s\) removed/);
  });

  test('accepts moved assertions', () => {
    expect(
      findWeakening(diff('src/a.ts', ['-  await expect(a).toBeVisible();', '+  await expect(b).toBeVisible();'])),
    ).toEqual([]);
  });

  test('flags @fixme without a recorded bug but accepts @known-bug @fixme', () => {
    expect(findWeakening(diff('features/app/a.feature', ['+  @regression @fixme']))).toHaveLength(1);
    expect(findWeakening(diff('features/app/a.feature', ['+  @known-bug @fixme']))).toEqual([]);
  });

  test('flags retries in .env.example', () => {
    expect(findWeakening('', 'RETRIES=2\n')).toEqual([expect.stringMatching(/RETRIES=2/)]);
    expect(findWeakening('', 'RETRIES=\n')).toEqual([]);
  });
});

test.describe('suite selection in playwright.config.ts', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });

  // A clean environment: the unit runner's own Playwright variables must not leak in.
  const cleanEnv = Object.fromEntries(
    Object.entries(process.env).filter(
      ([k]) => !/^(PW_|PLAYWRIGHT_|TEST_WORKER_INDEX|TEST_PARALLEL_INDEX|FORCE_COLOR)/.test(k),
    ),
  );

  const projects = (env: Record<string, string>): string[] => {
    const out = execFileSync('npx', ['playwright', 'test', '-c', 'playwright.config.ts', '--list', '--reporter=list'], {
      cwd: root,
      env: { ...cleanEnv, BROWSERS: 'chromium', ...env },
      encoding: 'utf8',
      shell: process.platform === 'win32',
    });
    return [...new Set([...out.matchAll(/\[([a-z0-9-]+)\] ›/g)].map((m) => m[1]!))].sort();
  };

  test.beforeAll(() => {
    execFileSync('npx', ['bddgen', '-c', 'playwright.config.ts'], {
      cwd: root,
      env: { ...cleanEnv, INCLUDE_EXAMPLES: 'true', BASE_URL: 'https://app.example.com' },
      shell: process.platform === 'win32',
    });
  });

  test('fresh clone (no BASE_URL) runs the reference example', () => {
    expect(projects({ BASE_URL: '', INCLUDE_EXAMPLES: 'false' })).toEqual(['toolshop-chromium']);
  });

  test('with BASE_URL only your app runs', () => {
    expect(projects({ BASE_URL: 'https://app.example.com', INCLUDE_EXAMPLES: 'false' })).toEqual(['app-chromium']);
  });

  test('INCLUDE_EXAMPLES adds the example to your app', () => {
    expect(projects({ BASE_URL: 'https://app.example.com', INCLUDE_EXAMPLES: 'true' })).toEqual([
      'app-chromium',
      'toolshop-chromium',
    ]);
  });
});
