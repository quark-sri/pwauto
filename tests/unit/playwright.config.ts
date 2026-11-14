/**
 * Unit tests of the framework itself (config, utilities, scripts, hooks).
 * Offline and browser-free: they run in `npm run check` and in CI on every change.
 *   npm run test:unit
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  reporter: [[process.env.CI ? 'dot' : 'list']],
  outputDir: '../../test-results/unit',
});
