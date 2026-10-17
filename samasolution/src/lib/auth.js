'use strict';

const crypto = require('crypto');
const { get, run } = require('../db');

const COOKIE = 'sama_sid';
const SESSION_DAYS = 7;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
  const parts = String(stored || '').split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hash] = parts;
  const expected = Buffer.from(hash, 'hex');
  const actual = crypto.scryptSync(String(password), salt, 64);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function parseCookies(header = '') {
  const out = {};
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

function createSession(userId) {
  const id = crypto.randomBytes(32).toString('hex');
  const csrf = crypto.randomBytes(24).toString('hex');
  const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  run('DELETE FROM sessions WHERE expires_at < ?', Date.now());
  run(
    'INSERT INTO sessions (id, user_id, csrf, expires_at, created_at) VALUES (?, ?, ?, ?, ?)',
    id, userId, csrf, expires, new Date().toISOString()
  );
  return { id, csrf, expires };
}

function getSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  const sid = cookies[COOKIE];
  if (!sid) return null;
  const row = get(
    `SELECT s.id, s.csrf, s.expires_at, u.id AS user_id, u.name, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = ? AND s.expires_at > ?`,
    sid, Date.now()
  );
  if (!row) return null;
  return row;
}

function destroySession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  if (cookies[COOKIE]) run('DELETE FROM sessions WHERE id = ?', cookies[COOKIE]);
}

function setSessionCookie(res, req, id, expires) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const maxAge = Math.floor((expires - Date.now()) / 1000);
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure ? '; Secure' : ''}`
  );
}

function clearSessionCookie(res, req) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`);
}

function loadAdmin(req, res, next) {
  const session = getSession(req);
  req.admin = session || null;
  req.csrfToken = session ? session.csrf : null;
  res.locals.admin = req.admin;
  res.locals.csrfToken = req.csrfToken;
  next();
}

function requireAuth(req, res, next) {
  if (!req.admin) {
    const next_ = encodeURIComponent(req.originalUrl || '/admin');
    return res.redirect(`/admin/login?next=${next_}`);
  }
  next();
}

function checkCsrf(req, res, next) {
  if (!req.admin) return res.status(401).json({ ok: false, error: 'Session expired. Please sign in again.' });
  const token = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  if (!token || token !== req.admin.csrf) {
    return res.status(403).send('Invalid security token. Refresh the page and try again.');
  }
  next();
}

/** Simple in-memory rate limiter: key → { count, reset } */
const buckets = new Map();
function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  entry.count += 1;
  if (entry.count > limit) return { ok: false, remaining: 0 };
  return { ok: true, remaining: limit - entry.count };
}

module.exports = {
  hashPassword, verifyPassword, parseCookies, createSession, getSession,
  destroySession, setSessionCookie, clearSessionCookie, loadAdmin, requireAuth,
  checkCsrf, rateLimit, COOKIE
};
