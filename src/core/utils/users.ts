/**
 * Test users by role.
 *
 * Credentials live only in environment variables (.env locally, secrets in CI).
 * The role name from a Gherkin step maps to a variable prefix:
 *   "customer"     -> CUSTOMER_USERNAME / CUSTOMER_PASSWORD
 *   "store admin"  -> STORE_ADMIN_USERNAME / STORE_ADMIN_PASSWORD
 */
import { existsSync } from 'node:fs';

export interface Credentials {
  role: string;
  username: string;
  password: string;
}

export function roleKey(role: string): string {
  return role
    .trim()
    .replace(/^(an?|the)\s+/i, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_');
}

/** Where `npm run auth:save -- --role <role>` keeps the saved browser session of a role. */
export function sessionFile(role: string): string {
  return `.auth/${roleKey(role).toLowerCase()}.json`;
}

/** Marker that `auth:save --manual` writes next to the session: a person signed in (SSO, MFA). */
export function manualMarker(role: string): string {
  return sessionFile(role).replace(/\.json$/, '.manual');
}

/**
 * True when the role should use its saved session: no username and no password are
 * configured, and a person saved the session with `auth:save --manual`. A role with a
 * username keeps the form login, so a missing password still gives a clear error and
 * an old session never hides it.
 */
export function usesSavedSession(role: string, defaults: Record<string, Omit<Credentials, 'role'>> = {}): boolean {
  const key = roleKey(role);
  const fallback = defaults[key.toLowerCase()];
  const configured = fallback ?? process.env[`${key}_USERNAME`] ?? process.env[`${key}_PASSWORD`];
  return !configured && existsSync(manualMarker(role)) && existsSync(sessionFile(role));
}

/** True when a username and a password exist for the role (suite defaults or environment). */
export function hasUser(role: string, defaults: Record<string, Omit<Credentials, 'role'>> = {}): boolean {
  const key = roleKey(role);
  const fallback = defaults[key.toLowerCase()];
  return Boolean(
    (fallback?.username ?? process.env[`${key}_USERNAME`]) && (fallback?.password ?? process.env[`${key}_PASSWORD`]),
  );
}

export function getUser(role: string, defaults: Record<string, Omit<Credentials, 'role'>> = {}): Credentials {
  const key = roleKey(role);
  const fallback = defaults[key.toLowerCase()];
  // A suite's fixed users win (examples); otherwise read the environment.
  const username = fallback?.username ?? process.env[`${key}_USERNAME`];
  const password = fallback?.password ?? process.env[`${key}_PASSWORD`];
  if (!username || !password) {
    throw new Error(
      `No test user for role "${role}". Add ${key}_USERNAME and ${key}_PASSWORD to .env (see .env.example). ` +
        `For single sign-on or MFA, save a session instead: npm run auth:save -- --role "${role}" --manual`,
    );
  }
  return { role, username, password };
}
