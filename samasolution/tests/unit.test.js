'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { slugify, numberFmt, truncate, formatDate, parseJSON, escapeHtml } = require('../src/lib/utils');
const { keywordList, metaTitle } = require('../src/lib/seo');

test('slugify produces url-safe slugs', () => {
  assert.equal(slugify('Web Design & Development'), 'web-design-and-development');
  assert.equal(slugify('  Shopify   Store — Setup  '), 'shopify-store-setup');
  assert.equal(slugify('Dubai, UAE'), 'dubai-uae');
  assert.equal(slugify(''), '');
});

test('escapeHtml neutralises markup', () => {
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.equal(escapeHtml('a & b "c"'), 'a &amp; b &quot;c&quot;');
});

test('parseJSON tolerates bad input', () => {
  assert.deepEqual(parseJSON('["a","b"]'), ['a', 'b']);
  assert.deepEqual(parseJSON('not json', []), []);
  assert.deepEqual(parseJSON(null, {}), {});
});

test('numberFmt groups thousands', () => {
  assert.equal(numberFmt(0), '0');
  assert.equal(numberFmt(1234), '1,234');
  assert.equal(numberFmt(145200), new Intl.NumberFormat('en-IN').format(145200));
});

test('truncate respects the length budget', () => {
  const out = truncate('a'.repeat(300), 60);
  assert.ok(out.length <= 60, 'result must fit the limit');
  assert.ok(out.endsWith('…'));
});

test('formatDate returns readable dates', () => {
  assert.match(formatDate('2026-02-14T10:00:00.000Z', 'short'), /Feb/);
  assert.match(formatDate('2026-02-14T10:00:00.000Z'), /2026/);
});

test('keywordList follows [service] + [role] + [location]', () => {
  const list = keywordList({
    service: 'Website Design',
    roles: ['Company', 'Agency'],
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    limit: 10
  });
  assert.ok(list.length > 0);
  assert.ok(list.length <= 10);
  assert.ok(list.some((k) => /^Website Design Company in New Delhi$/.test(k)));
  assert.ok(list.some((k) => /^Website Design Agency New Delhi$/.test(k)));
  assert.ok(list.some((k) => /India$/.test(k)));
  assert.equal(new Set(list).size, list.length, 'keywords must be unique');
});

test('keywordList accepts a comma separated role string', () => {
  const list = keywordList({ service: 'SEO', roles: 'Company, Supplier', city: 'Dubai', country: 'UAE' });
  assert.ok(list.includes('SEO Company in Dubai'));
});

test('metaTitle prefers the role form and appends the site name once', () => {
  const withRole = metaTitle({ service: 'Shopify Store Development', role: 'Company', city: 'New Delhi', siteName: 'Sama Solutions' });
  assert.match(withRole, /Shopify Store Development Company in New Delhi/);
  assert.match(withRole, /Sama Solutions/);

  const cityOnly = metaTitle({ service: 'Website Design', city: 'Delhi', siteName: 'Sama Solutions' });
  assert.match(cityOnly, /Website Design in Delhi/);
});

test('metaTitle never exceeds a sensible search-result width', () => {
  const title = metaTitle({
    service: 'Enterprise Ecommerce Development and Conversion Optimisation',
    role: 'Manufacturer',
    city: 'Thiruvananthapuram',
    state: 'Kerala',
    siteName: 'Sama Solutions'
  });
  assert.ok(title.length <= 70, `expected <=70 chars, got ${title.length}: ${title}`);
});
