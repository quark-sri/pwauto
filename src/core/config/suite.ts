/**
 * A suite is one application under test: its feature files, its step
 * definitions and its settings (base URL, login form, fixed users).
 *
 * `defineSuite()` adds the generic engine (core fixtures and common steps) to
 * each suite, so a suite lists only its own files. playwright.config.ts turns
 * each suite into one Playwright project per browser: "<suite>-<browser>".
 */
import type { PlaywrightTestConfig } from '@playwright/test';
// Type-only imports with the .ts extension: plain Node.js can load a suite file too (scripts/auth-save.ts).
import type { CoreOptions } from '../fixtures.ts';

export interface Suite {
  /** Short name, used in project names: "<name>-<browser>". */
  name: string;
  /** Glob of the feature files. */
  features: string;
  /** Globs of the step definitions and fixtures, generic engine included. */
  steps: string[];
  use?: PlaywrightTestConfig<Partial<CoreOptions>>['use'];
}

/** Step and fixture files that every suite gets. */
export const CORE_STEPS = ['src/core/fixtures.ts', 'src/steps/**/*.ts'];

export function defineSuite(suite: Omit<Suite, 'steps'> & { steps?: string[] }): Suite {
  if (!/^[a-z][a-z0-9]*$/.test(suite.name)) {
    throw new Error(`Suite name "${suite.name}" must be lower-case letters and digits (it is part of project names).`);
  }
  return { ...suite, steps: [...CORE_STEPS, ...(suite.steps ?? [])] };
}
