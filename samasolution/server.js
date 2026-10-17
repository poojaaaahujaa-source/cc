'use strict';

const path = require('path');
const crypto = require('crypto');
const express = require('express');

const { ensureSeed } = require('./src/seed');
const { getAll } = require('./src/lib/settings');
const { loadAdmin } = require('./src/lib/auth');
const { navCategories, marketCountries } = require('./src/lib/content');
const { icon } = require('./src/icons');
const { formatDate, formatDateTime, timeAgo, truncate, numberFmt, slugify } = require('./src/lib/utils');

ensureSeed();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const VIEWS = path.join(__dirname, 'views');
const PUBLIC = path.join(__dirname, 'public');

app.set('trust proxy', true);
app.set('view engine', 'ejs');
app.set('views', VIEWS);
app.set('x-powered-by', false);
app.set('etag', 'strong');

app.use((req, res, next) => {
  const nonce = crypto.randomBytes(18).toString('base64');
  res.locals.nonce = nonce;
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      `script-src 'self' 'nonce-${nonce}'`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'"
    ].join('; ')
  );
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

app.use(
  express.static(PUBLIC, {
    maxAge: '7d',
    setHeaders(res, filePath) {
      if (/\.(woff2|jpg|jpeg|png|svg|webp|ico)$/i.test(filePath)) {
        res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
      }
    }
  })
);

app.use(express.urlencoded({ extended: false, limit: '300kb' }));
app.use(express.json({ limit: '120kb' }));
app.use(loadAdmin);

app.use((req, res, next) => {
  const site = getAll();
  const base = String(site.site_url || '').replace(/\/+$/, '');
  res.locals.site = site;
  res.locals.currentPath = req.path.replace(/\/+$/, '') || '/';
  res.locals.year = new Date().getFullYear();
  res.locals.abs = (p = '') => `${base}${p}`;
  res.locals.canonical = `${base}${req.path.replace(/\/+$/, '') || '/'}`;
  res.locals.helpers = { formatDate, formatDateTime, timeAgo, truncate, numberFmt, slugify };
  res.locals.icon = icon;
  res.locals.admin = req.admin;
  res.locals.csrfToken = req.csrfToken;
  res.locals.flash = null;
  res.locals.query = req.query || {};
  res.locals.bodyClass = '';
  res.locals.navCategories = navCategories();
  res.locals.marketCountriesForFooter = marketCountries();
  next();
});

/** Render a view inside a layout. */
app.use((req, res, next) => {
  res.renderPage = (view, data = {}, layout = 'site/layout') => {
    const locals = { ...res.locals, ...data };
    return res.render(view, locals, (err, body) => {
      if (err) return next(err);
      return res.render(layout, { ...locals, body }, (err2, html) => {
        if (err2) return next(err2);
        return res.send(html);
      });
    });
  };
  next();
});

app.use('/', require('./src/routes/seo'));
app.use('/', require('./src/routes/site'));
app.use('/api', require('./src/routes/api'));
app.use('/admin', require('./src/routes/admin'));

app.use((req, res) => {
  res.status(404);
  res.renderPage('site/404', {
    pageTitle: 'Page not found',
    metaDescription: 'The page you were looking for does not exist.',
    noindex: true
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(500);
  res.renderPage('site/500', {
    pageTitle: 'Something went wrong',
    metaDescription: 'A temporary error occurred.',
    noindex: true,
    error: process.env.NODE_ENV === 'production' ? null : err
  });
});

if (require.main === module) {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sama Solutions running on http://0.0.0.0:${PORT}`);
  });
  process.on('SIGTERM', () => server.close(() => process.exit(0)));
  process.on('SIGINT', () => server.close(() => process.exit(0)));
}

module.exports = app;
