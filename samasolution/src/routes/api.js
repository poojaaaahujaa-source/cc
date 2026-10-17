'use strict';

const express = require('express');
const { all, get, run } = require('../db');
const { rateLimit } = require('../lib/auth');
const { getAll } = require('../lib/settings');
const { escapeHtml } = require('../lib/utils');

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

router.post('/inquiries', (req, res) => {
  const wantsJson = req.is('application/json') || String(req.get('accept') || '').includes('application/json');
  const body = req.body || {};

  // Honeypot: real users never fill this hidden field.
  if (String(body.website || '').trim()) {
    if (wantsJson) return res.json({ ok: true });
    return res.redirect('/contact?sent=1');
  }

  const limiter = rateLimit(`inquiry:${req.ip}`, 6, 60 * 60 * 1000);
  if (!limiter.ok) {
    const message = 'Too many enquiries from this connection. Please email us directly.';
    if (wantsJson) return res.status(429).json({ ok: false, error: message });
    return res.status(429).send(escapeHtml(message));
  }

  const name = String(body.name || '').trim().slice(0, 120);
  const email = String(body.email || '').trim().slice(0, 160);
  const phone = String(body.phone || '').trim().slice(0, 40);
  const company = String(body.company || '').trim().slice(0, 160);
  const budget = String(body.budget || '').trim().slice(0, 80);
  const message = String(body.message || '').trim().slice(0, 4000);
  const serviceSlug = String(body.service || '').trim().slice(0, 120);
  const country = String(body.country || '').trim().slice(0, 80);
  const state = String(body.state || '').trim().slice(0, 80);
  const city = String(body.city || '').trim().slice(0, 80);

  const errors = [];
  if (name.length < 2) errors.push('Please enter your name.');
  if (!EMAIL_RE.test(email)) errors.push('Please enter a valid email address.');
  if (message.length < 10) errors.push('Please tell us a little about the project.');
  if (phone && phone.replace(/[^\d]/g, '').length < 7) errors.push('Please check the phone number.');

  if (errors.length) {
    if (wantsJson) return res.status(422).json({ ok: false, error: errors[0], errors });
    return res.status(422).send(escapeHtml(errors.join(' ')));
  }

  const service = serviceSlug ? get('SELECT id, name FROM services WHERE slug = ?', serviceSlug) : null;
  const sourcePath = String(body.source || req.get('referer') || '/contact').replace(/^https?:\/\/[^/]+/, '').slice(0, 240);

  run(
    `INSERT INTO inquiries
      (name, email, phone, company, service_id, service_name, country, state, city, budget, message,
       source_path, status, notes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', ?)`,
    name, email, phone, company,
    service ? service.id : null, service ? service.name : '',
    country, state, city, budget, message, sourcePath, new Date().toISOString()
  );

  if (wantsJson) return res.json({ ok: true, message: 'Thank you — we will reply within one working day.' });
  return res.redirect('/contact?sent=1');
});

router.get('/market-search', (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ results: [] });

  const results = all(
    `SELECT ci.slug AS city_slug, ci.name AS city,
            s.slug AS state_slug, s.name AS state,
            co.slug AS country_slug, co.name AS country, co.label AS country_label
       FROM cities ci
       JOIN states s ON s.id = ci.state_id
       JOIN countries co ON co.id = s.country_id
      WHERE ci.active = 1 AND s.active = 1 AND co.active = 1
        AND (ci.name LIKE ? OR s.name LIKE ? OR co.name LIKE ?)
      ORDER BY ci.featured DESC, co.sort, ci.name
      LIMIT 12`,
    `%${q}%`, `%${q}%`, `%${q}%`
  );

  res.json({
    results: results.map((r) => ({
      city: r.city,
      state: r.state,
      country: r.country_label || r.country,
      url: `/market-area/${r.country_slug}/${r.state_slug}/${r.city_slug}`
    }))
  });
});

router.get('/health', (req, res) => {
  const site = getAll();
  res.json({ ok: true, site: site.site_name, time: new Date().toISOString() });
});

module.exports = router;
