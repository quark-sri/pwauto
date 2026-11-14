import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { definePages } from '../../src/core/pages/definePages';
import { buildPerson, uniqueId } from '../../src/core/utils/data-factory';
import { redact, redactText, requestPayload } from '../../src/core/utils/logger';
import { getUser, hasUser, manualMarker, roleKey, sessionFile, usesSavedSession } from '../../src/core/utils/users';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

test.describe('users', () => {
  test('maps a role sentence to an environment prefix', () => {
    expect(roleKey('customer')).toBe('CUSTOMER');
    expect(roleKey('a store admin')).toBe('STORE_ADMIN');
    expect(roleKey('the Billing-Manager')).toBe('BILLING_MANAGER');
  });

  test('reads credentials from the environment', () => {
    process.env.UNIT_ROLE_USERNAME = 'u@example.com';
    process.env.UNIT_ROLE_PASSWORD = 'pw';
    try {
      expect(getUser('unit role')).toEqual({ role: 'unit role', username: 'u@example.com', password: 'pw' });
    } finally {
      delete process.env.UNIT_ROLE_USERNAME;
      delete process.env.UNIT_ROLE_PASSWORD;
    }
  });

  test('a suite user wins over the environment, so app credentials never reach an example site', () => {
    process.env.CUSTOMER_USERNAME = 'real-app-user@example.com';
    try {
      const user = getUser('customer', { customer: { username: 'demo@example.com', password: 'demo' } });
      expect(user.username).toBe('demo@example.com');
    } finally {
      delete process.env.CUSTOMER_USERNAME;
    }
  });

  test('a missing user names the variables to add', () => {
    expect(() => getUser('nobody here')).toThrow(/NOBODY_HERE_USERNAME and NOBODY_HERE_PASSWORD/);
    expect(() => getUser('nobody here')).toThrow(/auth:save -- --role "nobody here" --manual/);
  });

  test('a saved session has one file per role, and a role is known by its username and password', () => {
    expect(sessionFile('Store Admin')).toBe('.auth/store_admin.json');
    expect(hasUser('nobody here')).toBe(false);
    expect(hasUser('customer', { customer: { username: 'demo@example.com', password: 'demo' } })).toBe(true);
  });

  test('a saved session is used only for a role without username and password, saved by a person', () => {
    const role = `unit saved ${process.pid}`;
    const key = roleKey(role);
    mkdirSync('.auth', { recursive: true });
    writeFileSync(sessionFile(role), '{"cookies":[],"origins":[]}');
    try {
      expect(usesSavedSession(role)).toBe(false); // no marker: written by the form login, not by a person
      writeFileSync(manualMarker(role), 'x');
      expect(usesSavedSession(role)).toBe(true);
      process.env[`${key}_USERNAME`] = 'someone@example.com'; // a username without a password
      expect(usesSavedSession(role)).toBe(false);
    } finally {
      delete process.env[`${key}_USERNAME`];
      rmSync(sessionFile(role), { force: true });
      rmSync(manualMarker(role), { force: true });
    }
  });
});

test.describe('redaction', () => {
  test('masks secret keys at any depth', () => {
    expect(redact({ user: 'a', password: 'p', nested: [{ apiKey: 'k', token: 't', ok: 1 }] })).toEqual({
      user: 'a',
      password: '***',
      nested: [{ apiKey: '***', token: '***', ok: 1 }],
    });
  });

  test('masks secrets in free text and JSON text', () => {
    expect(redactText('{"access_token":"abc","name":"x"}')).toBe('{"access_token":"***","name":"x"}');
    expect(redactText('Authorization: Bearer abc.def-123')).not.toContain('abc.def-123');
    expect(redactText('jwt eyJhbGciOi.eyJzdWIiOi.c2lnbmF0dXJl here')).toBe('jwt ***jwt*** here');
    expect(redactText('user=jane&password=hunter2&x=1')).toBe('user=jane&password=***&x=1');
  });

  test('request payloads are masked or withheld', () => {
    expect(requestPayload('{"email":"a@b.c","password":"p"}')).toEqual({ email: 'a@b.c', password: '***' });
    expect(requestPayload('email=a&password=p')).toBe('(not shown: may contain a secret)');
    expect(requestPayload(null)).toBeUndefined();
  });
});

test.describe('data factory', () => {
  test('unique ids do not repeat', () => {
    const ids = new Set(Array.from({ length: 500 }, () => uniqueId('t')));
    expect(ids.size).toBe(500);
  });

  test('people have unique example.com emails and a strong password', () => {
    const a = buildPerson();
    const b = buildPerson();
    expect(a.email).not.toBe(b.email);
    expect(a.email).toMatch(/@example\.com$/);
    expect(a.password).toMatch(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/);
    expect(a.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

test.describe('definePages', () => {
  test('creates each page object lazily, once per scenario', async () => {
    let created = 0;
    class OnePage {
      constructor(readonly page: Page) {
        created++;
      }
    }
    const fixture = definePages({ one: OnePage, two: OnePage });
    await fixture({ page: {} as Page }, async (pages) => {
      expect(created).toBe(0);
      expect(pages.one).toBe(pages.one);
      expect(created).toBe(1);
    });
  });
});
