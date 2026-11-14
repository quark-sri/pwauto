/**
 * Per-test logger.
 *
 * Each scenario gets its own Logger (see the `log` fixture). Lines go to the
 * terminal (respecting LOG_LEVEL) and are attached to the test report as
 * `execution-log.txt`, together with browser console errors, page errors and
 * failed network requests, so a failure can be diagnosed from the report alone.
 */
import { env } from '../config/env';

export type Level = 'debug' | 'info' | 'warn' | 'error';
const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export class Logger {
  private readonly lines: string[] = [];

  constructor(private readonly scope: string) {}

  debug(message: string, data?: unknown): void {
    this.write('debug', message, data);
  }
  info(message: string, data?: unknown): void {
    this.write('info', message, data);
  }
  warn(message: string, data?: unknown): void {
    this.write('warn', message, data);
  }
  error(message: string, data?: unknown): void {
    this.write('error', message, data);
  }

  /** All lines of this test, at every level, for the report attachment. */
  toString(): string {
    return this.lines.join('\n');
  }

  private write(level: Level, message: string, data?: unknown): void {
    const suffix = data === undefined ? '' : ` ${safeJson(data)}`;
    const line = `${new Date().toISOString()} ${level.toUpperCase().padEnd(5)} ${message}${suffix}`;
    this.lines.push(line);
    if (ORDER[level] >= ORDER[env.LOG_LEVEL]) {
      // eslint-disable-next-line no-console -- the logger is the one place allowed to print
      console.log(`[${this.scope}] ${line}`);
    }
  }
}

function safeJson(data: unknown): string {
  try {
    return JSON.stringify(redact(data));
  } catch {
    return String(data);
  }
}

const SECRET_KEYS = /pass(word)?|secret|token|authorization|cookie|api[-_]?key/i;

/**
 * Mask secrets inside free text (response bodies, non-JSON payloads):
 * JSON is parsed and masked by key; otherwise bearer tokens, JWTs and
 * key=value / "key": "value" pairs with secret-looking keys are masked.
 */
export function redactText(text: string): string {
  try {
    return JSON.stringify(redact(JSON.parse(text)));
  } catch {
    return text
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, '$1 ***')
      .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '***jwt***')
      .replace(
        /(["']?(?:pass(?:word)?|secret|token|authorization|cookie|api[-_]?key|access_token|refresh_token)["']?\s*[:=]\s*)("[^"]*"|'[^']*'|[^\s&,;}]+)/gi,
        '$1***',
      );
  }
}

/** Never write secrets to logs or reports. */
export function redact(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(redact);
  if (data && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data as Record<string, unknown>).map(([k, v]) => [k, SECRET_KEYS.test(k) ? '***' : redact(v)]),
    );
  }
  return data;
}

/** What the page sent with a failed call: JSON with secrets masked, or the start of the text. */
export function requestPayload(postData: string | null): unknown {
  if (!postData) return undefined;
  try {
    return redact(JSON.parse(postData));
  } catch {
    return /pass(word)?|secret|token/i.test(postData)
      ? '(not shown: may contain a secret)'
      : redactText(postData).slice(0, 300);
  }
}
