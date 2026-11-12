/**
 * Site crawler for the app-explorer agent.
 *
 * Visits same-origin pages breadth-first and saves, for each page, what an
 * agent needs to understand it without holding the whole page in context:
 * title, headings, the accessibility (ARIA) snapshot, forms, links, buttons
 * and a screenshot.
 *
 * Usage:
 *   npm run explore -- --url https://example.com [--max-pages 40] [--depth 3]
 *                      [--out .explore] [--include /shop] [--exclude /logout]
 *                      [--storage-state .auth/user.json] [--headed]
 *
 * Output (.explore/<host>/):
 *   sitemap.json        every page with its links (machine-readable)
 *   summary.md          one line per page, for a quick read
 *   pages/<slug>.md     the detail of one page
 *   screenshots/<slug>.png
 *
 * The crawler never submits forms or clicks buttons. It only follows links,
 * so it is safe to run against shared environments. Interactive exploration
 * (forms, flows) is done by the agent with `npx playwright cli`.
 */
import { chromium, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface Args {
  url: string;
  maxPages: number;
  depth: number;
  out: string;
  include: string[];
  exclude: string[];
  storageState?: string;
  headed: boolean;
}

interface PageInfo {
  url: string;
  slug: string;
  depth: number;
  title: string;
  status: number | null;
  headings: string[];
  links: { text: string; href: string }[];
  buttons: string[];
  forms: { name: string; fields: string[] }[];
  testIds: string[];
  consoleErrors: string[];
}

function parseArgs(argv: string[]): Args {
  const get = (name: string): string | undefined => {
    const i = argv.indexOf(`--${name}`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const all = (name: string): string[] =>
    argv.flatMap((a, i) => (a === `--${name}` && argv[i + 1] ? [argv[i + 1]!] : []));
  const url = get('url') ?? process.env.BASE_URL;
  if (!url) {
    console.error('Missing --url (or BASE_URL in .env).');
    process.exit(1);
  }
  return {
    url,
    maxPages: Number(get('max-pages') ?? 40),
    depth: Number(get('depth') ?? 3),
    out: get('out') ?? '.explore',
    include: all('include'),
    exclude: all('exclude'),
    storageState: get('storage-state'),
    headed: argv.includes('--headed'),
  };
}

const DEFAULT_EXCLUDES = [/logout/i, /sign-?out/i, /\.(pdf|zip|png|jpe?g|gif|svg|mp4|docx?|xlsx?)$/i];

function slugify(url: URL): string {
  const raw = (url.pathname + (url.search ? `-${url.search}` : '')).replace(/[^a-z0-9]+/gi, '-');
  return (
    raw
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 80) || 'home'
  );
}

function normalise(href: string, base: string): URL | null {
  try {
    const u = new URL(href, base);
    u.hash = '';
    return u;
  } catch {
    return null;
  }
}

async function settle(page: Page): Promise<void> {
  // SPAs keep loading after "load"; wait for the network to go quiet, but never hang.
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
}

async function inspect(page: Page): Promise<Omit<PageInfo, 'url' | 'slug' | 'depth' | 'status' | 'consoleErrors'>> {
  return page.evaluate(() => {
    const text = (el: Element): string => (el.textContent ?? '').replace(/\s+/g, ' ').trim();
    const visible = (el: Element): boolean => {
      const r = (el as HTMLElement).getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    const labelFor = (el: Element): string => {
      const id = el.getAttribute('id');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      return (
        el.getAttribute('aria-label') ??
        (label ? text(label) : null) ??
        el.getAttribute('placeholder') ??
        el.getAttribute('name') ??
        el.getAttribute('data-test') ??
        el.getAttribute('data-testid') ??
        el.tagName.toLowerCase()
      );
    };
    return {
      title: document.title,
      headings: [...document.querySelectorAll('h1,h2,h3')]
        .filter(visible)
        .map((h) => `${h.tagName.toLowerCase()}: ${text(h)}`)
        .slice(0, 40),
      links: [...document.querySelectorAll('a[href]')]
        .filter(visible)
        .map((a) => ({ text: text(a).slice(0, 80), href: (a as HTMLAnchorElement).href }))
        .slice(0, 200),
      buttons: [
        ...new Set(
          [...document.querySelectorAll('button,[role=button],input[type=submit]')]
            .filter(visible)
            .map((b) => text(b) || b.getAttribute('aria-label') || b.getAttribute('value') || '(no name)'),
        ),
      ].slice(0, 60),
      forms: [...document.querySelectorAll('form')].map((f, i) => ({
        name: f.getAttribute('name') ?? f.getAttribute('id') ?? f.getAttribute('data-test') ?? `form-${i + 1}`,
        fields: [...f.querySelectorAll('input,select,textarea')]
          .filter((el) => (el as HTMLInputElement).type !== 'hidden')
          .map((el) => `${labelFor(el)} (${(el as HTMLInputElement).type || el.tagName.toLowerCase()})`),
      })),
      testIds: [
        ...new Set(
          [...document.querySelectorAll('[data-test],[data-testid],[data-test-id],[data-qa]')].map(
            (el) =>
              el.getAttribute('data-test') ??
              el.getAttribute('data-testid') ??
              el.getAttribute('data-test-id') ??
              el.getAttribute('data-qa') ??
              '',
          ),
        ),
      ]
        .filter(Boolean)
        .slice(0, 150),
    };
  });
}

function renderPage(info: PageInfo, aria: string): string {
  const list = (items: string[]): string => (items.length ? items.map((i) => `- ${i}`).join('\n') : '- (none)');
  return `# ${info.title || info.url}

- URL: ${info.url}
- HTTP status: ${info.status ?? 'n/a (client-side route)'}
- Crawl depth: ${info.depth}
- Screenshot: ../screenshots/${info.slug}.png

## Headings
${list(info.headings)}

## Buttons
${list(info.buttons)}

## Forms
${info.forms.length ? info.forms.map((f) => `- **${f.name}**: ${f.fields.join(', ') || '(no fields)'}`).join('\n') : '- (none)'}

## Test IDs present
${info.testIds.length ? info.testIds.map((t) => `\`${t}\``).join(', ') : '(none)'}

## Links
${list(info.links.map((l) => `[${l.text || '(no text)'}](${l.href})`))}

## Console errors
${list(info.consoleErrors)}

## Accessibility snapshot
\`\`\`yaml
${aria}
\`\`\`
`;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const start = new URL(args.url);
  const root = join(args.out, start.host);
  mkdirSync(join(root, 'pages'), { recursive: true });
  mkdirSync(join(root, 'screenshots'), { recursive: true });

  const browser = await chromium.launch({ headless: !args.headed });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 },
    ...(args.storageState ? { storageState: args.storageState } : {}),
  });
  const page = await context.newPage();
  const consoleErrors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text().slice(0, 200)));
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message.slice(0, 200)}`));

  const allowed = (u: URL): boolean =>
    u.origin === start.origin &&
    !DEFAULT_EXCLUDES.some((r) => r.test(u.href)) &&
    !args.exclude.some((e) => u.href.includes(e)) &&
    (args.include.length === 0 || args.include.some((i) => u.pathname.startsWith(i)));

  const queue: { url: URL; depth: number }[] = [{ url: start, depth: 0 }];
  const seen = new Set<string>([start.href]);
  const results: PageInfo[] = [];

  while (queue.length && results.length < args.maxPages) {
    const { url, depth } = queue.shift()!;
    consoleErrors.length = 0;
    let status: number | null = null;
    try {
      const res = await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      status = res?.status() ?? null;
      await settle(page);
    } catch (e) {
      console.warn(`skip ${url.href}: ${(e as Error).message.split('\n')[0]}`);
      continue;
    }
    const finalUrl = new URL(page.url());
    const slug = slugify(finalUrl);
    const details = await inspect(page);
    const aria = await page
      .locator('body')
      .ariaSnapshot({ timeout: 10_000 })
      .catch(() => '(not available)');
    await page.screenshot({ path: join(root, 'screenshots', `${slug}.png`), fullPage: true }).catch(() => undefined);

    const info: PageInfo = { url: finalUrl.href, slug, depth, status, consoleErrors: [...consoleErrors], ...details };
    results.push(info);
    writeFileSync(join(root, 'pages', `${slug}.md`), renderPage(info, aria));
    console.log(`[${results.length}/${args.maxPages}] d${depth} ${info.url} — ${info.title}`);

    if (depth < args.depth) {
      for (const link of info.links) {
        const next = normalise(link.href, info.url);
        if (next && !seen.has(next.href) && allowed(next)) {
          seen.add(next.href);
          queue.push({ url: next, depth: depth + 1 });
        }
      }
    }
  }

  await browser.close();

  writeFileSync(
    join(root, 'sitemap.json'),
    JSON.stringify({ start: start.href, crawledAt: new Date().toISOString(), pages: results }, null, 2),
  );
  const summary = [
    `# Crawl summary: ${start.href}`,
    '',
    `Crawled ${results.length} pages (max ${args.maxPages}, depth ${args.depth}) at ${new Date().toISOString()}.`,
    `Not crawled (queue left): ${queue.length}.`,
    '',
    '| # | Page | Title | Headings | Forms | Console errors |',
    '|---|---|---|---|---|---|',
    ...results.map(
      (r, i) =>
        `| ${i + 1} | [${new URL(r.url).pathname}${new URL(r.url).search}](pages/${r.slug}.md) | ${r.title.replace(/\|/g, '/')} | ${r.headings.slice(0, 2).join('; ').replace(/\|/g, '/')} | ${r.forms.length} | ${r.consoleErrors.length} |`,
    ),
  ].join('\n');
  writeFileSync(join(root, 'summary.md'), summary + '\n');
  console.log(`\nDone. Read ${join(root, 'summary.md')}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
