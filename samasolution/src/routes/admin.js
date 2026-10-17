'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const { all, get, run } = require('../db');
const { getAll, setMany, setOne } = require('../lib/settings');
const {
  verifyPassword, hashPassword, createSession, setSessionCookie, clearSessionCookie,
  destroySession, requireAuth, checkCsrf, rateLimit
} = require('../lib/auth');
const { marketSummary, counts: contentCounts } = require('../lib/content');
const { keywordList } = require('../lib/seo');
const { parseJSON, slugify, formatDate, formatDateTime } = require('../lib/utils');
const { ICONS } = require('../icons');

const router = express.Router();

const UPLOADS = path.join(__dirname, '..', '..', 'public', 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase().slice(0, 6);
    cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG, WebP, GIF or SVG images are allowed.'), ok);
  }
});

function adminRender(res, view, data = {}) {
  return res.renderPage(view, { ...data, bodyClass: 'admin-body' }, 'admin/layout');
}

function noticeFrom(req) {
  if (req.query.saved) return { type: 'success', message: req.query.saved };
  if (req.query.error) return { type: 'error', message: req.query.error };
  if (req.query.deleted) return { type: 'success', message: 'Deleted.' };
  return null;
}

function pageParam(req) {
  const n = parseInt(req.query.page, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/* ── Auth ─────────────────────────────────────────────────────── */
router.get('/login', (req, res) => {
  if (req.admin) return res.redirect('/admin');
  res.renderPage('admin/login', {
    pageTitle: 'Sign in — Sama Admin',
    metaDescription: 'Admin sign in',
    noindex: true,
    bodyClass: 'admin-login-body',
    error: null,
    next: req.query.next || '/admin'
  }, 'admin/auth');
});

router.post('/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const nextUrl = String(req.body.next || '/admin');
  const safeNext = nextUrl.startsWith('/admin') ? nextUrl : '/admin';

  const gate = rateLimit(`login:${req.ip}:${email}`, 8, 15 * 60 * 1000);
  if (!gate.ok) {
    return res.status(429).renderPage('admin/login', {
      pageTitle: 'Sign in — Sama Admin', metaDescription: 'Admin sign in', noindex: true,
      bodyClass: 'admin-login-body', error: 'Too many attempts. Try again in 15 minutes.', next: safeNext
    }, 'admin/auth');
  }

  const user = get('SELECT * FROM users WHERE lower(email) = ?', email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).renderPage('admin/login', {
      pageTitle: 'Sign in — Sama Admin', metaDescription: 'Admin sign in', noindex: true,
      bodyClass: 'admin-login-body', error: 'Email or password is incorrect.', next: safeNext
    }, 'admin/auth');
  }

  const session = createSession(user.id);
  setSessionCookie(res, req, session.id, session.expires);
  res.redirect(safeNext);
});

router.post('/logout', (req, res) => {
  if (req.admin) destroySession(req);
  clearSessionCookie(res, req);
  res.redirect('/admin/login');
});

router.use(requireAuth);

router.use((req, res, next) => {
  res.locals.adminNewInquiries = get("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").n;
  next();
});

/* ── Dashboard ────────────────────────────────────────────────── */
router.get('/', (req, res) => {
  const total = get('SELECT COUNT(*) AS n FROM inquiries').n;
  const stats = {
    total,
    new: get("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").n,
    week: get("SELECT COUNT(*) AS n FROM inquiries WHERE created_at >= ?", new Date(Date.now() - 7 * 86400000).toISOString()).n,
    won: get("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'won'").n,
    quoted: get("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'quoted'").n,
    services: contentCounts().services,
    cities: contentCounts().services ? get('SELECT COUNT(*) AS n FROM cities WHERE active = 1').n : 0,
    posts: contentCounts().posts,
    pages: contentCounts().pages
  };
  stats.conversion = total ? Math.round((stats.won / total) * 100) : 0;

  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const row = get(
      'SELECT COUNT(*) AS n FROM inquiries WHERE created_at >= ? AND created_at < ?',
      start.toISOString(), end.toISOString()
    );
    days.push({ label: start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), n: row.n });
  }
  const peak = Math.max(1, ...days.map((d) => d.n));

  const recent = all('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 7');
  const topCities = all(
    "SELECT city, COUNT(*) AS n FROM inquiries WHERE city != '' GROUP BY city ORDER BY n DESC LIMIT 6"
  );
  const topServices = all(
    "SELECT service_name, COUNT(*) AS n FROM inquiries WHERE service_name != '' GROUP BY service_name ORDER BY n DESC LIMIT 6"
  );
  const market = marketSummary();

  adminRender(res, 'admin/dashboard', {
    pageTitle: 'Dashboard',
    metaDescription: 'Admin dashboard',
    noindex: true,
    active: 'dashboard',
    stats,
    days,
    peak,
    recent,
    topCities,
    topServices,
    market,
    notice: noticeFrom(req)
  });
});

/* ── Inquiries ────────────────────────────────────────────────── */
router.get('/inquiries', (req, res) => {
  const status = String(req.query.status || '').trim();
  const q = String(req.query.q || '').trim();
  const page = pageParam(req);
  const perPage = 15;

  const where = [];
  const params = [];
  if (status) { where.push('status = ?'); params.push(status); }
  if (q) {
    where.push('(name LIKE ? OR email LIKE ? OR company LIKE ? OR city LIKE ? OR message LIKE ?)');
    const like = `%${q}%`;
    params.push(like, like, like, like, like);
  }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const total = get(`SELECT COUNT(*) AS n FROM inquiries ${clause}`, ...params).n;
  const rows = all(
    `SELECT * FROM inquiries ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    ...params, perPage, (page - 1) * perPage
  );
  const statusCounts = all('SELECT status, COUNT(*) AS n FROM inquiries GROUP BY status');

  adminRender(res, 'admin/inquiries', {
    pageTitle: 'Inquiries',
    metaDescription: 'Manage inquiries',
    noindex: true,
    active: 'inquiries',
    rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
    status,
    q,
    statusCounts,
    notice: noticeFrom(req)
  });
});

router.get('/inquiries/export.csv', (req, res) => {
  const rows = all('SELECT * FROM inquiries ORDER BY created_at DESC');
  const header = ['ID', 'Created', 'Name', 'Email', 'Phone', 'Company', 'Service', 'Country', 'State', 'City', 'Budget', 'Status', 'Message', 'Source'];
  const esc = (v) => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
  const csv = [header.map(esc).join(',')]
    .concat(rows.map((r) => [
      r.id, r.created_at, r.name, r.email, r.phone, r.company, r.service_name,
      r.country, r.state, r.city, r.budget, r.status, r.message, r.source_path
    ].map(esc).join(',')))
    .join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sama-inquiries-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csv);
});

router.get('/inquiries/:id', (req, res, next) => {
  const inquiry = get('SELECT * FROM inquiries WHERE id = ?', req.params.id);
  if (!inquiry) return next();
  adminRender(res, 'admin/inquiry', {
    pageTitle: `Inquiry #${inquiry.id}`,
    metaDescription: 'Inquiry detail',
    noindex: true,
    active: 'inquiries',
    inquiry,
    notice: noticeFrom(req)
  });
});

router.post('/inquiries/:id', checkCsrf, (req, res) => {
  const inquiry = get('SELECT id FROM inquiries WHERE id = ?', req.params.id);
  if (!inquiry) return res.status(404).send('Not found');
  const status = String(req.body.status || 'new');
  const allowed = ['new', 'contacted', 'quoted', 'won', 'lost', 'spam'];
  run(
    'UPDATE inquiries SET status = ?, notes = ? WHERE id = ?',
    allowed.includes(status) ? status : 'new',
    String(req.body.notes || '').slice(0, 4000),
    inquiry.id
  );
  res.redirect(`/admin/inquiries/${inquiry.id}?saved=Inquiry updated.`);
});

router.post('/inquiries/:id/delete', checkCsrf, (req, res) => {
  run('DELETE FROM inquiries WHERE id = ?', req.params.id);
  res.redirect('/admin/inquiries?deleted=1');
});

/* ── Services ─────────────────────────────────────────────────── */
router.get('/services', (req, res) => {
  const rows = all(`SELECT s.*, c.name AS category_name, c.slug AS category_slug
                      FROM services s JOIN categories c ON c.id = s.category_id
                     ORDER BY c.sort, s.sort`);
  adminRender(res, 'admin/services', {
    pageTitle: 'Services',
    metaDescription: 'Manage services',
    noindex: true,
    active: 'services',
    rows,
    notice: noticeFrom(req)
  });
});

router.get('/services/new', (req, res) => {
  const categories = all('SELECT * FROM categories ORDER BY sort');
  adminRender(res, 'admin/service-form', {
    pageTitle: 'New service',
    metaDescription: 'Create a service',
    noindex: true,
    active: 'services',
    service: null,
    bodyText: '',
    deliverablesText: '',
    categories,
    iconKeys: Object.keys(ICONS),
    notice: null
  });
});

router.get('/services/:id', (req, res, next) => {
  const service = get('SELECT * FROM services WHERE id = ?', req.params.id);
  if (!service) return next();
  const categories = all('SELECT * FROM categories ORDER BY sort');
  adminRender(res, 'admin/service-form', {
    pageTitle: 'Edit service',
    metaDescription: 'Edit a service',
    noindex: true,
    active: 'services',
    service,
    bodyText: parseJSON(service.body, []).join('\n\n'),
    deliverablesText: parseJSON(service.deliverables, []).join('\n'),
    categories,
    iconKeys: Object.keys(ICONS),
    notice: noticeFrom(req)
  });
});

router.post('/services', checkCsrf, (req, res) => {
  const b = req.body;
  const id = b.id ? Number(b.id) : null;
  const name = String(b.name || '').trim();
  if (!name) return res.redirect('/admin/services?error=Name is required.');

  const slug = slugify(b.slug || name);
  const existing = get('SELECT id FROM services WHERE slug = ? AND id != ?', slug, id || 0);
  if (existing) return res.redirect(`/admin/services${id ? `/${id}` : '/new'}?error=That slug is already in use.`);

  const body = String(b.body || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const deliverables = String(b.deliverables || '')
    .split('\n')
    .map((d) => d.trim())
    .filter(Boolean);

  const values = [
    slug,
    Number(b.category_id) || 1,
    name,
    String(b.tagline || ''),
    String(b.summary || ''),
    JSON.stringify(body),
    JSON.stringify(deliverables),
    String(b.best_for || ''),
    String(b.timeline || ''),
    String(b.price_from || ''),
    String(b.icon || 'spark'),
    String(b.image || ''),
    b.featured ? 1 : 0,
    b.active ? 1 : 0,
    Number(b.sort) || 0,
    String(b.meta_title || ''),
    String(b.meta_description || ''),
    String(b.meta_keywords || ''),
    new Date().toISOString()
  ];

  if (id) {
    run(
      `UPDATE services SET slug=?, category_id=?, name=?, tagline=?, summary=?, body=?, deliverables=?,
        best_for=?, timeline=?, price_from=?, icon=?, image=?, featured=?, active=?, sort=?,
        meta_title=?, meta_description=?, meta_keywords=?, updated_at=? WHERE id=?`,
      ...values, id
    );
    setOne('content_version', String(Date.now()));
    return res.redirect(`/admin/services/${id}?saved=Service updated.`);
  }

  const info = run(
    `INSERT INTO services (slug, category_id, name, tagline, summary, body, deliverables, best_for, timeline,
       price_from, icon, image, featured, active, sort, meta_title, meta_description, meta_keywords, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...values
  );
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/services/${info.lastInsertRowid}?saved=Service created.`);
});

router.post('/services/:id/delete', checkCsrf, (req, res) => {
  run('DELETE FROM services WHERE id = ?', req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect('/admin/services?deleted=1');
});

/* ── Categories ───────────────────────────────────────────────── */
router.get('/categories', (req, res) => {
  const rows = all(`SELECT c.*, (SELECT COUNT(*) FROM services s WHERE s.category_id = c.id) AS service_count
                      FROM categories c ORDER BY c.sort`);
  adminRender(res, 'admin/categories', {
    pageTitle: 'Categories',
    metaDescription: 'Manage categories',
    noindex: true,
    active: 'services',
    rows,
    notice: noticeFrom(req)
  });
});

router.post('/categories', checkCsrf, (req, res) => {
  const b = req.body;
  const id = b.id ? Number(b.id) : null;
  const name = String(b.name || '').trim();
  if (!name) return res.redirect('/admin/categories?error=Name is required.');
  const slug = slugify(b.slug || name);

  const process = String(b.process || '')
    .split('\n')
    .map((line) => line.split('|'))
    .filter((parts) => parts.length >= 2)
    .map((parts) => ({ title: parts[0].trim(), text: parts.slice(1).join('|').trim() }));
  const faqs = String(b.faqs || '')
    .split('\n')
    .map((line) => line.split('|'))
    .filter((parts) => parts.length >= 2)
    .map((parts) => ({ q: parts[0].trim(), a: parts.slice(1).join('|').trim() }));

  if (id) {
    run(
      'UPDATE categories SET slug=?, name=?, short=?, blurb=?, lede=?, icon=?, image=?, process=?, faqs=?, sort=?, active=? WHERE id=?',
      slug, name, String(b.short || ''), String(b.blurb || ''), String(b.lede || ''),
      String(b.icon || 'spark'), String(b.image || ''), JSON.stringify(process), JSON.stringify(faqs),
      Number(b.sort) || 0, b.active ? 1 : 0, id
    );
    setOne('content_version', String(Date.now()));
    return res.redirect('/admin/categories?saved=Category updated.');
  }
  run(
    'INSERT INTO categories (slug, name, short, blurb, lede, icon, image, process, faqs, sort, active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    slug, name, String(b.short || ''), String(b.blurb || ''), String(b.lede || ''),
    String(b.icon || 'spark'), String(b.image || ''), JSON.stringify(process), JSON.stringify(faqs),
    Number(b.sort) || 0, b.active ? 1 : 0
  );
  setOne('content_version', String(Date.now()));
  res.redirect('/admin/categories?saved=Category created.');
});

router.post('/categories/:id/delete', checkCsrf, (req, res) => {
  const count = get('SELECT COUNT(*) AS n FROM services WHERE category_id = ?', req.params.id).n;
  if (count > 0) return res.redirect('/admin/categories?error=Move or delete the services in this category first.');
  run('DELETE FROM categories WHERE id = ?', req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect('/admin/categories?deleted=1');
});

/* ── Pages + home ─────────────────────────────────────────────── */
router.get('/pages', (req, res) => {
  const pages = all('SELECT * FROM pages ORDER BY id');
  adminRender(res, 'admin/pages', {
    pageTitle: 'Pages',
    metaDescription: 'Manage pages',
    noindex: true,
    active: 'pages',
    pages,
    notice: noticeFrom(req)
  });
});

router.get('/pages/home', (req, res) => {
  const site = getAll();
  adminRender(res, 'admin/home-form', {
    pageTitle: 'Home page',
    metaDescription: 'Edit home page',
    noindex: true,
    active: 'pages',
    site,
    stats: parseJSON(site.home_stats, []),
    notice: noticeFrom(req)
  });
});

router.post('/pages/home', checkCsrf, (req, res) => {
  const b = req.body;
  const stats = [];
  for (let i = 0; i < 4; i += 1) {
    const value = String(b[`stat_value_${i}`] || '').trim();
    const label = String(b[`stat_label_${i}`] || '').trim();
    const note = String(b[`stat_note_${i}`] || '').trim();
    if (value || label) stats.push({ value, label, note });
  }
  setMany({
    home_eyebrow: String(b.home_eyebrow || ''),
    home_title: String(b.home_title || ''),
    home_title_em: String(b.home_title_em || ''),
    home_lede: String(b.home_lede || ''),
    home_note: String(b.home_note || ''),
    home_manifesto: String(b.home_manifesto || ''),
    home_stats: JSON.stringify(stats),
    seo_default_title: String(b.seo_default_title || ''),
    seo_default_description: String(b.seo_default_description || ''),
    content_version: String(Date.now())
  });
  res.redirect('/admin/pages/home?saved=Home page updated.');
});

router.get('/pages/:slug', (req, res, next) => {
  const page = get('SELECT * FROM pages WHERE slug = ?', req.params.slug);
  if (!page) return next();
  adminRender(res, 'admin/page-form', {
    pageTitle: `Edit — ${page.title}`,
    metaDescription: 'Edit a page',
    noindex: true,
    active: 'pages',
    page,
    notice: noticeFrom(req)
  });
});

router.post('/pages/:slug', checkCsrf, (req, res) => {
  const b = req.body;
  run(
    'UPDATE pages SET title=?, h1=?, intro=?, body=?, meta_title=?, meta_description=?, meta_keywords=?, active=?, updated_at=? WHERE slug=?',
    String(b.title || ''), String(b.h1 || ''), String(b.intro || ''), String(b.body || ''),
    String(b.meta_title || ''), String(b.meta_description || ''), String(b.meta_keywords || ''),
    b.active ? 1 : 0, new Date().toISOString(), req.params.slug
  );
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/pages/${req.params.slug}?saved=Page updated.`);
});

/* ── Blog ─────────────────────────────────────────────────────── */
router.get('/blog', (req, res) => {
  const rows = all('SELECT * FROM posts ORDER BY published_at DESC');
  adminRender(res, 'admin/posts', {
    pageTitle: 'Insights',
    metaDescription: 'Manage blog posts',
    noindex: true,
    active: 'blog',
    rows,
    notice: noticeFrom(req)
  });
});

router.get('/blog/new', (req, res) => {
  adminRender(res, 'admin/post-form', {
    pageTitle: 'New article',
    metaDescription: 'Create an article',
    noindex: true,
    active: 'blog',
    post: null,
    notice: null
  });
});

router.get('/blog/:id', (req, res, next) => {
  const post = get('SELECT * FROM posts WHERE id = ?', req.params.id);
  if (!post) return next();
  adminRender(res, 'admin/post-form', {
    pageTitle: 'Edit article',
    metaDescription: 'Edit an article',
    noindex: true,
    active: 'blog',
    post,
    notice: noticeFrom(req)
  });
});

router.post('/blog', checkCsrf, (req, res) => {
  const b = req.body;
  const id = b.id ? Number(b.id) : null;
  const title = String(b.title || '').trim();
  if (!title) return res.redirect('/admin/blog?error=Title is required.');
  const slug = slugify(b.slug || title);
  const clash = get('SELECT id FROM posts WHERE slug = ? AND id != ?', slug, id || 0);
  if (clash) return res.redirect(`/admin/blog${id ? `/${id}` : '/new'}?error=Slug already used.`);

  const now = new Date().toISOString();
  const values = [
    slug, title, String(b.category || 'Strategy'), String(b.excerpt || ''), String(b.body || ''),
    String(b.cover || ''), String(b.author || 'Sama Studio'), String(b.status || 'published'),
    String(b.published_at || now.slice(0, 10)), Number(b.read_minutes) || 5, b.featured ? 1 : 0,
    String(b.meta_title || ''), String(b.meta_description || ''), String(b.meta_keywords || ''), now
  ];

  if (id) {
    run(
      `UPDATE posts SET slug=?, title=?, category=?, excerpt=?, body=?, cover=?, author=?, status=?,
        published_at=?, read_minutes=?, featured=?, meta_title=?, meta_description=?, meta_keywords=?, updated_at=?
       WHERE id=?`,
      ...values, id
    );
    setOne('content_version', String(Date.now()));
    return res.redirect(`/admin/blog/${id}?saved=Article updated.`);
  }

  const info = run(
    `INSERT INTO posts (slug, title, category, excerpt, body, cover, author, status, published_at,
       read_minutes, featured, meta_title, meta_description, meta_keywords, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ...values, now
  );
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/blog/${info.lastInsertRowid}?saved=Article created.`);
});

router.post('/blog/:id/delete', checkCsrf, (req, res) => {
  run('DELETE FROM posts WHERE id = ?', req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect('/admin/blog?deleted=1');
});

/* ── Locations ────────────────────────────────────────────────── */
router.get('/locations', (req, res) => {
  const countries = all(`SELECT c.*,
      (SELECT COUNT(*) FROM states s WHERE s.country_id = c.id) AS state_count,
      (SELECT COUNT(*) FROM cities ci JOIN states s2 ON s2.id = ci.state_id WHERE s2.country_id = c.id) AS city_count
    FROM countries c ORDER BY c.sort, c.name`);
  adminRender(res, 'admin/locations', {
    pageTitle: 'Locations',
    metaDescription: 'Manage market area',
    noindex: true,
    active: 'locations',
    countries,
    summary: marketSummary(),
    notice: noticeFrom(req)
  });
});

router.get('/locations/country/:id', (req, res, next) => {
  const country = get('SELECT * FROM countries WHERE id = ?', req.params.id);
  if (!country) return next();
  const states = all(
    `SELECT s.*, (SELECT COUNT(*) FROM cities c WHERE c.state_id = s.id) AS city_count
       FROM states s WHERE s.country_id = ? ORDER BY s.sort, s.name`,
    country.id
  );
  adminRender(res, 'admin/country-form', {
    pageTitle: `Edit — ${country.name}`,
    metaDescription: 'Edit country',
    noindex: true,
    active: 'locations',
    country,
    states,
    roles: parseJSON(country.roles, []),
    notice: noticeFrom(req)
  });
});

router.get('/locations/state/:id', (req, res, next) => {
  const state = get('SELECT * FROM states WHERE id = ?', req.params.id);
  if (!state) return next();
  const country = get('SELECT * FROM countries WHERE id = ?', state.country_id);
  const cities = all('SELECT * FROM cities WHERE state_id = ? ORDER BY featured DESC, sort, name', state.id);
  adminRender(res, 'admin/state-form', {
    pageTitle: `Edit — ${state.name}`,
    metaDescription: 'Edit state and cities',
    noindex: true,
    active: 'locations',
    state,
    country,
    cities,
    notice: noticeFrom(req)
  });
});

router.post('/locations/country', checkCsrf, (req, res) => {
  const b = req.body;
  const name = String(b.name || '').trim();
  if (!name) return res.redirect('/admin/locations?error=Country name is required.');
  const slug = slugify(b.slug || name);
  if (get('SELECT id FROM countries WHERE slug = ?', slug)) {
    return res.redirect('/admin/locations?error=That country already exists.');
  }
  run(
    `INSERT INTO countries (slug, name, label, code, currency, timezone, overlap, languages, kickoff, roles, intro, featured, active, sort)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
    slug, name, String(b.label || name), String(b.code || ''), String(b.currency || ''),
    String(b.timezone || ''), String(b.overlap || ''), String(b.languages || ''),
    String(b.kickoff || ''), JSON.stringify(String(b.roles || '').split(',').map((r) => r.trim()).filter(Boolean)),
    String(b.intro || ''), b.featured ? 1 : 0, Number(b.sort) || 0
  );
  setOne('content_version', String(Date.now()));
  res.redirect('/admin/locations?saved=Country added.');
});

router.post('/locations/country/:id', checkCsrf, (req, res) => {
  const b = req.body;
  run(
    `UPDATE countries SET name=?, label=?, code=?, currency=?, timezone=?, overlap=?, languages=?,
       kickoff=?, roles=?, intro=?, featured=?, active=?, sort=? WHERE id=?`,
    String(b.name || ''), String(b.label || ''), String(b.code || ''), String(b.currency || ''),
    String(b.timezone || ''), String(b.overlap || ''), String(b.languages || ''), String(b.kickoff || ''),
    JSON.stringify(String(b.roles || '').split(',').map((r) => r.trim()).filter(Boolean)),
    String(b.intro || ''), b.featured ? 1 : 0, b.active ? 1 : 0, Number(b.sort) || 0,
    req.params.id
  );
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/country/${req.params.id}?saved=Country updated.`);
});

router.post('/locations/country/:id/delete', checkCsrf, (req, res) => {
  run('DELETE FROM countries WHERE id = ?', req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect('/admin/locations?deleted=1');
});

router.post('/locations/state', checkCsrf, (req, res) => {
  const b = req.body;
  const countryId = Number(b.country_id);
  const name = String(b.name || '').trim();
  if (!countryId || !name) return res.redirect('/admin/locations?error=State name is required.');
  const slug = slugify(name);
  if (get('SELECT id FROM states WHERE country_id = ? AND slug = ?', countryId, slug)) {
    return res.redirect(`/admin/locations/country/${countryId}?error=That state already exists.`);
  }
  run('INSERT INTO states (country_id, slug, name, sort, active) VALUES (?, ?, ?, ?, 1)', countryId, slug, name, Number(b.sort) || 0);
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/country/${countryId}?saved=State added.`);
});

router.post('/locations/state/:id', checkCsrf, (req, res) => {
  const b = req.body;
  run('UPDATE states SET name=?, slug=?, active=? WHERE id=?',
    String(b.name || ''), slugify(b.slug || b.name || ''), b.active ? 1 : 0, req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/state/${req.params.id}?saved=State updated.`);
});

router.post('/locations/state/:id/delete', checkCsrf, (req, res) => {
  const state = get('SELECT country_id FROM states WHERE id = ?', req.params.id);
  run('DELETE FROM states WHERE id = ?', req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/country/${state ? state.country_id : ''}?deleted=1`);
});

router.post('/locations/city', checkCsrf, (req, res) => {
  const b = req.body;
  const stateId = Number(b.state_id);
  const name = String(b.name || '').trim();
  if (!stateId || !name) return res.redirect(`/admin/locations/state/${stateId}?error=City name is required.`);
  const slug = slugify(name);
  const exists = get('SELECT id FROM cities WHERE state_id = ? AND slug = ?', stateId, slug);
  if (exists) return res.redirect(`/admin/locations/state/${stateId}?error=That city already exists here.`);
  run(
    'INSERT INTO cities (state_id, slug, name, intro, featured, active, sort) VALUES (?, ?, ?, ?, ?, 1, ?)',
    stateId, slug, name, String(b.intro || ''), b.featured ? 1 : 0, Number(b.sort) || 0
  );
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/state/${stateId}?saved=City added.`);
});

router.post('/locations/cities/bulk', checkCsrf, (req, res) => {
  const stateId = Number(req.body.state_id);
  const raw = String(req.body.names || '');
  if (!stateId) return res.redirect('/admin/locations?error=Choose a state first.');
  const names = raw.split(/[\n,]/).map((n) => n.trim()).filter(Boolean);
  let added = 0;
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    if (get('SELECT id FROM cities WHERE state_id = ? AND slug = ?', stateId, slug)) continue;
    run('INSERT INTO cities (state_id, slug, name, intro, featured, active, sort) VALUES (?, ?, ?, ?, 0, 1, 0)',
      stateId, slug, name, '');
    added += 1;
  }
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/state/${stateId}?saved=${added} cities added.`);
});

router.post('/locations/city/:id', checkCsrf, (req, res) => {
  const city = get('SELECT * FROM cities WHERE id = ?', req.params.id);
  if (!city) return res.status(404).send('Not found');
  const b = req.body;
  run(
    'UPDATE cities SET name=?, slug=?, intro=?, featured=?, active=? WHERE id=?',
    String(b.name || city.name), slugify(b.slug || b.name || city.name),
    String(b.intro || ''), b.featured ? 1 : 0, b.active ? 1 : 0, city.id
  );
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/state/${city.state_id}?saved=City updated.`);
});

router.post('/locations/city/:id/delete', checkCsrf, (req, res) => {
  const city = get('SELECT state_id FROM cities WHERE id = ?', req.params.id);
  run('DELETE FROM cities WHERE id = ?', req.params.id);
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/locations/state/${city ? city.state_id : ''}?deleted=1`);
});

/* ── Media ────────────────────────────────────────────────────── */
router.get('/media', (req, res) => {
  const rows = all('SELECT * FROM media ORDER BY created_at DESC');
  const builtIn = [];
  const imgDir = path.join(__dirname, '..', '..', 'public', 'img');
  if (fs.existsSync(imgDir)) {
    for (const file of fs.readdirSync(imgDir)) {
      if (/\.(jpg|jpeg|png|webp|svg)$/i.test(file)) builtIn.push({ path: `/img/${file}`, name: file });
    }
  }
  adminRender(res, 'admin/media', {
    pageTitle: 'Media',
    metaDescription: 'Media library',
    noindex: true,
    active: 'media',
    rows,
    builtIn,
    notice: noticeFrom(req)
  });
});

router.post('/media', upload.single('file'), checkCsrf, (req, res) => {
  if (!req.file) return res.redirect('/admin/media?error=No file received.');
  run(
    'INSERT INTO media (filename, path, alt, mime, size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    req.file.filename, `/uploads/${req.file.filename}`, String(req.body.alt || ''),
    req.file.mimetype, req.file.size, new Date().toISOString()
  );
  res.redirect('/admin/media?saved=Image uploaded.');
});

router.post('/media/:id/delete', checkCsrf, (req, res) => {
  const row = get('SELECT * FROM media WHERE id = ?', req.params.id);
  if (row) {
    const file = path.join(UPLOADS, path.basename(row.filename));
    if (file.startsWith(UPLOADS) && fs.existsSync(file)) fs.unlinkSync(file);
    run('DELETE FROM media WHERE id = ?', row.id);
  }
  res.redirect('/admin/media?deleted=1');
});

/* ── SEO ──────────────────────────────────────────────────────── */
router.get('/seo', (req, res) => {
  const site = getAll();
  const market = marketSummary();
  const missingService = get("SELECT COUNT(*) AS n FROM services WHERE active = 1 AND meta_keywords = ''").n;
  const missingPost = get("SELECT COUNT(*) AS n FROM posts WHERE status = 'published' AND meta_keywords = ''").n;
  const totalMarket = market.pages + market.cities + market.states + market.countries;
  adminRender(res, 'admin/seo', {
    pageTitle: 'SEO',
    metaDescription: 'SEO settings',
    noindex: true,
    active: 'seo',
    site,
    market,
    missingService,
    missingPost,
    totalUrls: totalMarket + 52 + 8,
    notice: noticeFrom(req)
  });
});

router.post('/seo', checkCsrf, (req, res) => {
  const b = req.body;
  setMany({
    seo_default_title: String(b.seo_default_title || ''),
    seo_default_description: String(b.seo_default_description || ''),
    seo_default_keywords: String(b.seo_default_keywords || ''),
    keyword_roles: String(b.keyword_roles || ''),
    keyword_formula: String(b.keyword_formula || ''),
    content_version: String(Date.now())
  });
  res.redirect('/admin/seo?saved=SEO settings updated.');
});

router.post('/seo/generate', checkCsrf, (req, res) => {
  const roles = String(req.body.roles || 'Company, Agency, Service Provider')
    .split(',').map((r) => r.trim()).filter(Boolean);
  let updated = 0;

  for (const svc of all("SELECT id, name FROM services WHERE active = 1 AND meta_keywords = ''")) {
    const keywords = keywordList({ service: svc.name, roles, country: 'India' }).join(', ');
    run('UPDATE services SET meta_keywords = ? WHERE id = ?', keywords, svc.id);
    updated += 1;
  }
  for (const post of all("SELECT id, title, excerpt, category FROM posts WHERE status = 'published' AND meta_keywords = ''")) {
    const keywords = [post.category, post.title, 'Sama Solutions'].filter(Boolean).join(', ');
    run('UPDATE posts SET meta_keywords = ? WHERE id = ?', keywords, post.id);
    updated += 1;
  }
  setOne('content_version', String(Date.now()));
  res.redirect(`/admin/seo?saved=${updated} records updated with generated keywords.`);
});

/* ── Settings ─────────────────────────────────────────────────── */
router.get('/settings', (req, res) => {
  const site = getAll();
  adminRender(res, 'admin/settings', {
    pageTitle: 'Settings',
    metaDescription: 'Site settings',
    noindex: true,
    active: 'settings',
    site,
    notice: noticeFrom(req)
  });
});

router.post('/settings', checkCsrf, (req, res) => {
  const b = req.body;
  const socials = [];
  for (let i = 0; i < 4; i += 1) {
    const label = String(b[`social_label_${i}`] || '').trim();
    const url = String(b[`social_url_${i}`] || '').trim();
    if (label && url) socials.push({ label, url });
  }
  setMany({
    site_name: String(b.site_name || ''),
    site_tagline: String(b.site_tagline || ''),
    site_description: String(b.site_description || ''),
    site_url: String(b.site_url || '').replace(/\/+$/, ''),
    contact_email: String(b.contact_email || ''),
    contact_phone: String(b.contact_phone || ''),
    contact_phone_raw: String(b.contact_phone_raw || ''),
    whatsapp: String(b.whatsapp || ''),
    address: String(b.address || ''),
    contact_city: String(b.contact_city || ''),
    contact_country: String(b.contact_country || ''),
    hours: String(b.hours || ''),
    footer_note: String(b.footer_note || ''),
    analytics_id: String(b.analytics_id || ''),
    google_site_verification: String(b.google_site_verification || ''),
    social_links: JSON.stringify(socials),
    content_version: String(Date.now())
  });
  res.redirect('/admin/settings?saved=Settings updated.');
});

/* ── Account ──────────────────────────────────────────────────── */
router.get('/account', (req, res) => {
  const user = get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', req.admin.user_id);
  adminRender(res, 'admin/account', {
    pageTitle: 'Account',
    metaDescription: 'Account settings',
    noindex: true,
    active: 'account',
    user,
    notice: noticeFrom(req)
  });
});

router.post('/account', checkCsrf, (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!name || !email) return res.redirect('/admin/account?error=Name and email are required.');
  const clash = get('SELECT id FROM users WHERE lower(email) = ? AND id != ?', email, req.admin.user_id);
  if (clash) return res.redirect('/admin/account?error=That email is already in use.');
  run('UPDATE users SET name = ?, email = ? WHERE id = ?', name, email, req.admin.user_id);
  res.redirect('/admin/account?saved=Account updated.');
});

router.post('/account/password', checkCsrf, (req, res) => {
  const user = get('SELECT * FROM users WHERE id = ?', req.admin.user_id);
  const current = String(req.body.current || '');
  const next = String(req.body.password || '');
  if (!verifyPassword(current, user.password_hash)) {
    return res.redirect('/admin/account?error=Current password is incorrect.');
  }
  if (next.length < 8) return res.redirect('/admin/account?error=New password must be at least 8 characters.');
  if (next !== String(req.body.confirm || '')) return res.redirect('/admin/account?error=Passwords do not match.');
  run('UPDATE users SET password_hash = ? WHERE id = ?', hashPassword(next), user.id);
  res.redirect('/admin/account?saved=Password changed.');
});

module.exports = router;
