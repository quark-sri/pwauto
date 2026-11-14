/**
 * Typed, validated runtime configuration.
 *
 * Every setting comes from environment variables, so the same suite runs
 * locally, in CI and against any environment without code changes.
 *
 * Load order (first value wins):
 *   1. Real environment variables (CI secrets, shell exports)
 *   2. .env.<TEST_ENV>   e.g. .env.qa, .env.staging (only when TEST_ENV is set)
 *   3. .env              local defaults (copy of .env.example)
 *
 * A wrong or missing value fails fast with a clear message, before any
 * browser starts.
 */
import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { z } from 'zod';

const testEnv = process.env.TEST_ENV?.trim();
if (testEnv && existsSync(`.env.${testEnv}`)) loadDotenv({ path: `.env.${testEnv}`, quiet: true });
if (existsSync('.env')) loadDotenv({ path: '.env', quiet: true });

// Empty values in .env (KEY=) are treated as "not set", so defaults apply.
const bool = (fallback: boolean) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase())));
const int = (fallback: number) =>
  z
    .string()
    .optional()
    .transform((v) => (v === undefined ? fallback : Number.parseInt(v, 10)))
    .pipe(z.number().int().nonnegative());

const browsers = ['chromium', 'firefox', 'webkit', 'chrome', 'msedge', 'mobile-chrome', 'mobile-safari'] as const;

const schema = z.object({
  TEST_ENV: z.string().default('local'),
  // The application under test. Empty is allowed so the bundled example can
  // run before you configure your own app; app scenarios then fail with a hint.
  BASE_URL: z.url({ message: 'BASE_URL must be a full URL, for example https://myapp.example.com' }).optional(),
  API_URL: z.url().optional(),
  TEST_ID_ATTRIBUTE: z.string().default('data-testid'),

  // Generic login used by "Given I am logged in as a {role}". Field names are
  // the visible labels (or placeholders) of the login form of YOUR app.
  LOGIN_PATH: z.string().default('/login'),
  LOGIN_USERNAME_FIELD: z.string().default('Email'),
  LOGIN_PASSWORD_FIELD: z.string().default('Password'),
  LOGIN_SUBMIT_BUTTON: z.string().default('Sign in'),
  // Text or URL part that proves the login worked, e.g. "/dashboard" or "Welcome".
  LOGIN_SUCCESS: z.string().default(''),

  // Run the bundled example suite (examples/toolshop) next to your own tests.
  INCLUDE_EXAMPLES: bool(false),

  BROWSERS: z
    .string()
    .default('chromium')
    .transform((v) =>
      v
        .split(',')
        .map((b) => b.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.enum(browsers)).min(1)),
  HEADLESS: bool(true),
  SLOW_MO: int(0),
  WORKERS: z.string().optional(),
  RETRIES: int(process.env.CI ? 2 : 0),
  LOCALE: z.string().default('en-US'),
  TIMEZONE: z.string().default('UTC'),
  VIEWPORT: z
    .string()
    .regex(/^\d+x\d+$/, 'VIEWPORT must look like 1366x900')
    .default('1366x900')
    .transform((v) => {
      const [width, height] = v.split('x').map(Number);
      return { width: width!, height: height! };
    }),

  TEST_TIMEOUT: int(60_000),
  EXPECT_TIMEOUT: int(10_000),
  ACTION_TIMEOUT: int(15_000),
  NAVIGATION_TIMEOUT: int(30_000),

  SCREENSHOT: z.enum(['on', 'off', 'only-on-failure']).default('on'),
  VIDEO: z.enum(['on', 'off', 'retain-on-failure', 'on-first-retry']).default('retain-on-failure'),
  TRACE: z.enum(['on', 'off', 'retain-on-failure', 'on-first-retry']).default('retain-on-failure'),
  STEP_SCREENSHOTS: bool(false),
  // Request and response bodies of failed API calls in network-errors.json
  // (secrets masked). Off by default on CI: bodies can hold personal data.
  CAPTURE_NETWORK_BODIES: bool(!process.env.CI),
  A11Y_CHECKS: bool(false),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('warn'),
  DATA_SEED: z.string().optional(),
});

export type Env = z.infer<typeof schema>;

/**
 * Validate settings. `source` defaults to the process environment (after the
 * .env files are loaded); tests pass their own map. Blank values mean "not set".
 */
export function parseEnv(source: Record<string, string | undefined> = process.env): Env {
  const raw = Object.fromEntries(Object.entries(source).filter(([, v]) => v !== undefined && v.trim() !== ''));
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid test configuration. Fix these values in .env (see .env.example):\n${problems}`);
  }
  return parsed.data;
}

export const env: Env = parseEnv();
