/**
 * Playwright + playwright-bdd configuration.
 *
 * You should rarely edit this file: every value comes from .env
 * (see src/core/config/env.ts and .env.example).
 *
 * Suites
 *   app       YOUR application: features/**, src/app/**, BASE_URL from .env
 *   toolshop  the bundled worked example (examples/toolshop), only when
 *             INCLUDE_EXAMPLES=true. It has its own URL and test users.
 * Each suite runs once per browser in BROWSERS, as project "<suite>-<browser>".
 *
 * Flow: `bddgen` turns .feature files + step definitions into Playwright tests
 * in .features-gen/<suite>/, then `playwright test` runs them.
 */
import { defineConfig, devices, type PlaywrightTestConfig, type Project } from '@playwright/test';
import { cucumberReporter, defineBddProject } from 'playwright-bdd';
import { env } from './src/core/config/env';
import type { CoreOptions } from './src/core/fixtures';
import { toolshopSuite } from './examples/toolshop/suite';

export interface Suite {
  name: string;
  features: string;
  steps: string[];
  use?: PlaywrightTestConfig<Partial<CoreOptions>>['use'];
}

const appSuite: Suite = {
  name: 'app',
  features: 'features/**/*.feature',
  steps: ['src/core/fixtures.ts', 'src/steps/**/*.ts', 'src/app/**/*.ts'],
  use: { baseURL: env.BASE_URL },
};

const suites: Suite[] = [...(env.BASE_URL ? [appSuite] : []), ...(env.INCLUDE_EXAMPLES ? [toolshopSuite] : [])];

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
});
