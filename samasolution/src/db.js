'use strict';

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = process.env.DB_FILE || path.join(DATA_DIR, 'site.db');
const db = new DatabaseSync(DB_FILE);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  PRAGMA busy_timeout = 5000;
`);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'admin',
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  csrf       TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  slug    TEXT NOT NULL UNIQUE,
  name    TEXT NOT NULL,
  short   TEXT NOT NULL DEFAULT '',
  blurb   TEXT NOT NULL DEFAULT '',
  lede    TEXT NOT NULL DEFAULT '',
  icon    TEXT NOT NULL DEFAULT 'spark',
  image   TEXT NOT NULL DEFAULT '',
  process TEXT NOT NULL DEFAULT '[]',
  faqs    TEXT NOT NULL DEFAULT '[]',
  sort    INTEGER NOT NULL DEFAULT 0,
  active  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS services (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE,
  category_id      INTEGER NOT NULL,
  name             TEXT NOT NULL,
  tagline          TEXT NOT NULL DEFAULT '',
  summary          TEXT NOT NULL DEFAULT '',
  body             TEXT NOT NULL DEFAULT '[]',
  deliverables     TEXT NOT NULL DEFAULT '[]',
  best_for         TEXT NOT NULL DEFAULT '',
  timeline         TEXT NOT NULL DEFAULT '',
  price_from       TEXT NOT NULL DEFAULT '',
  icon             TEXT NOT NULL DEFAULT 'spark',
  image            TEXT NOT NULL DEFAULT '',
  featured         INTEGER NOT NULL DEFAULT 0,
  active           INTEGER NOT NULL DEFAULT 1,
  sort             INTEGER NOT NULL DEFAULT 0,
  meta_title       TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords    TEXT NOT NULL DEFAULT '',
  updated_at       TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS countries (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  slug      TEXT NOT NULL UNIQUE,
  name      TEXT NOT NULL,
  label     TEXT NOT NULL DEFAULT '',
  code      TEXT NOT NULL DEFAULT '',
  currency  TEXT NOT NULL DEFAULT '',
  timezone  TEXT NOT NULL DEFAULT '',
  overlap   TEXT NOT NULL DEFAULT '',
  languages TEXT NOT NULL DEFAULT '',
  kickoff   TEXT NOT NULL DEFAULT '',
  roles     TEXT NOT NULL DEFAULT '[]',
  intro     TEXT NOT NULL DEFAULT '',
  featured  INTEGER NOT NULL DEFAULT 0,
  active    INTEGER NOT NULL DEFAULT 1,
  sort      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS states (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  country_id INTEGER NOT NULL,
  slug       TEXT NOT NULL,
  name       TEXT NOT NULL,
  sort       INTEGER NOT NULL DEFAULT 0,
  active     INTEGER NOT NULL DEFAULT 1,
  UNIQUE (country_id, slug),
  FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cities (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  state_id INTEGER NOT NULL,
  slug     TEXT NOT NULL,
  name     TEXT NOT NULL,
  intro    TEXT NOT NULL DEFAULT '',
  featured INTEGER NOT NULL DEFAULT 0,
  active   INTEGER NOT NULL DEFAULT 1,
  sort     INTEGER NOT NULL DEFAULT 0,
  UNIQUE (state_id, slug),
  FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pages (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  h1               TEXT NOT NULL DEFAULT '',
  intro            TEXT NOT NULL DEFAULT '',
  body             TEXT NOT NULL DEFAULT '',
  meta_title       TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords    TEXT NOT NULL DEFAULT '',
  active           INTEGER NOT NULL DEFAULT 1,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  category         TEXT NOT NULL DEFAULT 'Strategy',
  excerpt          TEXT NOT NULL DEFAULT '',
  body             TEXT NOT NULL DEFAULT '',
  cover            TEXT NOT NULL DEFAULT '',
  author           TEXT NOT NULL DEFAULT 'Sama Studio',
  status           TEXT NOT NULL DEFAULT 'published',
  published_at     TEXT NOT NULL,
  read_minutes     INTEGER NOT NULL DEFAULT 5,
  featured         INTEGER NOT NULL DEFAULT 0,
  meta_title       TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  meta_keywords    TEXT NOT NULL DEFAULT '',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiries (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL DEFAULT '',
  company      TEXT NOT NULL DEFAULT '',
  service_id   INTEGER,
  service_name TEXT NOT NULL DEFAULT '',
  country      TEXT NOT NULL DEFAULT '',
  state        TEXT NOT NULL DEFAULT '',
  city         TEXT NOT NULL DEFAULT '',
  budget       TEXT NOT NULL DEFAULT '',
  message      TEXT NOT NULL DEFAULT '',
  source_path  TEXT NOT NULL DEFAULT '',
  status       TEXT NOT NULL DEFAULT 'new',
  notes        TEXT NOT NULL DEFAULT '',
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  filename   TEXT NOT NULL,
  path       TEXT NOT NULL,
  alt        TEXT NOT NULL DEFAULT '',
  mime       TEXT NOT NULL DEFAULT '',
  size       INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS work (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  kind         TEXT NOT NULL DEFAULT 'project',
  title        TEXT NOT NULL DEFAULT '',
  sector       TEXT NOT NULL DEFAULT '',
  image        TEXT NOT NULL DEFAULT '',
  scope        TEXT NOT NULL DEFAULT '',
  metric       TEXT NOT NULL DEFAULT '',
  metric_label TEXT NOT NULL DEFAULT '',
  year         TEXT NOT NULL DEFAULT '',
  quote        TEXT NOT NULL DEFAULT '',
  name         TEXT NOT NULL DEFAULT '',
  detail       TEXT NOT NULL DEFAULT '',
  sort         INTEGER NOT NULL DEFAULT 0,
  active       INTEGER NOT NULL DEFAULT 1,
  updated_at   TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_work_kind ON work(kind, sort);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);
CREATE INDEX IF NOT EXISTS idx_states_country ON states(country_id);
CREATE INDEX IF NOT EXISTS idx_cities_state ON cities(state_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_expiry ON sessions(expires_at);
`;

db.exec(SCHEMA);

function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}
function get(sql, ...params) {
  return db.prepare(sql).get(...params);
}
function run(sql, ...params) {
  return db.prepare(sql).run(...params);
}
function tx(fn) {
  db.exec('BEGIN');
  try {
    const out = fn();
    db.exec('COMMIT');
    return out;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

module.exports = { db, all, get, run, tx, DB_FILE };
