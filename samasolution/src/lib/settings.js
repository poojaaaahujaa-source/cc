'use strict';

const { all, get, run } = require('../db');
const { parseJSON } = require('./utils');

const DEFAULTS = {
  site_name: 'Sama Solutions',
  site_tagline: 'Design & engineering studio',
  site_description:
    'Sama Solutions is a Delhi-based design and engineering studio building websites, e-commerce, apps and growth programmes for clients across India and six international markets.',
  site_url: 'https://www.samasolution.in',
  contact_email: 'info@samasolution.in',
  contact_phone: '+91 93114 93072',
  contact_phone_raw: '+919311493072',
  whatsapp: '919311493072',
  address: 'New Delhi, India',
  contact_city: 'New Delhi',
  contact_country: 'IN',
  hours: 'Mon–Sat · 10:00–19:00 IST',
  social_links: JSON.stringify([
    { label: 'Instagram', url: 'https://www.instagram.com/samasolutionpl/' },
    { label: 'Facebook', url: 'https://www.facebook.com/samasolution' },
    { label: 'X / Twitter', url: 'https://twitter.com/samasolution' }
  ]),
  home_eyebrow: 'Independent digital studio · Delhi → Worldwide',
  home_title: 'We build websites',
  home_title_em: 'that earn their keep.',
  home_lede:
    'Sama Solutions is a design and engineering studio for businesses that have outgrown a template. Strategy, design, build and growth — under one roof, with no handoff gaps.',
  home_note: 'Seven countries. Forty-four service lines. One standard.',
  home_manifesto:
    'We are not the biggest agency you will meet. We are the one that answers the phone, writes the copy, ships the build and tells you the truth about what is working.',
  home_stats: JSON.stringify([
    { value: '12+', label: 'Years in practice', note: 'Designing and building since 2013' },
    { value: '340+', label: 'Projects shipped', note: 'Websites, stores, apps and campaigns' },
    { value: '7', label: 'Markets served', note: 'India, Nepal, UAE, Thailand, Saudi Arabia, USA, UK' },
    { value: '94%', label: 'Client retention', note: 'Clients still with us after year one' }
  ]),
  footer_note: 'Built in Delhi. Working worldwide.',
  seo_default_title: 'Sama Solutions — Web Design, E-Commerce & Digital Growth',
  seo_default_description:
    'Sama Solutions designs and builds websites, e-commerce stores and digital growth programmes for businesses in India, Nepal, UAE, Thailand, Saudi Arabia, the USA and the UK.',
  seo_default_keywords:
    'web design company Delhi, website development India, Shopify development, SEO services, digital marketing agency Delhi',
  keyword_roles: 'Company, Agency, Service Provider, Supplier, Manufacturer, Importer, Exporter, Distributor',
  keyword_formula: '[Service] + [Role] + [Location]',
  analytics_id: '',
  google_site_verification: '',
  content_version: '1'
};

let cache = null;
let cacheVersion = null;

function rawAll() {
  const rows = all('SELECT key, value FROM settings');
  const map = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

function getAll() {
  const current = get('SELECT value FROM settings WHERE key = ?', 'content_version');
  const version = current ? current.value : null;
  if (cache && cacheVersion === version) return cache;

  const stored = rawAll();
  const merged = { ...DEFAULTS, ...stored };
  merged.social_links = parseJSON(merged.social_links, []);
  merged.home_stats = parseJSON(merged.home_stats, []);
  cache = merged;
  cacheVersion = version;
  return merged;
}

function getOne(key, fallback = '') {
  const row = get('SELECT value FROM settings WHERE key = ?', key);
  return row ? row.value : (DEFAULTS[key] ?? fallback);
}

function setOne(key, value) {
  run(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key, String(value == null ? '' : value)
  );
  cache = null;
}

function setMany(obj) {
  for (const [key, value] of Object.entries(obj)) setOne(key, value);
  bump();
}

function bump() {
  const row = get('SELECT value FROM settings WHERE key = ?', 'content_version');
  const next = String((parseInt(row ? row.value : '0', 10) || 0) + 1);
  run('UPDATE settings SET value = ? WHERE key = ?', next, 'content_version');
  cache = null;
}

function defaults() {
  return { ...DEFAULTS };
}

module.exports = { DEFAULTS, getAll, getOne, setOne, setMany, bump, defaults };
