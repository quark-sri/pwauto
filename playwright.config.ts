/**
 * Playwright + playwright-bdd configuration.
 *
 * You should rarely edit this file: every value comes from .env
 * (see src/core/config/env.ts and .env.example).
 *
 * Suites
 *   app       YOUR application: features/**, src/app/**, BASE_URL from .env
 *   toolshop  the bundled reference example (examples/toolshop). It runs when
 *             INCLUDE_EXAMPLES=true, or when no BASE_URL is set yet (fresh
 *             clone). It has its own URL and test users.
 *   fixture   the framework's own tests against the fixture site of this
 *             repository (tests/fixture-app). Only with FRAMEWORK_SMOKE=true
 *             (`npm run test:framework`); the config starts the site.
 * Each suite runs once per browser in BROWSERS, as project "<suite>-<browser>".
 *
 * Flow: `bddgen` turns .feature files + step definitions into Playwright tests
 * in .features-gen/<suite>/, then `playwright test` runs them.
 */
import { defineConfig, devices, type Project } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { cucumberReporter, defineBddProject } from 'playwright-bdd';
import { env } from './src/core/config/env';
import { defineSuite, type Suite } from './src/core/config/suite';
import type { CoreOptions } from './src/core/fixtures';

const loadSuite = async (file: string): Promise<Suite> =>
  ((await import(pathToFileURL(path.resolve(file)).href)) as { default: Suite }).default;

const appSuite = defineSuite({
  name: 'app',
  features: 'features/**/*.feature',
  steps: ['src/app/**/*.ts'],
  use: { baseURL: env.BASE_URL },
});

// Examples are found by their folder: examples/<name>/suite.ts. Delete the folder to remove one.
const exampleFiles = existsSync('examples')
  ? readdirSync('examples')
      .map((name) => `examples/${name}/suite.ts`)
      .filter((file) => existsSync(file))
      .sort()
  : [];
// With no app configured yet (fresh clone), run the reference example instead.
const runExamples = env.INCLUDE_EXAMPLES || !env.BASE_URL;
const fixtureFile = 'tests/fixture-app/suite.ts';
const runFixture = env.FRAMEWORK_SMOKE && existsSync(fixtureFile);

const fixtureSuite = runFixture ? await loadSuite(fixtureFile) : undefined;

const suites: Suite[] = [
  ...(env.BASE_URL ? [appSuite] : []),
  ...(runExamples ? await Promise.all(exampleFiles.map(loadSuite)) : []),
  ...(fixtureSuite ? [fixtureSuite] : []),
];

if (suites.length === 0) {
  throw new Error(
    'Nothing to test: set BASE_URL in .env to your application (npm run env:set -- BASE_URL=https://...), ' +
      'or set INCLUDE_EXAMPLES=true to run the bundled example.',
  );
}

const browserUse: Record<(typeof env.BROWSERS)[number], Project['use']> = {
  chromium: { ...devices['Desktop Chrome'] },
  firefox: { ...devices['Desktop Firefox'] },
  webkit: { ...devices['Desktop Safari'] },
  chrome: { ...devices['Desktop Chrome'], channel: 'chrome' },
  msedge: { ...devices['Desktop Edge'], channel: 'msedge' },
  'mobile-chrome': { ...devices['Pixel 7'] },
  'mobile-safari': { ...devices['iPhone 15'] },
};

const desktop = (b: string) => !b.startsWith('mobile');

const projects: Project<Partial<CoreOptions>>[] = suites.flatMap((suite) => {
  const { testDir } = defineBddProject({
    name: suite.name,
    features: suite.features,
    steps: suite.steps,
    // Fail at generation time when a Gherkin step has no definition, and
    // print a ready-to-paste snippet for it.
    missingSteps: 'fail-on-gen',
    // Workflow tags (docs/05-writing-bdd-scenarios.md):
    //   @draft   written, not yet approved in review -> not generated, not run
    //   @manual  agreed to stay manual               -> not generated, not run
    tags: 'not @draft and not @manual',
    // Attach an "AI fix" prompt to each failed test (error + step + page
    // snapshot). The test-healer agent reads it.
    aiFix: { promptAttachment: true },
  });
  return env.BROWSERS.map((browser) => ({
    name: `${suite.name}-${browser}`,
    testDir,
    use: {
      ...browserUse[browser],
      ...(desktop(browser) ? { viewport: env.VIEWPORT } : {}),
      ...suite.use,
    },
  }));
});

const isCI = !!process.env.CI;

export default defineConfig<Partial<CoreOptions>>({
  outputDir: 'test-results',
  timeout: env.TEST_TIMEOUT,
  expect: { timeout: env.EXPECT_TIMEOUT },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: env.RETRIES,
  ...(env.WORKERS ? { workers: env.WORKERS.endsWith('%') ? env.WORKERS : Number(env.WORKERS) } : {}),

  reporter: [
    [isCI ? 'dot' : 'list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results', detail: true, suiteTitle: true }],
    cucumberReporter('html', { outputFile: 'reports/cucumber/report.html', externalAttachments: true }),
    cucumberReporter('json', { outputFile: 'reports/cucumber/report.json' }),
    ...(isCI ? ([['github']] as const) : []),
  ],

  use: {
    testIdAttribute: env.TEST_ID_ATTRIBUTE,
    headless: env.HEADLESS,
    locale: env.LOCALE,
    timezoneId: env.TIMEZONE,
    actionTimeout: env.ACTION_TIMEOUT,
    navigationTimeout: env.NAVIGATION_TIMEOUT,
    screenshot: env.SCREENSHOT === 'on' ? { mode: 'on', fullPage: true } : env.SCREENSHOT,
    video: env.VIDEO,
    trace: env.TRACE,
    launchOptions: { slowMo: env.SLOW_MO },
  },

  projects,

  // The fixture site of the framework tests runs on this machine; no internet needed.
  ...(fixtureSuite
    ? {
        webServer: {
          command: 'node tests/fixture-app/server.mjs',
          url: `${fixtureSuite.use?.baseURL}/health`,
          reuseExistingServer: !isCI,
          timeout: 30_000,
        },
      }
    : {}),
});
