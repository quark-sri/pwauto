import { expect, test } from '@playwright/test';
import { parseEnv } from '../../src/core/config/env';

test.describe('parseEnv', () => {
  test('applies defaults when nothing is set', () => {
    const env = parseEnv({});
    expect(env.BASE_URL).toBeUndefined();
    expect(env.BROWSERS).toEqual(['chromium']);
    expect(env.HEADLESS).toBe(true);
    expect(env.VIEWPORT).toEqual({ width: 1366, height: 900 });
    expect(env.TEST_ID_ATTRIBUTE).toBe('data-testid');
    expect(env.INCLUDE_EXAMPLES).toBe(false);
  });

  test('treats blank values as not set', () => {
    const env = parseEnv({ BASE_URL: '', HEADLESS: '  ', TEST_TIMEOUT: '' });
    expect(env.BASE_URL).toBeUndefined();
    expect(env.HEADLESS).toBe(true);
    expect(env.TEST_TIMEOUT).toBe(60_000);
  });

  test('parses lists, booleans, numbers and viewport', () => {
    const env = parseEnv({
      BROWSERS: 'chromium, firefox ,webkit',
      HEADLESS: 'false',
      RETRIES: '2',
      VIEWPORT: '1280x720',
    });
    expect(env.BROWSERS).toEqual(['chromium', 'firefox', 'webkit']);
    expect(env.HEADLESS).toBe(false);
    expect(env.RETRIES).toBe(2);
    expect(env.VIEWPORT).toEqual({ width: 1280, height: 720 });
  });

  for (const [name, value, field] of [
    ['an unknown browser', { BROWSERS: 'netscape' }, 'BROWSERS'],
    ['a bad viewport', { VIEWPORT: '1280*720' }, 'VIEWPORT'],
    ['a non-numeric number', { RETRIES: 'abc' }, 'RETRIES'],
    ['a URL without scheme', { BASE_URL: 'myapp.example.com' }, 'BASE_URL'],
    ['an unknown evidence mode', { VIDEO: 'sometimes' }, 'VIDEO'],
  ] as const) {
    test(`rejects ${name} with a message naming ${field}`, () => {
      expect(() => parseEnv(value)).toThrow(new RegExp(`${field}`));
    });
  }

  test('captures network bodies locally but not on CI by default', () => {
    // The default is computed from the CI variable of the running process.
    expect(parseEnv({}).CAPTURE_NETWORK_BODIES).toBe(!process.env.CI);
    expect(parseEnv({ CAPTURE_NETWORK_BODIES: 'false' }).CAPTURE_NETWORK_BODIES).toBe(false);
  });
});
