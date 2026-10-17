'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const app = require('../server');
const { get } = require('../src/db');

let server;
let base;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

async function fetchOk(pathName, expected = 200) {
  const res = await fetch(base + pathName, { redirect: 'manual' });
  const body = await res.text();
  assert.equal(res.status, expected, `${pathName} → ${res.status}`);
  return { res, body };
}

test('public pages render', async () => {
  const paths = [
    '/',
    '/services',
    '/market-area',
    '/blog',
    '/about',
    '/contact',
    '/privacy',
    '/search?q=shopify'
  ];
  for (const p of paths) {
    const { body } = await fetchOk(p);
    assert.ok(body.includes('</html>'), `${p} should render a full page`);
    assert.ok(!body.includes('undefined'), `${p} must not leak "undefined" into markup`);
  }
});

test('service detail pages render with meta tags', async () => {
  const service = get('SELECT slug FROM services WHERE active = 1 LIMIT 1');
  const { body } = await fetchOk(`/services/${service.slug}`);
  assert.match(body, /<title>[^<]+<\/title>/);
  assert.match(body, /<meta name="description" content="[^"]+"/);
  assert.match(body, /<link rel="canonical" href="https?:\/\//);
});

test('market area drill-down works country → state → city → service', async () => {
  const row = get(`
    SELECT co.slug AS country, s.slug AS state, c.slug AS city
    FROM cities c
    JOIN states s ON s.id = c.state_id
    JOIN countries co ON co.id = s.country_id
    WHERE c.active = 1 AND s.active = 1 AND co.active = 1
    ORDER BY c.id LIMIT 1`);
  assert.ok(row, 'seed must contain at least one active city');

  const cityPath = `/market-area/${row.country}/${row.state}/${row.city}`;
  const { body: cityBody } = await fetchOk(cityPath);
  assert.ok(cityBody.includes('</html>'));

  const service = get('SELECT slug FROM services WHERE active = 1 LIMIT 1');
  await fetchOk(`${cityPath}/${service.slug}`);
});

test('blog article renders with Article schema', async () => {
  const post = get(`SELECT slug FROM posts WHERE status = 'published' LIMIT 1`);
  const { body } = await fetchOk(`/blog/${post.slug}`);
  assert.match(body, /application\/ld\+json/);
  assert.match(body, /"@type":"BlogPosting"|"@type": "BlogPosting"/);
});

test('unknown paths return a 404 page', async () => {
  const { body } = await fetchOk('/this-page-does-not-exist', 404);
  assert.match(body, /not found/i);
});

test('robots.txt allows AI crawlers and points at the sitemap', async () => {
  const { body } = await fetchOk('/robots.txt');
  assert.match(body, /Sitemap: https?:\/\/[^\s]+\/sitemap\.xml/);
  assert.match(body, /GPTBot|ClaudeBot|PerplexityBot/);
});

test('llms.txt documents the site', async () => {
  const { body } = await fetchOk('/llms.txt');
  assert.match(body, /# Sama Solutions/);
});

test('sitemap index lists every child sitemap', async () => {
  const { body } = await fetchOk('/sitemap.xml');
  for (const child of ['pages', 'services', 'market', 'blog']) {
    assert.ok(body.includes(`/sitemap-${child}.xml`), `missing ${child} sitemap`);
  }
});

test('market sitemaps are chunked and well formed', async () => {
  const { body } = await fetchOk('/sitemap-market-services-1.xml');
  assert.match(body, /<urlset/);
  assert.ok((body.match(/<url>/g) || []).length > 0);
});

test('admin area requires authentication', async () => {
  const res = await fetch(base + '/admin', { redirect: 'manual' });
  assert.equal(res.status, 302);
  assert.match(res.headers.get('location'), /\/admin\/login/);
});

test('login page renders and is noindex', async () => {
  const { body } = await fetchOk('/admin/login');
  assert.match(body, /noindex/);
  assert.match(body, /Sign in/i);
});

test('inquiry API validates payloads', async () => {
  const res = await fetch(base + '/api/inquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'A', email: 'nope' })
  });
  const json = await res.json();
  assert.equal(res.status, 422);
  assert.equal(json.ok, false);

  const honeypot = await fetch(base + '/api/inquiries', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Bot', email: 'bot@example.com', message: 'buy now', website: 'spam.example' })
  });
  assert.equal((await honeypot.json()).ok, true, 'honeypot should be silently accepted');
});

test('market search returns suggestions', async () => {
  const res = await fetch(base + '/api/market-search?q=del');
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.ok(Array.isArray(json.results));
});

test('health endpoint reports ok', async () => {
  const res = await fetch(base + '/api/health');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).ok, true);
});
