#!/usr/bin/env node
/**
 * Fixture site: a tiny web application that lives in this repository.
 *
 * The framework tests (`npm run test:framework`) run the generic steps and the
 * core fixtures against it in a real browser. It needs no internet and no
 * third-party site, so it runs on every pull request.
 *
 *   node tests/fixture-app/server.mjs [port]     default port 4173
 *
 * It is NOT an example of an application under test. For that, see examples/toolshop.
 */
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

/** The only user of the fixture site. Not a secret: the site exists only on localhost. */
export const FIXTURE_USER = { username: 'tester@example.com', password: 'fixture-pass', name: 'Test User' };
export const FIXTURE_PORT = 4173;

const PRODUCTS = [
  { name: 'Claw hammer', price: 12.5, stock: true },
  { name: 'Sledge hammer', price: 30, stock: false },
  { name: 'Wood saw', price: 18.25, stock: true },
  { name: 'Pliers', price: 9.99, stock: true },
];

const page = (title, body, signedIn = false) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - Fixture shop</title>
</head>
<body>
  <header>
    <nav aria-label="Main">
      <a href="/">Home</a>
      <a href="/products">Products</a>
      <a href="/contact">Contact</a>
      ${signedIn ? '<a href="/account">My account</a> <a href="/logout">Sign out</a>' : '<a href="/login">Sign in</a>'}
    </nav>
  </header>
  <main>
${body}
  </main>
</body>
</html>`;

const home = (signedIn) =>
  page(
    'Home',
    `    <h1>Fixture shop</h1>
    <p>A small site for the pwauto framework tests.</p>
    <button type="button" id="hello">Say hello</button>
    <button type="button" disabled>Checkout</button>
    <p id="greeting" hidden>Hello, tester!</p>
    <script>
      document.getElementById('hello').addEventListener('click', () => {
        // Appears after a short delay, so steps must wait, not sleep.
        setTimeout(() => { document.getElementById('greeting').hidden = false; }, 300);
      });
    </script>`,
    signedIn,
  );

const products = (signedIn) =>
  page(
    'Products',
    `    <h1>Products</h1>
    <form id="filters">
      <label for="search">Search</label>
      <input id="search" type="search" name="q">
      <label for="sort">Sort by</label>
      <select id="sort" name="sort">
        <option value="name">Name (A - Z)</option>
        <option value="price">Price (low to high)</option>
      </select>
      <label><input type="checkbox" id="stock" name="stock"> In stock only</label>
    </form>
    <p id="count" role="status"></p>
    <ul id="list" aria-label="Products"></ul>
    <script>
      const all = ${JSON.stringify(PRODUCTS)};
      const el = (id) => document.getElementById(id);
      function render() {
        const q = el('search').value.trim().toLowerCase();
        let rows = all.filter((p) => p.name.toLowerCase().includes(q));
        if (el('stock').checked) rows = rows.filter((p) => p.stock);
        rows.sort(el('sort').value === 'price' ? (a, b) => a.price - b.price : (a, b) => a.name.localeCompare(b.name));
        el('list').innerHTML = rows.map((p) => '<li>' + p.name + ' <span>$' + p.price.toFixed(2) + '</span></li>').join('');
        el('count').textContent = rows.length === 0 ? 'No products found' : rows.length + ' product(s)';
      }
      for (const id of ['search', 'sort', 'stock']) el(id).addEventListener('input', render);
      render();
    </script>`,
    signedIn,
  );

const contact = (signedIn, sent) =>
  page(
    'Contact',
    sent
      ? `    <h1>Contact</h1>
    <p role="alert">Thanks, ${escapeHtml(sent.name)}. We will answer about: ${escapeHtml(sent.subject)}.</p>`
      : `    <h1>Contact</h1>
    <form method="post" action="/contact">
      <label for="name">Name</label>
      <input id="name" name="name" required>
      <label for="subject">Subject</label>
      <select id="subject" name="subject">
        <option>Order</option>
        <option>Returns</option>
        <option>Other</option>
      </select>
      <label for="message">Message</label>
      <textarea id="message" name="message" placeholder="How can we help?"></textarea>
      <button type="submit">Send</button>
    </form>`,
    signedIn,
  );

const login = (error) =>
  page(
    'Sign in',
    `    <h1>Sign in</h1>
    ${error ? '<p role="alert">Invalid email or password</p>' : ''}
    <form method="post" action="/login">
      <label for="email">Email</label>
      <input id="email" name="email" type="email">
      <label for="password">Password</label>
      <input id="password" name="password" type="password">
      <button type="submit">Sign in</button>
    </form>`,
  );

const account = () =>
  page(
    'My account',
    `    <h1>My account</h1>
    <p>Welcome, ${FIXTURE_USER.name}</p>`,
    true,
  );

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

async function form(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return Object.fromEntries(new URLSearchParams(body));
}

export function createFixtureServer() {
  return createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const signedIn = /(^|;\s*)session=ok(;|$)/.test(req.headers.cookie ?? '');
    const html = (body, status = 200) => {
      res.writeHead(status, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
      res.end(body);
    };
    const redirect = (to, cookie) => {
      res.writeHead(303, { location: to, ...(cookie ? { 'set-cookie': cookie } : {}) });
      res.end();
    };

    if (url.pathname === '/health') return html('ok');
    if (url.pathname === '/') return html(home(signedIn));
    if (url.pathname === '/products') return html(products(signedIn));
    if (url.pathname === '/contact') return html(contact(signedIn, req.method === 'POST' ? await form(req) : null));
    if (url.pathname === '/login' && req.method === 'POST') {
      const f = await form(req);
      return f.email === FIXTURE_USER.username && f.password === FIXTURE_USER.password
        ? redirect('/account', 'session=ok; Path=/; HttpOnly; SameSite=Lax')
        : html(login(true), 401);
    }
    if (url.pathname === '/login') return html(login(false));
    if (url.pathname === '/logout') return redirect('/', 'session=; Path=/; Max-Age=0');
    if (url.pathname === '/account') return signedIn ? html(account()) : redirect('/login');
    return html(page('Not found', '    <h1>Page not found</h1>'), 404);
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.argv[2] ?? process.env.FIXTURE_PORT ?? FIXTURE_PORT);
  createFixtureServer().listen(port, '127.0.0.1', () => console.log(`Fixture site: http://127.0.0.1:${port}`));
}
