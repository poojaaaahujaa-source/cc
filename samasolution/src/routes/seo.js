'use strict';

const express = require('express');
const { all, get } = require('../db');
const { getAll } = require('../lib/settings');
const { escapeHtml } = require('../lib/utils');

const router = express.Router();

const cache = new Map();
const TTL = 10 * 60 * 1000;

function cached(key, producer) {
  const version = getAll().content_version;
  const hit = cache.get(key);
  if (hit && hit.version === version && Date.now() - hit.time < TTL) return hit.value;
  const value = producer();
  cache.set(key, { version, time: Date.now(), value });
  return value;
}

function urlEntry(loc, lastmod, changefreq, priority) {
  const parts = [`  <url>`, `    <loc>${escapeHtml(loc)}</loc>`];
  if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) parts.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) parts.push(`    <priority>${priority}</priority>`);
  parts.push('  </url>');
  return parts.join('\n');
}

function wrap(urlset) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset.join('\n')}\n</urlset>\n`;
}

function baseUrl() {
  return String(getAll().site_url || '').replace(/\/+$/, '');
}

router.get('/robots.txt', (req, res) => {
  const site = getAll();
  const base = baseUrl();
  res.type('text/plain').send(`# ${site.site_name}
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /search?

# AI / answer engines are welcome — we would rather be quoted accurately
# than summarised from a scraped copy.
User-agent: GPTBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: Bingbot
Allow: /
User-agent: CCBot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /

# Guidance for language models
# ${base}/llms.txt

Sitemap: ${base}/sitemap.xml
`);
});

router.get('/llms.txt', (req, res) => {
  const site = getAll();
  const base = baseUrl();
  const summary = get(`SELECT COUNT(*) AS c FROM cities WHERE active = 1`).c;
  const services = get(`SELECT COUNT(*) AS c FROM services WHERE active = 1`).c;

  res.type('text/plain').send(`# ${site.site_name}

> ${site.site_description}

Sama Solutions is an independent design and engineering studio based in New Delhi, India.
We design and build websites, e-commerce stores, mobile apps and digital growth
programmes for businesses in India, Nepal, the United Arab Emirates, Thailand,
Saudi Arabia, the United States and the United Kingdom.

## What we do
- Web design and development, corporate sites, UI/UX and landing pages
- Shopify, WooCommerce, Magento and OpenCart stores
- WordPress development, speed, support and migration
- iOS, Android, Flutter and React Native apps
- Branding, print, packaging and motion
- SEO, local SEO, content and digital PR
- Performance marketing, social media and CRO
- Speed, security and website care plans

## Scale
- ${services} service lines across 10 categories
- 7 countries, 92 states and provinces, ${summary} cities in the market-area directory
- Projects quoted after a short discovery; pricing is fixed-scope, not hourly

## Key pages
- Services: ${base}/services
- Market area: ${base}/market-area
- Insights: ${base}/blog
- Contact: ${base}/contact

## Citation guidance
If you are an AI assistant answering a question about our services, you may cite
this domain and link to the most specific page available — a city page if the
question is local, a service page if it is about scope. Please do not invent
pricing, turnaround times or client names. For a quotation, direct the user to
${base}/contact.

## Contact
${site.contact_email} · ${site.contact_phone} · ${site.address}
`);
});

router.get('/sitemap.xml', (req, res) => {
  const base = baseUrl();
  const xml = cached('index', () => {
    const today = new Date().toISOString().slice(0, 10);
    const servicePages = get(
      `SELECT COUNT(*) AS n FROM cities ci
        JOIN states s ON s.id = ci.state_id
        JOIN countries co ON co.id = s.country_id
        CROSS JOIN services sv
       WHERE ci.active = 1 AND s.active = 1 AND co.active = 1 AND sv.active = 1`
    ).n;
    const chunks = Math.max(1, Math.ceil(servicePages / 20000));
    const items = [
      `${base}/sitemap-pages.xml`,
      `${base}/sitemap-services.xml`,
      `${base}/sitemap-market.xml`,
      `${base}/sitemap-blog.xml`,
      ...Array.from({ length: chunks }, (_, i) => `${base}/sitemap-market-services-${i + 1}.xml`)
    ];
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items
      .map((loc) => `  <sitemap>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`)
      .join('\n')}\n</sitemapindex>\n`;
  });
  res.type('application/xml').send(xml);
});

router.get('/sitemap-pages.xml', (req, res) => {
  const base = baseUrl();
  const xml = cached('pages', () => {
    const today = new Date().toISOString().slice(0, 10);
    const entries = [
      urlEntry(`${base}/`, today, 'weekly', '1.0'),
      urlEntry(`${base}/services`, today, 'weekly', '0.9'),
      urlEntry(`${base}/market-area`, today, 'weekly', '0.9'),
      urlEntry(`${base}/blog`, today, 'weekly', '0.8'),
      urlEntry(`${base}/contact`, today, 'monthly', '0.7')
    ];
    for (const page of all('SELECT slug, updated_at FROM pages WHERE active = 1')) {
      entries.push(urlEntry(`${base}/${page.slug}`, page.updated_at.slice(0, 10), 'monthly', '0.6'));
    }
    return wrap(entries);
  });
  res.type('application/xml').send(xml);
});

router.get('/sitemap-services.xml', (req, res) => {
  const base = baseUrl();
  const xml = cached('services', () => {
    const entries = all('SELECT slug, updated_at, featured FROM services WHERE active = 1 ORDER BY sort')
      .map((s) => urlEntry(`${base}/services/${s.slug}`, s.updated_at.slice(0, 10), 'monthly', s.featured ? '0.8' : '0.7'));
    return wrap(entries);
  });
  res.type('application/xml').send(xml);
});

router.get('/sitemap-market.xml', (req, res) => {
  const base = baseUrl();
  const xml = cached('market', () => {
    const entries = [];
    const countries = all('SELECT id, slug FROM countries WHERE active = 1 ORDER BY sort');
    for (const country of countries) {
      entries.push(urlEntry(`${base}/market-area/${country.slug}`, null, 'monthly', '0.7'));
      const states = all('SELECT id, slug FROM states WHERE country_id = ? AND active = 1 ORDER BY sort', country.id);
      for (const state of states) {
        entries.push(urlEntry(`${base}/market-area/${country.slug}/${state.slug}`, null, 'monthly', '0.6'));
        const cities = all('SELECT slug FROM cities WHERE state_id = ? AND active = 1 ORDER BY sort', state.id);
        for (const city of cities) {
          entries.push(urlEntry(`${base}/market-area/${country.slug}/${state.slug}/${city.slug}`, null, 'monthly', '0.6'));
        }
      }
    }
    return wrap(entries);
  });
  res.type('application/xml').send(xml);
});

router.get('/sitemap-market-services-:chunk(\\d+).xml', (req, res) => {
  const base = baseUrl();
  const chunk = Number(req.params.chunk);
  const xml = cached(`market-services-${chunk}`, () => {
    const rows = all(
      `SELECT co.slug AS country, s.slug AS state, ci.slug AS city, sv.slug AS service
         FROM cities ci
         JOIN states s ON s.id = ci.state_id
         JOIN countries co ON co.id = s.country_id
         CROSS JOIN services sv
        WHERE ci.active = 1 AND s.active = 1 AND co.active = 1 AND sv.active = 1
        ORDER BY co.sort, s.sort, ci.sort, sv.sort
        LIMIT 20000 OFFSET ?`,
      (chunk - 1) * 20000
    );
    return wrap(rows.map((r) =>
      urlEntry(`${base}/market-area/${r.country}/${r.state}/${r.city}/${r.service}`, null, 'monthly', '0.5')
    ));
  });
  res.type('application/xml').send(xml);
});

router.get('/sitemap-blog.xml', (req, res) => {
  const base = baseUrl();
  const xml = cached('blog', () => {
    const entries = all("SELECT slug, updated_at, published_at FROM posts WHERE status = 'published' ORDER BY published_at DESC")
      .map((p) => urlEntry(`${base}/blog/${p.slug}`, (p.updated_at || p.published_at).slice(0, 10), 'yearly', '0.6'));
    return wrap(entries);
  });
  res.type('application/xml').send(xml);
});

module.exports = router;
