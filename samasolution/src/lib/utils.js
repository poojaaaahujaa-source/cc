'use strict';

const SITE_TZ = 'Asia/Kolkata';

function slugify(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripTags(str) {
  return String(str || '').replace(/<[^>]*>/g, ' ');
}

function truncate(str, len = 160) {
  const clean = String(str || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= len) return clean;
  const cut = clean.slice(0, len - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : len - 1).trim()}…`;
}

function formatDate(iso, style = 'long') {
  if (!iso) return '';
  const d = new Date(iso.length <= 10 ? `${iso}T12:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  const opts =
    style === 'short'
      ? { day: '2-digit', month: 'short', year: 'numeric', timeZone: SITE_TZ }
      : { day: 'numeric', month: 'long', year: 'numeric', timeZone: SITE_TZ };
  return new Intl.DateTimeFormat('en-IN', opts).format(d);
}

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: SITE_TZ, hour12: true
  }).format(d);
}

function timeAgo(iso) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(iso);
}

function isoDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function parseJSON(value, fallback) {
  if (Array.isArray(value) || (value && typeof value === 'object')) return value;
  try {
    const parsed = JSON.parse(value);
    return parsed == null ? fallback : parsed;
  } catch {
    return fallback;
  }
}

function toLines(value) {
  return String(value || '')
    .split('\n')
    .map((v) => v.trim())
    .filter(Boolean);
}

function numberFmt(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n) || 0);
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

module.exports = {
  slugify, escapeHtml, stripTags, truncate, formatDate, formatDateTime, timeAgo,
  isoDate, daysAgo, parseJSON, toLines, numberFmt, clamp, hashString, SITE_TZ
};
