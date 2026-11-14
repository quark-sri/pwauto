import { expect, test } from '@playwright/test';
import { CORE_STEPS, defineSuite } from '../../src/core/config/suite';
// @ts-expect-error -- plain .mjs script without type declarations
import { createFixtureServer, FIXTURE_USER } from '../fixture-app/server.mjs';

test.describe('defineSuite', () => {
  test('adds the generic engine before the steps of the suite', () => {
    const suite = defineSuite({ name: 'shop', features: 'x/**/*.feature', steps: ['x/steps/**/*.ts'] });
    expect(suite.steps).toEqual([...CORE_STEPS, 'x/steps/**/*.ts']);
    expect(defineSuite({ name: 'app2', features: 'f' }).steps).toEqual(CORE_STEPS);
  });

  test('rejects a name that cannot be part of a project name', () => {
    expect(() => defineSuite({ name: 'My Shop', features: 'f' })).toThrow(/lower-case/);
  });
});

test.describe('fixture site', () => {
  test('protects the account page and accepts only its user', async () => {
    const server = createFixtureServer();
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const { port } = server.address() as { port: number };
      const base = `http://127.0.0.1:${port}`;
      const post = (email: string, password: string) =>
        fetch(`${base}/login`, {
          method: 'POST',
          redirect: 'manual',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ email, password }),
        });

      const anonymous = await fetch(`${base}/account`, { redirect: 'manual' });
      expect([anonymous.status, anonymous.headers.get('location')]).toEqual([303, '/login']);

      expect((await post(FIXTURE_USER.username, 'wrong')).status).toBe(401);

      const ok = await post(FIXTURE_USER.username, FIXTURE_USER.password);
      expect([ok.status, ok.headers.get('location')]).toEqual([303, '/account']);
      expect(ok.headers.get('set-cookie')).toContain('session=ok');

      expect((await fetch(`${base}/nowhere`)).status).toBe(404);
    } finally {
      server.close();
    }
  });
});
