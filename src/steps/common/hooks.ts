/**
 * Hooks for every scenario of every suite.
 *  - Log each Gherkin step in execution-log.txt.
 *  - With STEP_SCREENSHOTS=true, attach a screenshot after each step.
 */
import { AfterStep, BeforeStep } from '@core/fixtures';
import { env } from '@core/config/env';

BeforeStep(async ({ log, $step }) => {
  log.info(`STEP ${$step.title}`);
});

AfterStep(async ({ page, $step, $testInfo }) => {
  if (!env.STEP_SCREENSHOTS || page.isClosed()) return;
  await $testInfo.attach(`step: ${$step.title}`, {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});
