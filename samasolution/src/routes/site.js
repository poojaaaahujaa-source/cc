'use strict';

const express = require('express');
const { all, get } = require('../db');
const { getAll } = require('../lib/settings');
const {
  navCategories, allServices, servicesByCategory, featuredServices, serviceBySlug,
  categoryBySlug, marketCountries, marketSummary, featuredCities, statesForCountry,
  citiesForState, latestPosts, blogCategories
} = require('../lib/content');
const { keywordList, metaTitle, metaDescription, resolveMeta } = require('../lib/seo');
const { parseJSON, hashString, truncate } = require('../lib/utils');
const { render: renderMarkdown } = require('../lib/markdown');
function workContent() {
  const projects = all(
    "SELECT * FROM work WHERE kind = 'project' AND active = 1 ORDER BY sort, id"
  ).map((row) => ({ ...row, metricLabel: row.metric_label }));
  const testimonials = all(
    "SELECT * FROM work WHERE kind = 'testimonial' AND active = 1 ORDER BY sort, id"
  );
  return { projects, testimonials };
}

const router = express.Router();

const BILLING = {
  IN: 'GST invoicing, INR pricing and Hindi or English communication as you prefer.',
  NP: 'Invoicing in INR or USD, with calls scheduled to Nepal time.',
  AE: 'Pricing in AED or USD, with a working overlap through the Gulf day.',
  TH: 'Pricing in THB or USD; English-first delivery with Thai content support.',
  SA: 'Pricing in SAR or USD; English-first delivery with Arabic content and RTL support.',
  US: 'Pricing in USD, with a fixed three-to-four hour overlap in your working day.',
  GB: 'Pricing in GBP, with a working overlap through the London day.'
};

function billingLine(country) {
  return BILLING[country.code] || `Pricing in ${country.currency}, invoiced from India.`;
}

function cityParagraphs(city, state, country) {
  const variants = [
    `Businesses in ${city} usually find us through search, a referral or a project that stalled somewhere else. We work as a remote-first studio: a fixed daily overlap, written updates and one senior lead who stays with the account from the first call to launch.`,
    `Our work across ${state.name} covers websites, online stores and search programmes. For ${city}, the engagement looks the same as anywhere else — a paid discovery, a fixed scope, a dated plan and a build your team can edit without calling a developer.`,
    `If you are comparing studios for a project in ${city}, the useful questions are who will actually do the work, what happens after launch, and whether content is included. We answer all three in writing before you commit to anything.`
  ];
  const seed = hashString(`${city}|${state.name}`);
  return [variants[seed % variants.length], variants[(seed + 1) % variants.length]];
}

function localField(country, key) {
  return country[key] || '';
}

function findCountry(slug) {
  return marketCountries().find((c) => c.slug === slug);
}

function findState(country, slug) {
  return statesForCountry(country.id).find((s) => s.slug === slug);
}

function findCity(state, slug) {
  return citiesForState(state.id).find((c) => c.slug === slug);
}

/* ── Home ─────────────────────────────────────────────────────── */
router.get('/', (req, res) => {
  const site = getAll();
  const categories = navCategories();
  const services = featuredServices(8);
  const market = marketSummary();
  const countries = marketCountries();
  const cities = featuredCities(8);
  const gallery = workContent();
  const posts = latestPosts(3);
  const stats = parseJSON(site.home_stats, []);

  res.renderPage('site/home', {
    pageTitle: site.seo_default_title,
    metaDescription: site.seo_default_description,
    metaKeywords: site.seo_default_keywords,
    ogImage: '/img/hero.jpg',
    bodyClass: 'home',
    categories,
    services,
    market,
    countries,
    cities,
    posts,
    stats,
    work: gallery.projects,
    testimonials: gallery.testimonials,
    jsonLd: [
      { '@context': 'https://schema.org', '@type': 'WebSite', url: site.site_url, name: site.site_name, potentialAction: { '@type': 'SearchAction', target: `${site.site_url}/search?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
      { '@context': 'https://schema.org', '@type': 'Organization', name: site.site_name, url: site.site_url, email: site.contact_email, telephone: site.contact_phone, address: { '@type': 'PostalAddress', addressLocality: site.contact_city, addressCountry: 'IN' } }
    ]
  });
});

/* ── Services ─────────────────────────────────────────────────── */
router.get('/services', (req, res) => {
  const site = getAll();
  const categories = navCategories();
  const count = allServices().length;
  const title = `Services — websites, e-commerce, apps, SEO & growth | ${site.site_name}`;
  res.renderPage('site/services', {
    pageTitle: truncate(title, 68),
    metaDescription: `Explore ${count} service lines across web design, e-commerce, WordPress, apps, branding, SEO, performance marketing and content. Fixed scope, senior delivery.`,
    metaKeywords: 'web design services, ecommerce development, SEO services, digital marketing agency, app development India',
    bodyClass: 'services-page',
    categories,
    count
  });
});

router.get('/services/:slug', (req, res, next) => {
  const service = serviceBySlug(req.params.slug);
  if (!service) return next();
  const site = getAll();
  const category = categoryBySlug(service.category_slug);
  const catServices = servicesByCategory(service.category_slug).filter((s) => s.id !== service.id);
  const body = parseJSON(service.body, []);
  const deliverables = parseJSON(service.deliverables, []);
  const process = parseJSON(category.process, []);
  const faqs = parseJSON(category.faqs, []);
  const cities = featuredCities(10);

  const generated = {
    title: metaTitle({ service: service.name, siteName: site.site_name }),
    description: metaDescription({ service: service.name, summary: service.summary, country: 'India', siteName: site.site_name }),
    keywords: keywordList({ service: service.name, roles: ['Company', 'Agency', 'Service Provider'], country: 'India' })
  };
  const meta = resolveMeta(service, generated);

  res.renderPage('site/service', {
    pageTitle: meta.title,
    metaDescription: meta.description,
    metaKeywords: meta.keywords,
    ogImage: service.image,
    bodyClass: 'service-page',
    service,
    category,
    catServices,
    body,
    deliverables,
    process,
    faqs,
    cities,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.summary,
        provider: { '@type': 'Organization', name: site.site_name, url: site.site_url },
        areaServed: ['India', 'Nepal', 'United Arab Emirates', 'Thailand', 'Saudi Arabia', 'United States', 'United Kingdom'],
        url: `${site.site_url}/services/${service.slug}`
      },
      faqs.length ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      } : null,
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.site_url },
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${site.site_url}/services` },
          { '@type': 'ListItem', position: 3, name: service.name, item: `${site.site_url}/services/${service.slug}` }
        ]
      }
    ].filter(Boolean)
  });
});

/* ── Market area ──────────────────────────────────────────────── */
router.get('/market-area', (req, res) => {
  const site = getAll();
  const countries = marketCountries();
  const summary = marketSummary();
  const cities = featuredCities(16);
  const statesByCountry = countries.map((country) => ({
    country,
    states: statesForCountry(country.id).slice(0, 6),
    totalStates: country.state_count
  }));

  res.renderPage('site/market-hub', {
    pageTitle: `Market area — ${summary.countries} countries, ${summary.cities} cities | ${site.site_name}`,
    metaDescription: `Where Sama Solutions works: ${summary.countries} countries, ${summary.states} states and provinces, ${summary.cities} cities. Local pages for web design, e-commerce, SEO and marketing.`,
    metaKeywords: 'market area, web design across India, digital agency Nepal, web design Dubai, SEO Saudi Arabia, UK web design',
    bodyClass: 'market-page',
    countries,
    summary,
    cities,
    statesByCountry,
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.site_url },
        { '@type': 'ListItem', position: 2, name: 'Market area', item: `${site.site_url}/market-area` }
      ]
    }]
  });
});

router.get('/market-area/:country', (req, res, next) => {
  const country = findCountry(req.params.country);
  if (!country) return next();
  const site = getAll();
  const states = statesForCountry(country.id);
  const cities = all(
    `SELECT ci.*, s.slug AS state_slug, s.name AS state_name
       FROM cities ci JOIN states s ON s.id = ci.state_id
      WHERE s.country_id = ? AND ci.active = 1 ORDER BY ci.featured DESC, ci.sort LIMIT 24`,
    country.id
  );
  const totalCities = states.reduce((n, s) => n + s.city_count, 0);

  res.renderPage('site/market-country', {
    pageTitle: truncate(`Web design & digital services in ${country.label || country.name} | ${site.site_name}`, 68),
    metaDescription: `Websites, e-commerce, SEO and marketing for businesses in ${country.name}. ${states.length} states, ${totalCities} cities, ${country.overlap.toLowerCase()}.`,
    metaKeywords: keywordList({ service: 'Web design', roles: country.roles, country: country.name, limit: 12 }).join(', '),
    ogImage: '/img/hero.jpg',
    bodyClass: 'market-page',
    country,
    states,
    cities,
    totalCities,
    billing: billingLine(country),
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.site_url },
        { '@type': 'ListItem', position: 2, name: 'Market area', item: `${site.site_url}/market-area` },
        { '@type': 'ListItem', position: 3, name: country.name, item: `${site.site_url}/market-area/${country.slug}` }
      ]
    }]
  });
});

router.get('/market-area/:country/:state', (req, res, next) => {
  const country = findCountry(req.params.country);
  if (!country) return next();
  const state = findState(country, req.params.state);
  if (!state) return next();
  const site = getAll();
  const cities = citiesForState(state.id);
  const featured = cities.filter((c) => c.featured).slice(0, 6);

  res.renderPage('site/market-state', {
    pageTitle: truncate(`Web design services in ${state.name}, ${country.name} | ${site.site_name}`, 68),
    metaDescription: `Websites, e-commerce and SEO for businesses across ${state.name}, ${country.name}. ${cities.length} cities covered, ${country.overlap.toLowerCase()}.`,
    metaKeywords: keywordList({ service: 'Web design', roles: country.roles, state: state.name, country: country.name }).join(', '),
    bodyClass: 'market-page',
    country,
    state,
    cities,
    featured
  });
});

router.get('/market-area/:country/:state/:city', (req, res, next) => {
  const country = findCountry(req.params.country);
  if (!country) return next();
  const state = findState(country, req.params.state);
  if (!state) return next();
  const city = findCity(state, req.params.city);
  if (!city) return next();
  const site = getAll();
  const categories = navCategories();
  const summary = marketSummary();
  const paragraphs = cityParagraphs(city.name, state, country);
  const nearby = citiesForState(state.id).filter((c) => c.id !== city.id).slice(0, 8);
  const services = allServices().filter((s) => s.featured).slice(0, 8);
  const faqs = [
    {
      q: `Do you have an office in ${city.name}?`,
      a: `No. We are a Delhi-based studio and work with ${city.name} clients remotely, with a fixed daily overlap and written updates. For projects that need someone on site, we travel for discovery and launch.`
    },
    {
      q: `How do time zones work for a ${city.name} project?`,
      a: `${country.overlap}. Calls are scheduled inside that overlap, and everything else runs asynchronously with a written daily or weekly update.`
    },
    {
      q: `What does a project in ${city.name} cost?`,
      a: `A focused website typically starts at the entry point of our published range; e-commerce, apps and retainers are scoped separately. ${billingLine(country)} You get a fixed quote after a 30-minute call.`
    },
    {
      q: 'How do we start?',
      a: 'Send a short brief through the contact form. You will get a reply within one working day with two or three questions and a suggested next step.'
    }
  ];

  res.renderPage('site/market-city', {
    pageTitle: truncate(`Web design & digital services in ${city.name} | ${site.site_name}`, 68),
    metaDescription: truncate(`Websites, e-commerce, SEO and marketing for businesses in ${city.name}, ${state.name}. Remote-first studio, ${country.overlap.toLowerCase()}.`, 158),
    metaKeywords: keywordList({ service: 'Web design', roles: country.roles, city: city.name, state: state.name, country: country.name }).join(', '),
    ogImage: '/img/hero.jpg',
    bodyClass: 'market-page',
    country,
    state,
    city,
    categories,
    paragraphs,
    nearby,
    services,
    faqs,
    summary,
    billing: billingLine(country),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.site_url },
          { '@type': 'ListItem', position: 2, name: 'Market area', item: `${site.site_url}/market-area` },
          { '@type': 'ListItem', position: 3, name: country.name, item: `${site.site_url}/market-area/${country.slug}` },
          { '@type': 'ListItem', position: 4, name: state.name, item: `${site.site_url}/market-area/${country.slug}/${state.slug}` },
          { '@type': 'ListItem', position: 5, name: city.name, item: `${site.site_url}/market-area/${country.slug}/${state.slug}/${city.slug}` }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }
    ]
  });
});

router.get('/market-area/:country/:state/:city/:service', (req, res, next) => {
  const country = findCountry(req.params.country);
  if (!country) return next();
  const state = findState(country, req.params.state);
  if (!state) return next();
  const city = findCity(state, req.params.city);
  if (!city) return next();
  const service = serviceBySlug(req.params.service);
  if (!service) return next();

  const site = getAll();
  const category = categoryBySlug(service.category_slug);
  const body = parseJSON(service.body, []);
  const deliverables = parseJSON(service.deliverables, []);
  const process = parseJSON(category.process, []);
  const faqs = parseJSON(category.faqs, []).slice(0, 2);
  const related = servicesByCategory(service.category_slug).filter((s) => s.id !== service.id).slice(0, 4);
  const nearby = citiesForState(state.id).filter((c) => c.id !== city.id).slice(0, 6);
  const place = `${city.name}, ${state.name}`;

  const generated = {
    title: metaTitle({ service: service.name, city: city.name, role: country.roles[0], siteName: site.site_name }),
    description: metaDescription({ service: service.name, summary: service.summary, city: city.name, state: state.name, siteName: site.site_name }),
    keywords: keywordList({ service: service.name, roles: country.roles, city: city.name, state: state.name, country: country.name })
  };

  const localFaqs = [
    {
      q: `Do you work with clients in ${city.name}?`,
      a: `Yes. We are a Delhi-based studio working remotely with businesses in ${place}. Delivery is in ${country.currency}, with ${country.overlap.toLowerCase()} and a named senior lead.`
    },
    ...faqs,
    {
      q: `What is the timeline for ${service.name.toLowerCase()} in ${city.name}?`,
      a: `${service.timeline}. The exact schedule is confirmed in writing after discovery, including what we need from your side.`
    }
  ];

  res.renderPage('site/market-service', {
    pageTitle: generated.title,
    metaDescription: generated.description,
    metaKeywords: generated.keywords.join(', '),
    ogImage: service.image,
    bodyClass: 'market-page market-service-page',
    country,
    state,
    city,
    place,
    service,
    category,
    body,
    deliverables,
    process,
    faqs: localFaqs,
    related,
    nearby,
    billing: billingLine(country),
    roles: country.roles,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: `${service.name} in ${city.name}`,
        description: service.summary,
        provider: { '@type': 'Organization', name: site.site_name, url: site.site_url },
        areaServed: { '@type': 'City', name: city.name },
        url: `${site.site_url}${req.path}`
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: site.site_url },
          { '@type': 'ListItem', position: 2, name: 'Market area', item: `${site.site_url}/market-area` },
          { '@type': 'ListItem', position: 3, name: country.name, item: `${site.site_url}/market-area/${country.slug}` },
          { '@type': 'ListItem', position: 4, name: state.name, item: `${site.site_url}/market-area/${country.slug}/${state.slug}` },
          { '@type': 'ListItem', position: 5, name: city.name, item: `${site.site_url}/market-area/${country.slug}/${state.slug}/${city.slug}` },
          { '@type': 'ListItem', position: 6, name: service.name, item: `${site.site_url}${req.path}` }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: localFaqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
      }
    ]
  });
});

/* ── Blog ─────────────────────────────────────────────────────── */
router.get('/blog', (req, res) => {
  const site = getAll();
  const category = String(req.query.category || '').trim();
  const posts = category
    ? all("SELECT * FROM posts WHERE status = 'published' AND category = ? ORDER BY published_at DESC", category)
    : all("SELECT * FROM posts WHERE status = 'published' ORDER BY published_at DESC");
  const categories = blogCategories();
  res.renderPage('site/blog', {
    pageTitle: `Insights — notes on design, search and growth | ${site.site_name}`,
    metaDescription: 'Practical writing on web design, performance, SEO, e-commerce and building a market area that does not look like spam.',
    metaKeywords: 'web design blog, SEO guide, Core Web Vitals, Shopify India, local SEO',
    bodyClass: 'blog-page',
    posts,
    categories,
    activeCategory: category
  });
});

router.get('/blog/:slug', (req, res, next) => {
  const post = get("SELECT * FROM posts WHERE slug = ? AND status = 'published'", req.params.slug);
  if (!post) return next();
  const site = getAll();
  const related = all(
    "SELECT * FROM posts WHERE slug != ? AND status = 'published' ORDER BY published_at DESC LIMIT 3",
    post.slug
  );
  const meta = resolveMeta(post, {
    title: truncate(`${post.title} | ${site.site_name}`, 68),
    description: post.excerpt,
    keywords: [post.category, 'Sama Solutions', 'digital agency India'].join(', ')
  });

  res.renderPage('site/post', {
    pageTitle: meta.title,
    metaDescription: meta.description,
    metaKeywords: meta.keywords,
    ogImage: post.cover,
    ogType: 'article',
    bodyClass: 'post-page',
    post,
    related,
    html: renderMarkdown(post.body),
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.excerpt,
      image: `${site.site_url}${post.cover}`,
      datePublished: post.published_at,
      dateModified: post.updated_at,
      author: { '@type': 'Organization', name: post.author },
      publisher: { '@type': 'Organization', name: site.site_name },
      mainEntityOfPage: `${site.site_url}/blog/${post.slug}`
    }]
  });
});

/* ── Search ───────────────────────────────────────────────────── */
router.get('/search', (req, res) => {
  const site = getAll();
  const q = String(req.query.q || '').trim();
  const like = `%${q}%`;
  let services = [];
  let posts = [];
  let cities = [];
  if (q.length >= 2) {
    services = all(
      'SELECT slug, name, summary FROM services WHERE active = 1 AND (name LIKE ? OR summary LIKE ?) LIMIT 12',
      like, like
    );
    posts = all(
      "SELECT slug, title, excerpt FROM posts WHERE status = 'published' AND (title LIKE ? OR excerpt LIKE ?) LIMIT 8",
      like, like
    );
    cities = all(
      `SELECT ci.slug AS city_slug, ci.name AS city, s.slug AS state_slug, s.name AS state,
              co.slug AS country_slug, co.name AS country
         FROM cities ci JOIN states s ON s.id = ci.state_id JOIN countries co ON co.id = s.country_id
        WHERE ci.active = 1 AND ci.name LIKE ? LIMIT 12`,
      like
    );
  }

  res.renderPage('site/search', {
    pageTitle: q ? `Search: ${q} | ${site.site_name}` : `Search | ${site.site_name}`,
    metaDescription: 'Search services, insights and market-area locations.',
    noindex: true,
    bodyClass: 'search-page',
    q,
    services,
    posts,
    cities
  });
});

/* ── Contact + static pages ───────────────────────────────────── */
router.get('/contact', (req, res) => {
  const page = get("SELECT * FROM pages WHERE slug = 'contact' AND active = 1");
  const site = getAll();
  const services = allServices().map((s) => ({ slug: s.slug, name: s.name, category: s.category_name }));
  const groupMap = new Map();
  for (const svc of services) {
    if (!groupMap.has(svc.category)) groupMap.set(svc.category, []);
    groupMap.get(svc.category).push(svc);
  }
  const serviceGroups = [...groupMap.entries()].map(([category, items]) => ({ category, items }));
  const countries = marketCountries();
  const meta = resolveMeta(page || {}, {
    title: `Contact ${site.site_name} | Start a project`,
    description: site.seo_default_description,
    keywords: ''
  });

  res.renderPage('site/contact', {
    pageTitle: meta.title,
    metaDescription: meta.description,
    bodyClass: 'contact-page',
    page,
    html: page ? renderMarkdown(page.body) : '',
    services,
    serviceGroups,
    countries,
    prefillService: req.query.service || '',
    prefillCity: req.query.city || '',
    sent: req.query.sent === '1'
  });
});

router.get('/:slug', (req, res, next) => {
  const page = get('SELECT * FROM pages WHERE slug = ? AND active = 1', req.params.slug);
  if (!page) return next();
  const site = getAll();
  const meta = resolveMeta(page, {
    title: truncate(`${page.title} | ${site.site_name}`, 68),
    description: page.intro || site.seo_default_description,
    keywords: ''
  });
  res.renderPage('site/page', {
    pageTitle: meta.title,
    metaDescription: meta.description,
    bodyClass: `page-${page.slug}`,
    page,
    html: renderMarkdown(page.body),
    jsonLd: [{
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: site.site_url },
        { '@type': 'ListItem', position: 2, name: page.title, item: `${site.site_url}/${page.slug}` }
      ]
    }]
  });
});

module.exports = router;
