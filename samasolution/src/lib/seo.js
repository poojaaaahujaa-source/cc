'use strict';

const { truncate } = require('./utils');

/**
 * The keyword formula requested for this build:
 *   [Service] + [Role] + [Location]
 * Roles come from the country record (Company, Agency, Supplier, Importer,
 * Exporter, Manufacturer …) and are editable in the admin panel.
 */
function keywordList({ service, roles = [], city, state, country, limit = 10 }) {
  const name = String(service || '').trim();
  if (!name) return [];

  const roleList = (Array.isArray(roles) ? roles : String(roles || '').split(','))
    .map((role) => String(role).trim())
    .filter(Boolean)
    .slice(0, 3);
  if (!roleList.length) roleList.push('Company');
  const primary = city || state || country || '';
  const out = [];
  const seen = new Set();

  const push = (value) => {
    const clean = String(value || '').replace(/\s+/g, ' ').trim();
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) return;
    seen.add(key);
    out.push(clean);
  };

  if (primary) {
    roleList.slice(0, 2).forEach((role) => {
      push(`${name} ${role} in ${primary}`);
      push(`${name} ${role} ${primary}`);
    });
    push(`${name} in ${primary}`);
    push(`${name} services ${primary}`);
  }
  if (city && state) push(`${name} in ${city}, ${state}`);
  if (state && state !== primary) push(`${name} in ${state}`);
  if (country && country !== primary) push(`${name} in ${country}`);
  if (roleList[0] && country && country !== primary) push(`${name} ${roleList[0]} ${country}`);
  if (city) push(`best ${name.toLowerCase()} in ${city}`);

  return out.slice(0, limit);
}

function metaTitle({ service, city, state, country, role, siteName }) {
  const place = city || state || country;
  let title;
  if (service && place && role) title = `${service} ${role} in ${place}`;
  else if (service && place) title = `${service} in ${place}`;
  else if (service) title = service;
  else title = place || '';
  if (siteName && title.length + siteName.length + 3 <= 66) title += ` | ${siteName}`;
  return truncate(title, 66);
}

function metaDescription({ service, summary, city, state, country, siteName }) {
  const place = [city, state].filter(Boolean).join(', ') || country || '';
  const lead = place ? `${service} for businesses in ${place}.` : `${service}.`;
  const tail = ` ${summary || ''} Clear scope, fixed timelines, one senior team.`;
  return truncate(`${lead}${tail}`, 158);
}

function resolveMeta(record, generated) {
  const pick = (a, b) => (a && String(a).trim() ? String(a).trim() : b);
  const keywords = Array.isArray(generated.keywords)
    ? generated.keywords.join(', ')
    : (generated.keywords || '');
  return {
    title: pick(record.meta_title, generated.title),
    description: pick(record.meta_description, generated.description),
    keywords: pick(record.meta_keywords, keywords)
  };
}

function organizationSchema({ site, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${url}/#organization`,
    name: site.site_name,
    url,
    description: site.site_description,
    email: site.contact_email,
    telephone: site.contact_phone,
    address: { '@type': 'PostalAddress', addressLocality: site.contact_city, addressCountry: site.contact_country },
    areaServed: ['IN', 'NP', 'AE', 'TH', 'SA', 'US', 'GB'],
    sameAs: (site.social_links || []).map((s) => s.url).filter(Boolean)
  };
}

function websiteSchema({ site, url }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${url}/#website`,
    url,
    name: site.site_name,
    description: site.site_description,
    publisher: { '@id': `${url}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

function breadcrumbSchema(url, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${url}${item.path}`
    }))
  };
}

function serviceSchema({ url, name, description, areaServed, provider }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'Organization', name: provider },
    areaServed: { '@type': 'Place', name: areaServed },
    url
  };
}

function articleSchema({ url, post, site }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: `${url}${post.cover}`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: post.author || site.site_name },
    publisher: { '@type': 'Organization', name: site.site_name },
    mainEntityOfPage: url
  };
}

function faqSchema(faqs) {
  if (!faqs || !faqs.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };
}

module.exports = {
  keywordList, metaTitle, metaDescription, resolveMeta,
  organizationSchema, websiteSchema, breadcrumbSchema, serviceSchema,
  articleSchema, faqSchema
};
