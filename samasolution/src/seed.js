'use strict';

const { db, all, get, run, tx } = require('./db');
const { DEFAULTS } = require('./lib/settings');
const { hashPassword } = require('./lib/auth');
const { slugify } = require('./lib/utils');
const { categories, services } = require('./data/services');
const { countries, featuredCities } = require('./data/locations');
const { posts } = require('./data/posts');
const { pages } = require('./data/pages');

const TABLES = [
  'sessions', 'inquiries', 'media', 'cities', 'states', 'countries',
  'services', 'categories', 'posts', 'pages', 'users', 'settings'
];

function wipe() {
  db.exec('PRAGMA foreign_keys = OFF');
  for (const table of TABLES) db.exec(`DELETE FROM ${table}`);
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('" + TABLES.join("','") + "')");
  db.exec('PRAGMA foreign_keys = ON');
}

function insertSettings() {
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(DEFAULTS)) {
    if (key === 'content_version') {
      run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, now);
    } else {
      run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, value);
    }
  }
}

function insertAdmin() {
  run(
    'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)',
    'Sama Admin',
    'admin@samasolution.in',
    hashPassword('Sama@2026'),
    'owner',
    new Date().toISOString()
  );
}

function insertCatalog() {
  const categoryIds = new Map();
  categories.forEach((cat, index) => {
    const info = run(
      `INSERT INTO categories (slug, name, short, blurb, lede, icon, image, process, faqs, sort, active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      cat.slug, cat.name, cat.short, cat.blurb, cat.lede, cat.icon, cat.image,
      JSON.stringify(cat.process), JSON.stringify(cat.faqs), index
    );
    categoryIds.set(cat.slug, Number(info.lastInsertRowid));
  });

  const now = new Date().toISOString();
  services.forEach((svc, index) => {
    const cat = categories.find((c) => c.slug === svc.category);
    run(
      `INSERT INTO services
        (slug, category_id, name, tagline, summary, body, deliverables, best_for, timeline,
         price_from, icon, image, featured, active, sort, meta_title, meta_description, meta_keywords, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, '', '', '', ?)`,
      svc.slug, categoryIds.get(svc.category), svc.name, svc.tagline, svc.summary,
      JSON.stringify(svc.body), JSON.stringify(svc.deliverables), svc.bestFor, svc.timeline,
      svc.priceFrom, svc.icon, cat ? cat.image : '', svc.featured ? 1 : 0, index, now
    );
  });
}

function insertLocations() {
  const featured = new Set(featuredCities);
  countries.forEach((country, cIndex) => {
    const info = run(
      `INSERT INTO countries
        (slug, name, label, code, currency, timezone, overlap, languages, kickoff, roles, intro, featured, active, sort)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      slugify(country.name), country.name, country.label, country.code, country.currency,
      country.timezone, country.overlap, country.languages, country.kickoff,
      JSON.stringify(country.roles), country.intro, country.featured ? 1 : 0, cIndex
    );
    const countryId = Number(info.lastInsertRowid);

    country.states.forEach((state, sIndex) => {
      const stateInfo = run(
        'INSERT INTO states (country_id, slug, name, sort, active) VALUES (?, ?, ?, ?, 1)',
        countryId, slugify(state.name), state.name, sIndex
      );
      const stateId = Number(stateInfo.lastInsertRowid);

      state.cities.forEach((city, cityIndex) => {
        run(
          'INSERT INTO cities (state_id, slug, name, intro, featured, active, sort) VALUES (?, ?, ?, ?, ?, 1, ?)',
          stateId, slugify(city), city, '', featured.has(city) ? 1 : 0, cityIndex
        );
      });
    });
  });
}

function insertPages() {
  const now = new Date().toISOString();
  pages.forEach((page) => {
    run(
      `INSERT INTO pages (slug, title, h1, intro, body, meta_title, meta_description, meta_keywords, active, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      page.slug, page.title, page.h1, page.intro, page.body,
      page.meta_title || '', page.meta_description || '', '', now
    );
  });
}

function insertPosts() {
  const now = new Date().toISOString();
  posts.forEach((post) => {
    run(
      `INSERT INTO posts
        (slug, title, category, excerpt, body, cover, author, status, published_at, read_minutes,
         featured, meta_title, meta_description, meta_keywords, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?, '', '', '', ?, ?)`,
      post.slug, post.title, post.category, post.excerpt, post.body, post.cover,
      'Sama Studio', post.published_at, post.read_minutes, post.featured ? 1 : 0, now, now
    );
  });
}

function insertSampleInquiries() {
  const rows = [
    ['Aarav Mehta', 'aarav@northlineinteriors.in', '+91 98110 22140', 'Northline Interiors', 'website-design', 'New Delhi', 'Delhi', 'India', '₹75k–₹1.5L', 'We need a new site for our interior fit-out business. Current one is 6 years old and not mobile friendly.'],
    ['Priya Nair', 'priya@vayucare.in', '+91 98450 71203', 'Vayu Care', 'local-seo', 'Bengaluru', 'Karnataka', 'India', '₹30k–₹60k/mo', 'Three clinics in Bengaluru. We want to rank in the map pack for each locality.'],
    ['Rohit Bansal', 'rohit@bansalfoods.com', '+91 98730 44512', 'Bansal Foods', 'shopify-development', 'Ludhiana', 'Punjab', 'India', '₹1.5L–₹3L', 'Moving from a marketplace to our own D2C store. Around 120 SKUs.'],
    ['Sarah Whitfield', 'sarah@whitfieldco.co.uk', '+44 7700 900412', 'Whitfield & Co', 'website-redesign', 'London', 'England', 'United Kingdom', '£5k–£10k', 'Professional services firm. Need a credible site and better lead capture.'],
    ['Omar Al Mansoori', 'omar@almansoori.ae', '+971 50 442 8831', 'Al Mansoori Trading', 'corporate-website-design', 'Dubai', 'Dubai', 'United Arab Emirates', 'AED 25k–50k', 'Bilingual corporate site for a trading company. Arabic content required.'],
    ['Meera Iyer', 'meera@studioarka.in', '+91 99400 33128', 'Studio Arka', 'ui-ux-design', 'Chennai', 'Tamil Nadu', 'India', '₹1.25L–₹2L', 'SaaS dashboard redesign. Current users complain the flow is confusing.'],
    ['Daniel Okafor', 'daniel@harborlane.com', '+1 415 555 0148', 'Harborlane', 'cro', 'San Francisco', 'California', 'United States', '$4k–$8k/mo', 'E-commerce conversion stuck at 1.1%. Looking for a structured CRO programme.'],
    ['Ananya Das', 'ananya@bichitra.in', '+91 98300 66129', 'Bichitra', 'brand-campaigns', 'Kolkata', 'West Bengal', 'India', '₹1.25L–₹2L', 'Festive campaign across social, print and in-store. Need a key visual system.'],
    ['Nikhil Rao', 'nikhil@fleetstack.io', '+91 90080 77214', 'FleetStack', 'react-native-app-development', 'Hyderabad', 'Telangana', 'India', '₹3L–₹6L', 'Driver app for a logistics platform. Need iOS and Android in one codebase.'],
    ['Kritika Shah', 'kritika@theslowlabel.in', '+91 98250 11093', 'The Slow Label', 'content-writing', 'Ahmedabad', 'Gujarat', 'India', '₹40k–₹80k', 'D2C skincare brand. Need product descriptions and 8 journal articles.'],
    ['Bishal Thapa', 'bishal@himalayanleaf.com.np', '+977 98 4410 2288', 'Himalayan Leaf', 'seo-services', 'Kathmandu', 'Bagmati', 'Nepal', 'USD 800–1,500/mo', 'Tour operator site. Traffic is flat and we rely entirely on ads.'],
    ['Fatima Al Zahrani', 'fatima@rawasi.sa', '+966 55 220 4417', 'Rawasi', 'website-design', 'Riyadh', 'Riyadh', 'Saudi Arabia', 'SAR 30k–60k', 'Need a bilingual site with RTL support for a services company.'],
    ['Arjun Kapoor', 'arjun@kapoorsteel.in', '+91 98100 55321', 'Kapoor Steel', 'lead-generation', 'Noida', 'Uttar Pradesh', 'India', '₹75k–₹1.5L', 'B2B manufacturer. Want qualified RFQs, not just form fills.'],
    ['Pim Suwan', 'pim@siamhospitality.co.th', '+66 81 234 5567', 'Siam Hospitality', 'social-media-management', 'Bangkok', 'Bangkok', 'Thailand', 'THB 40k–70k/mo', 'Hotel group with four properties. Need consistent social and content.'],
    ['Ritu Verma', 'ritu@clinicplus.in', '+91 94140 22018', 'ClinicPlus', 'ppc-google-ads', 'Jaipur', 'Rajasthan', 'India', '₹30k/mo + media', 'Running ads without tracking. Need proper account structure and conversions.'],
    ['James Patel', 'james@northbridge.co.uk', '+44 7700 900188', 'Northbridge', 'wordpress-development', 'Manchester', 'England', 'United Kingdom', '£4k–£8k', 'WordPress site is slow and impossible to edit. Need a rebuild.'],
    ['Sneha Kulkarni', 'sneha@punecoworks.in', '+91 98220 44719', 'Pune Coworks', 'local-seo', 'Pune', 'Maharashtra', 'India', '₹30k–₹50k/mo', 'Two coworking locations. Want to own local search for both.'],
    ['Ahmed Khan', 'ahmed@gulftech.ae', '+971 55 881 0923', 'GulfTech', 'wordpress-speed-optimization', 'Abu Dhabi', 'Abu Dhabi', 'United Arab Emirates', 'AED 8k–15k', 'Site takes 6 seconds to load. Losing signups from paid traffic.'],
    ['Tenzin Dorje', 'tenzin@lotusretreat.in', '+91 98160 77420', 'Lotus Retreat', 'website-design', 'Dharamshala', 'Himachal Pradesh', 'India', '₹75k–₹1.25L', 'Boutique stay. Need direct bookings instead of relying on OTAs.'],
    ['Emily Carter', 'emily@carterstudio.com', '+1 212 555 0192', 'Carter Studio', 'logo-brand-identity', 'New York City', 'New York', 'United States', '$5k–$10k', 'Rebrand for an architecture practice. Identity and website together.'],
    ['Vikram Singh', 'vikram@agrifresh.in', '+91 98140 66772', 'AgriFresh', 'packaging-design', 'Indore', 'Madhya Pradesh', 'India', '₹55k–₹1L', 'Packaging for a new range of cold-pressed oils. Retail launch in March.'],
    ['Sara Al Otaibi', 'sara@visionpads.sa', '+966 50 330 8871', 'VisionPads', 'ui-ux-design', 'Jeddah', 'Makkah', 'Saudi Arabia', 'SAR 40k–70k', 'Booking flow for a co-working brand. Arabic and English.'],
    ['Rahul Menon', 'rahul@zephyrpay.in', '+91 98470 22190', 'ZephyrPay', 'website-security', 'Kochi', 'Kerala', 'India', '₹30k–₹50k', 'WordPress site had a malware incident last month. Need hardening and monitoring.'],
    ['Olivia Brown', 'olivia@brownandco.com', '+1 512 555 0177', 'Brown & Co', 'email-marketing', 'Austin', 'Texas', 'United States', '$3k–$6k', 'Shopify store with 40k subscribers, almost no flows set up.'],
    ['Suman Gurung', 'suman@peakgear.com.np', '+977 98 5511 3374', 'Peak Gear', 'shopify-development', 'Pokhara', 'Gandaki', 'Nepal', 'USD 3k–6k', 'Outdoor gear brand. Need a store that can ship internationally.'],
    ['Aditi Bose', 'aditi@boselegal.in', '+91 98310 22564', 'Bose Legal', 'content-strategy', 'Kolkata', 'West Bengal', 'India', '₹55k–₹1L', 'Law firm. Want to publish consistently without sounding generic.']
  ];

  const statuses = ['new', 'new', 'new', 'contacted', 'contacted', 'quoted', 'won', 'lost'];
  const now = Date.now();

  rows.forEach((row, index) => {
    const [name, email, phone, company, slug, city, state, country, budget, message] = row;
    const svc = get('SELECT id, name FROM services WHERE slug = ?', slug);
    const daysBack = Math.floor(index * 0.62) % 16;
    const created = new Date(now - daysBack * 86400000 - (index % 7) * 3600000).toISOString();
    const status = statuses[index % statuses.length];
    const notes = status === 'won'
      ? 'Proposal accepted. Kickoff scheduled.'
      : status === 'quoted'
        ? 'Scope and quote sent. Follow-up booked.'
        : status === 'contacted'
          ? 'Discovery call completed. Waiting on brief.'
          : '';
    run(
      `INSERT INTO inquiries
        (name, email, phone, company, service_id, service_name, country, state, city, budget, message,
         source_path, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      name, email, phone, company, svc ? svc.id : null, svc ? svc.name : '',
      country, state, city, budget, message,
      svc ? `/services/${slug}` : '/contact', status, notes, created
    );
  });
}

function seed({ force = false } = {}) {
  return tx(() => {
    if (force) wipe();
    insertSettings();
    insertAdmin();
    insertCatalog();
    insertLocations();
    insertPages();
    insertPosts();
    insertSampleInquiries();
    const counts = {
      categories: get('SELECT COUNT(*) AS n FROM categories').n,
      services: get('SELECT COUNT(*) AS n FROM services').n,
      countries: get('SELECT COUNT(*) AS n FROM countries').n,
      states: get('SELECT COUNT(*) AS n FROM states').n,
      cities: get('SELECT COUNT(*) AS n FROM cities').n,
      posts: get('SELECT COUNT(*) AS n FROM posts').n,
      pages: get('SELECT COUNT(*) AS n FROM pages').n,
      inquiries: get('SELECT COUNT(*) AS n FROM inquiries').n
    };
    return counts;
  });
}

function ensureSeed() {
  const marker = get("SELECT value FROM settings WHERE key = 'content_version'");
  const users = get('SELECT COUNT(*) AS n FROM users');
  if (!marker || users.n === 0) return seed({ force: false });
  return null;
}

if (require.main === module) {
  const force = process.argv.includes('--force');
  const counts = seed({ force });
  console.log('Seeded:', counts);
}

module.exports = { seed, ensureSeed };
