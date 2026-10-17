'use strict';

/** Illustrative engagement cards used on the home page. Sector descriptors, no client names. */
const work = [
  {
    title: 'A skincare brand’s first D2C store',
    sector: 'D2C · E-commerce',
    image: '/img/work-1.jpg',
    scope: 'Shopify build · Brand refresh · Email flows',
    metric: '3.1×',
    metricLabel: 'returning-customer revenue in 6 months',
    year: '2026'
  },
  {
    title: 'A 40-year-old manufacturer, rebuilt for export',
    sector: 'Industrial · Corporate',
    image: '/img/work-2.jpg',
    scope: 'Corporate site · Product catalogue · SEO',
    metric: '68%',
    metricLabel: 'increase in organic enquiries',
    year: '2025'
  },
  {
    title: 'A boutique hospitality group, direct again',
    sector: 'Hospitality · Website',
    image: '/img/work-3.jpg',
    scope: 'Website · Booking integration · Photography direction',
    metric: '−41%',
    metricLabel: 'reliance on OTA bookings',
    year: '2025'
  },
  {
    title: 'A B2B platform that stopped leaking leads',
    sector: 'SaaS · CRO',
    image: '/img/work-4.jpg',
    scope: 'UX audit · Landing system · Paid search',
    metric: '2.4×',
    metricLabel: 'qualified demo requests',
    year: '2024'
  }
];

const testimonials = [
  {
    quote: 'They rewrote our homepage before designing it, which nobody had done in eight years. The site went live in five weeks and the enquiries changed within a month.',
    name: 'Operations lead',
    detail: 'D2C skincare brand · Delhi NCR'
  },
  {
    quote: 'The team understood the catalogue better than our previous agency understood the business. We can now add a product page without raising a ticket.',
    name: 'Managing director',
    detail: 'Industrial manufacturer · Gujarat'
  },
  {
    quote: 'Fixed scope, weekly updates, no surprises on the invoice. That sounds basic until you have worked with three agencies that could not do it.',
    name: 'Marketing head',
    detail: 'Professional services · London'
  }
];

module.exports = { work, testimonials };
