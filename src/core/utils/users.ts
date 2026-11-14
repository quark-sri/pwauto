/**
 * Test users by role.
 *
 * Credentials live only in environment variables (.env locally, secrets in CI).
 * The role name from a Gherkin step maps to a variable prefix:
 *   "customer"     -> CUSTOMER_USERNAME / CUSTOMER_PASSWORD
 *   "store admin"  -> STORE_ADMIN_USERNAME / STORE_ADMIN_PASSWORD
 */
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
