/**
 * Core fixtures: the generic engine of the framework. Nothing in src/core
 * knows about a specific application.
 *
 * Every scenario automatically gets:
 *   log      a per-test logger, attached to the report as execution-log.txt
 *   ctx      a scenario context to share values between steps
 *   auth     generic login by role, with the session cached per worker
 *   field()  helpers live in ./ui.ts
 * and, without asking, evidence for the report: browser console errors,
 * page errors, failed network calls, the test data seed and (optionally) an
 * accessibility scan of the last page.
 *
 * Application suites (src/app, examples/*) extend this `test` with their own
 * page objects using `definePages()`, so all suites share one engine.
 */
import type { BrowserContext, Page } from '@playwright/test';
import { createBdd, test as bddTest } from 'playwright-bdd';
import { env } from './config/env';
import { scanAccessibility } from './utils/a11y';
import { dataSeed } from './utils/data-factory';
import { Logger, redact } from './utils/logger';
import { getUser, type Credentials } from './utils/users';
import { field, waitForSuccess } from './ui';

/** How the generic "Given I am logged in as a <role>" step logs in. */
export interface LoginSettings {
  /** Path of the login page, relative to the base URL. */
  path: string;
  /** Visible label or placeholder of the username / email field. */
  usernameField: string;
  /** Visible label or placeholder of the password field. */
  passwordField: string;
  /** Accessible name of the submit button. */
  submitButton: string;
  /** URL part (starts with "/") or visible text that proves login worked. Empty = "left the login page". */
  success: string;
}

type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

export interface CoreOptions {
  login: LoginSettings;
  /**
   * Fixed users of a suite, by role (used by examples with public demo users).
   * A role listed here ignores <ROLE>_USERNAME / <ROLE>_PASSWORD from .env, so
   * your app's credentials are never sent to an example site.
   */
  defaultUsers: Record<string, Omit<Credentials, 'role'>>;
}

export interface ScenarioContext {
  set<T>(key: string, value: T): void;
  get<T>(key: string): T;
}

export interface Auth {
  /** Log in as a configured role (<ROLE>_USERNAME / <ROLE>_PASSWORD). */
  loginAs(role: string): Promise<Credentials>;
  /** Log in with explicit credentials, e.g. a user the test just created through the API. */
  loginWith(user: Credentials): Promise<Credentials>;
}

interface CoreFixtures {
  log: Logger;
  ctx: ScenarioContext;
  auth: Auth;
  evidence: void;
}

interface CoreWorkerFixtures {
  sessionCache: Map<string, StorageState>;
}

export const test = bddTest.extend<CoreOptions & CoreFixtures, CoreWorkerFixtures>({
  login: [
    {
      path: env.LOGIN_PATH,
      usernameField: env.LOGIN_USERNAME_FIELD,
      passwordField: env.LOGIN_PASSWORD_FIELD,
      submitButton: env.LOGIN_SUBMIT_BUTTON,
      success: env.LOGIN_SUCCESS,
    },
    { option: true },
  ],
  defaultUsers: [{}, { option: true }],

  baseURL: async ({ baseURL }, use, testInfo) => {
    if (!baseURL) {
      throw new Error(
        `No base URL for project "${testInfo.project.name}". Set BASE_URL in .env to the address of the application you want to test.`,
      );
    }
    await use(baseURL);
  },

  log: async ({}, use, testInfo) => {
    const log = new Logger(`w${testInfo.workerIndex}`);
    log.info(`START ${testInfo.titlePath.slice(1).join(' > ')}`);
    log.info(`project=${testInfo.project.name} retry=${testInfo.retry} dataSeed=${dataSeed}`);
    await use(log);
    log.info(`END status=${testInfo.status} duration=${testInfo.duration}ms`);
    await testInfo.attach('execution-log.txt', { body: log.toString(), contentType: 'text/plain' });
  },

  ctx: async ({ log }, use) => {
    const store = new Map<string, unknown>();
    await use({
      set(key, value) {
        log.debug(`ctx.set ${key}`, redact({ [key]: value }));
        store.set(key, value);
      },
      get<T>(key: string): T {
        if (!store.has(key)) throw new Error(`Nothing was remembered as "${key}" earlier in this scenario.`);
        return store.get(key) as T;
      },
    });
  },

  sessionCache: [async ({}, use) => use(new Map()), { scope: 'worker' }],

  auth: async ({ page, context, login, defaultUsers, sessionCache, log }, use) => {
    const loginWith = async (user: Credentials): Promise<Credentials> => {
      const cached = sessionCache.get(user.username);
      if (cached) {
        log.info(`login as ${user.role}: reusing the cached session`);
        await applyStorageState(context, cached);
        return user;
      }
      log.info(`login as ${user.role} through ${login.path}`);
      await page.goto(login.path);
      await field(page, login.usernameField).fill(user.username);
      await field(page, login.passwordField).fill(user.password);
      await page.getByRole('button', { name: login.submitButton, exact: true }).click();
      await waitForSuccess(page, login);
      sessionCache.set(user.username, await context.storageState());
      return user;
    };
    await use({
      loginAs: (role) => loginWith(getUser(role, defaultUsers)),
      loginWith,
    });
  },

  evidence: [
    async ({ page, log }, use, testInfo) => {
      const consoleErrors: string[] = [];
      const networkErrors: {
        method: string;
        url: string;
        status: number | string;
        request?: unknown;
        body?: string;
      }[] = [];
      const pendingBodies: Promise<void>[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') consoleErrors.push(m.text());
      });
      page.on('pageerror', (e) => consoleErrors.push(`Uncaught: ${e.message}`));
      page.on('requestfailed', (r) =>
        networkErrors.push({ method: r.method(), url: r.url(), status: r.failure()?.errorText ?? 'failed' }),
      );
      page.on('response', (r) => {
        const type = r.request().resourceType();
        if (r.status() >= 400 && (type === 'xhr' || type === 'fetch' || type === 'document')) {
          const entry: (typeof networkErrors)[number] = {
            method: r.request().method(),
            url: r.url(),
            status: r.status(),
            request: requestPayload(r.request().postDataBuffer()?.toString() ?? null),
          };
          networkErrors.push(entry);
          // Keep the start of the error body: it usually says what was wrong.
          if (type !== 'document') {
            pendingBodies.push(
              r
                .text()
                .then((t) => void (entry.body = t.slice(0, 500)))
                .catch(() => undefined),
            );
          }
        }
      });

      await use();
      await Promise.all(pendingBodies);

      if (consoleErrors.length) {
        log.warn(`${consoleErrors.length} browser console error(s)`);
        await testInfo.attach('browser-console-errors.txt', {
          body: consoleErrors.join('\n'),
          contentType: 'text/plain',
        });
      }
      if (networkErrors.length) {
        log.info(`${networkErrors.length} failed network call(s)`);
        await testInfo.attach('network-errors.json', {
          body: JSON.stringify(networkErrors, null, 2),
          contentType: 'application/json',
        });
      }
      if (env.A11Y_CHECKS && !page.isClosed()) {
        const issues = await scanAccessibility(page, testInfo).catch(() => []);
        if (issues.length)
          log.warn(`accessibility: ${issues.length} serious/critical rule(s) violated on ${page.url()}`);
      }
    },
    { auto: true },
  ],
});

export const { Given, When, Then, Step, Before, After, BeforeStep, AfterStep } = createBdd(test);

/** What the page sent with a failed call: JSON with secrets masked, or the start of the text. */
function requestPayload(postData: string | null): unknown {
  if (!postData) return undefined;
  try {
    return redact(JSON.parse(postData));
  } catch {
    return /pass(word)?|secret|token/i.test(postData) ? '(not shown: may contain a secret)' : postData.slice(0, 300);
  }
}

/** Restore a saved session (cookies + localStorage) into a fresh context. */
async function applyStorageState(context: BrowserContext, state: StorageState): Promise<void> {
  await context.addCookies(state.cookies);
  for (const origin of state.origins) {
    await context.addInitScript(
      ({ origin: o, items }) => {
        if (window.location.origin === o) {
          for (const { name, value } of items) window.localStorage.setItem(name, value);
        }
      },
      { origin: origin.origin, items: origin.localStorage },
    );
  }
}

/**
 * Build a lazy page-object fixture from a registry { name: PageClass }.
 * A page object is created the first time a step uses it, once per scenario.
 */
export function definePages<R extends Record<string, new (page: Page) => object>>(registry: R) {
  type Pages = { [K in keyof R]: InstanceType<R[K]> };
  return async ({ page }: { page: Page }, use: (pages: Pages) => Promise<void>): Promise<void> => {
    const cache = new Map<keyof R, object>();
    const pages = {} as Pages;
    for (const key of Object.keys(registry) as (keyof R)[]) {
      Object.defineProperty(pages, key, {
        enumerable: true,
        get: () => {
          if (!cache.has(key)) cache.set(key, new registry[key]!(page));
          return cache.get(key);
        },
      });
    }
    await use(pages);
  };
}
