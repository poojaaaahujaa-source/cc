'use strict';

const { all, get } = require('../db');
const { getAll } = require('./settings');
const { parseJSON } = require('./utils');

let store = { version: null, data: {} };

function version() {
  return getAll().content_version;
}

function memo(key, fn) {
  const v = version();
  if (store.version !== v) store = { version: v, data: {} };
  if (!(key in store.data)) store.data[key] = fn();
  return store.data[key];
}

function navCategories() {
  return memo('navCategories', () =>
    all('SELECT id, slug, name, short, icon, image, blurb FROM categories WHERE active = 1 ORDER BY sort, id')
      .map((cat) => ({
        ...cat,
        services: all(
          'SELECT slug, name, icon, tagline, featured FROM services WHERE category_id = ? AND active = 1 ORDER BY sort, id',
          cat.id
        )
      }))
  );
}

function allServices() {
  return memo('allServices', () =>
    all(`SELECT s.*, c.slug AS category_slug, c.name AS category_name
           FROM services s JOIN categories c ON c.id = s.category_id
          WHERE s.active = 1 ORDER BY c.sort, s.sort, s.id`)
  );
}

function servicesByCategory(slug) {
  return all(
    `SELECT s.* FROM services s JOIN categories c ON c.id = s.category_id
      WHERE c.slug = ? AND s.active = 1 ORDER BY s.sort, s.id`,
    slug
  );
}

function featuredServices(limit = 8) {
  return memo(`featuredServices:${limit}`, () =>
    all(`SELECT s.*, c.slug AS category_slug FROM services s JOIN categories c ON c.id = s.category_id
          WHERE s.active = 1 AND s.featured = 1 ORDER BY s.sort LIMIT ?`, limit)
  );
}

function serviceBySlug(slug) {
  return get(
    `SELECT s.*, c.slug AS category_slug, c.name AS category_name, c.blurb AS category_blurb
       FROM services s JOIN categories c ON c.id = s.category_id
      WHERE s.slug = ? AND s.active = 1`,
    slug
  );
}

function categoryBySlug(slug) {
  return get('SELECT * FROM categories WHERE slug = ? AND active = 1', slug);
}

function allCategories() {
  return memo('allCategories', () => all('SELECT * FROM categories WHERE active = 1 ORDER BY sort, id'));
}

function marketCountries() {
  return memo('marketCountries', () =>
    all(`SELECT co.*,
              (SELECT COUNT(*) FROM states s WHERE s.country_id = co.id AND s.active = 1) AS state_count,
              (SELECT COUNT(*) FROM cities ci JOIN states s2 ON s2.id = ci.state_id
                WHERE s2.country_id = co.id AND ci.active = 1) AS city_count
           FROM countries co WHERE co.active = 1 ORDER BY co.sort, co.id`)
      .map((c) => ({ ...c, roles: parseJSON(c.roles, []) }))
  );
}

function marketSummary() {
  return memo('marketSummary', () => {
    const countries = marketCountries();
    const countriesCount = countries.length;
    const statesCount = countries.reduce((n, c) => n + c.state_count, 0);
    const citiesCount = countries.reduce((n, c) => n + c.city_count, 0);
    const serviceCount = get('SELECT COUNT(*) AS n FROM services WHERE active = 1').n;
    return { countries: countriesCount, states: statesCount, cities: citiesCount, services: serviceCount, pages: citiesCount * serviceCount };
  });
}

function featuredCities(limit = 12) {
  return memo(`featuredCities:${limit}`, () =>
    all(`SELECT ci.id, ci.slug, ci.name, s.slug AS state_slug, s.name AS state_name,
                co.slug AS country_slug, co.name AS country_name, co.label AS country_label
           FROM cities ci
           JOIN states s ON s.id = ci.state_id
           JOIN countries co ON co.id = s.country_id
          WHERE ci.featured = 1 AND ci.active = 1 AND s.active = 1 AND co.active = 1
          ORDER BY co.sort, ci.sort LIMIT ?`, limit)
  );
}

function statesForCountry(countryId) {
  return all(
    `SELECT s.*, (SELECT COUNT(*) FROM cities c WHERE c.state_id = s.id AND c.active = 1) AS city_count
       FROM states s WHERE s.country_id = ? AND s.active = 1 ORDER BY s.sort, s.name`,
    countryId
  );
}

function citiesForState(stateId) {
  return all('SELECT * FROM cities WHERE state_id = ? AND active = 1 ORDER BY sort, name', stateId);
}

function latestPosts(limit = 3) {
  return all(
    "SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ?", limit
  );
}

function blogCategories() {
  return memo('blogCategories', () =>
    all("SELECT category, COUNT(*) AS n FROM posts WHERE status = 'published' GROUP BY category ORDER BY n DESC")
  );
}

function counts() {
  return memo('counts', () => ({
    services: get('SELECT COUNT(*) AS n FROM services WHERE active = 1').n,
    categories: get('SELECT COUNT(*) AS n FROM categories WHERE active = 1').n,
    posts: get("SELECT COUNT(*) AS n FROM posts WHERE status = 'published'").n,
    pages: get('SELECT COUNT(*) AS n FROM pages WHERE active = 1').n,
    inquiries: get('SELECT COUNT(*) AS n FROM inquiries').n,
    newInquiries: get("SELECT COUNT(*) AS n FROM inquiries WHERE status = 'new'").n
  }));
}

module.exports = {
  navCategories, allServices, servicesByCategory, featuredServices, serviceBySlug,
  categoryBySlug, allCategories, marketCountries, marketSummary, featuredCities,
  statesForCountry, citiesForState, latestPosts, blogCategories, counts
};
