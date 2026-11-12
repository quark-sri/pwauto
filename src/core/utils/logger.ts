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
