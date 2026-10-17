'use strict';

/**
 * Service taxonomy — covers every cluster currently offered on artattackk.com:
 * web design, Shopify/WooCommerce/Magento/OpenCart, WordPress, apps,
 * branding & graphic design, digital marketing, social media, SEO, content,
 * speed/maintenance/security.
 */

const categories = [
  {
    slug: 'web-design',
    name: 'Web Design & Development',
    short: 'Websites',
    icon: 'layout',
    image: '/img/service-web.jpg',
    blurb: 'Sites that look considered, load fast and make the next step obvious.',
    lede: 'We design and build marketing sites, corporate sites and campaign pages that carry a brand properly — and turn attention into enquiries.',
    process: [
      { title: 'Discovery & sitemap', text: 'We map the audience, the offer and the pages that actually earn their place. No 40-page sitemap for a 6-page business.' },
      { title: 'Design direction', text: 'Two routes, one chosen. Type, grid, imagery and motion defined before a single line of markup.' },
      { title: 'Build & content', text: 'Hand-coded, responsive, accessible. We write or edit the copy with you so the site launches full, not hollow.' },
      { title: 'Launch & measure', text: 'Redirects, analytics, Core Web Vitals and a 30-day post-launch watch list.' }
    ],
    faqs: [
      { q: 'How long does a website take?', a: 'A focused marketing site takes three to five weeks. Larger corporate builds with multiple templates run six to ten weeks. We publish a dated plan before kickoff.' },
      { q: 'Do you write the content?', a: 'Yes. Content is included as an option — we interview you, draft the pages and edit with you. Most clients take this because empty pages delay launches.' },
      { q: 'Will I be able to edit it myself?', a: 'Every build ships with a CMS and a short screen-recorded walkthrough. For this site, the entire front end is driven by the admin panel you are looking at.' }
    ]
  },
  {
    slug: 'ecommerce',
    name: 'E-Commerce & Shopify',
    short: 'E-Commerce',
    icon: 'cart',
    image: '/img/service-commerce.jpg',
    blurb: 'Stores built around the buying decision, not the template.',
    lede: 'Shopify, WooCommerce, Magento and OpenCart builds — catalogue architecture, product storytelling, checkout friction and the operational glue behind it.',
    process: [
      { title: 'Catalogue audit', text: 'We look at SKU count, variants, margin and return rate before recommending a platform.' },
      { title: 'Store architecture', text: 'Collections, filters, search, product templates and the path from ad to cart.' },
      { title: 'Build & integrate', text: 'Payments, shipping, tax, ERP, CRM and analytics wired and tested end to end.' },
      { title: 'Launch & optimise', text: 'First 60 days of funnel data, then structured CRO rather than redesign-by-opinion.' }
    ],
    faqs: [
      { q: 'Shopify or WooCommerce?', a: 'Shopify when speed to market and low maintenance matter. WooCommerce when the catalogue, pricing rules or content model need custom logic and you already run WordPress.' },
      { q: 'Can you migrate our existing store?', a: 'Yes — products, customers, orders, URLs and SEO equity. We run the migration on a staging store, reconcile counts and only then switch DNS.' },
      { q: 'Do you handle ongoing merchandising?', a: 'We can. Monthly retainers cover catalogue updates, campaign pages, CRO tests and conversion reporting.' }
    ]
  },
  {
    slug: 'cms',
    name: 'CMS & WordPress',
    short: 'WordPress',
    icon: 'wp',
    image: '/img/service-web.jpg',
    blurb: 'WordPress done properly: fast, secure, and editable by humans.',
    lede: 'Custom themes, speed work, migrations and support for WordPress sites that have outgrown their original build.',
    process: [
      { title: 'Audit', text: 'Plugin load, theme debt, hosting, caching and Core Web Vitals measured before we touch anything.' },
      { title: 'Rebuild or repair', text: 'A clear recommendation: salvage the install or rebuild the theme. We cost both.' },
      { title: 'Implement', text: 'Block-friendly templates, custom fields, staging environment, no page-builder lock-in unless you want it.' },
      { title: 'Handover', text: 'Admin training, update policy, backup routine and a rollback plan.' }
    ],
    faqs: [
      { q: 'Can you fix a slow WordPress site?', a: 'Usually. We profile the database, plugins and render path, then remove what is not earning its weight. Typical gains are 40–70% on LCP without changing hosts.' },
      { q: 'Do you use Elementor or WPBakery?', a: 'Only if you ask. Our default is native blocks and custom fields — lighter, faster and far easier to maintain.' },
      { q: 'What about security?', a: 'Hardened login, least-privilege roles, file-editing disabled, WAF where available, and a tested restore path. Security is a routine, not a plugin.' }
    ]
  },
  {
    slug: 'apps',
    name: 'Mobile App Development',
    short: 'Apps',
    icon: 'phone',
    image: '/img/service-apps.jpg',
    blurb: 'Native and cross-platform apps that ship.',
    lede: 'iOS, Android, Flutter and React Native builds — from a validated MVP to a maintained product with a release cadence.',
    process: [
      { title: 'Scope & prototype', text: 'A clickable prototype and a written scope. We cut features until the first release is genuinely shippable.' },
      { title: 'Architecture', text: 'Data model, API contracts, auth, offline behaviour and store compliance decided up front.' },
      { title: 'Build in sprints', text: 'Two-week sprints, a running build on TestFlight and internal tracks, weekly demos.' },
      { title: 'Release & iterate', text: 'Store submission, crash monitoring, analytics and a prioritised post-launch backlog.' }
    ],
    faqs: [
      { q: 'Native or cross-platform?', a: 'Cross-platform for most business apps — one codebase, faster iteration, lower cost. Native when the app leans on camera, Bluetooth, heavy graphics or platform-specific UX.' },
      { q: 'How much does an app cost?', a: 'A focused MVP typically starts around a defined fixed scope. We quote after a paid discovery so the estimate is based on screens, not guesses.' },
      { q: 'Do you maintain the app after launch?', a: 'Yes. OS updates, store policy changes and dependency upgrades need an owner. Our care plans cover releases and monitoring.' }
    ]
  },
  {
    slug: 'branding',
    name: 'Branding & Graphic Design',
    short: 'Branding',
    icon: 'brush',
    image: '/img/service-brand.jpg',
    blurb: 'Identity systems that survive contact with the real world.',
    lede: 'Logo, identity, print, packaging and motion — built as a system with rules, not a one-off file.',
    process: [
      { title: 'Positioning', text: 'Who you are for, what you stand against, and the one idea the brand should own.' },
      { title: 'Identity routes', text: 'Wordmark, monogram, colour, type and layout principles — presented in context, not on a white slide.' },
      { title: 'Systemise', text: 'Templates, specs, export rules and a short brand book your team will actually use.' },
      { title: 'Rollout', text: 'Stationery, packaging, social kit, signage and the first campaign assets.' }
    ],
    faqs: [
      { q: 'What do I receive?', a: 'Vector logo files in every format, colour and mono variants, type and colour specs, layout rules, and editable templates for the collateral you actually use.' },
      { q: 'How many logo options?', a: 'Two considered directions, each shown across real applications. Not twenty sketches — that is indecision dressed as choice.' },
      { q: 'Can you refresh rather than replace?', a: 'Yes. Many of our best projects are evolutions that keep years of recognition intact while fixing the parts that no longer work.' }
    ]
  },
  {
    slug: 'seo',
    name: 'SEO & Organic Growth',
    short: 'SEO',
    icon: 'search',
    image: '/img/service-growth.jpg',
    blurb: 'Search visibility built on structure, content and patience.',
    lede: 'Technical SEO, on-page work, content architecture and local visibility — measured in qualified sessions and enquiries, not vanity rankings.',
    process: [
      { title: 'Technical audit', text: 'Crawl, index, render, canonicals, schema, internal links and Core Web Vitals.' },
      { title: 'Keyword & intent map', text: 'Topics organised by intent, mapped to existing or new URLs, with a priority score.' },
      { title: 'Execute', text: 'Fix, publish, internally link and earn authority. Monthly, in that order.' },
      { title: 'Report', text: 'Rank, traffic, conversions and revenue — with the work that caused each movement.' }
    ],
    faqs: [
      { q: 'How long before SEO works?', a: 'Meaningful movement usually appears in 8–12 weeks; compounding results in 6–9 months. Anyone promising page one in 30 days is selling something else.' },
      { q: 'Do you guarantee rankings?', a: 'No. We guarantee the work — audits, fixes, content, links — and report honestly. Guaranteed positions are a red flag in this industry.' },
      { q: 'Is local SEO different?', a: 'Yes. Google Business Profile, locality pages, reviews and local citations matter as much as the website. We run both together.' }
    ]
  },
  {
    slug: 'marketing',
    name: 'Performance Marketing',
    short: 'Performance',
    icon: 'megaphone',
    image: '/img/service-growth.jpg',
    blurb: 'Spend that can be traced to pipeline.',
    lede: 'Paid search, paid social, email and CRO — run as one acquisition system with a single measurement model.',
    process: [
      { title: 'Baseline & tracking', text: 'Fix conversion tracking first. Without clean data, every later decision is a guess.' },
      { title: 'Offer & audience', text: 'Message testing, audience design and landing pages built for the specific campaign.' },
      { title: 'Run & prune', text: 'Weekly spend reviews, creative rotation, negative keywords and budget moved to what works.' },
      { title: 'Scale', text: 'Only after unit economics hold. We scale winners and kill the rest without sentiment.' }
    ],
    faqs: [
      { q: 'What is the minimum ad budget?', a: 'We recommend at least ₹75,000–₹1,00,000 per month in media for Indian campaigns, so the platform has enough data to optimise. International budgets scale with the market.' },
      { q: 'Do you charge a percentage of spend?', a: 'No. A flat monthly fee keeps our incentive aligned with performance, not with spending more of your money.' },
      { q: 'How do you measure success?', a: 'Qualified leads or revenue — agreed before launch. CTR and impressions are diagnostics, not results.' }
    ]
  },
  {
    slug: 'social',
    name: 'Social Media',
    short: 'Social',
    icon: 'share',
    image: '/img/service-brand.jpg',
    blurb: 'A feed with a point of view.',
    lede: 'Strategy, creative, community and paid amplification — for brands that want to be recognised, not just present.',
    process: [
      { title: 'Channel strategy', text: 'Which platforms deserve effort, what each one is for, and the content pillars that support it.' },
      { title: 'Creative system', text: 'Templates, tone, typography and a shoot plan that keeps a month of content coherent.' },
      { title: 'Publish & engage', text: 'Calendar, scheduling, community replies and escalation rules.' },
      { title: 'Amplify', text: 'Boost the posts that earn attention; keep organic as the testing ground.' }
    ],
    faqs: [
      { q: 'How many posts a month?', a: 'Typical retainers cover 12–20 posts plus stories, with one short-form video batch. We would rather publish twelve good pieces than thirty forgettable ones.' },
      { q: 'Do you handle comments and DMs?', a: 'Yes, within agreed response windows and escalation rules. Sensitive issues route to your team, not to an agency intern.' },
      { q: 'Can you work with our in-house designer?', a: 'Often the best setup. We provide strategy and art direction; your team executes in brand.' }
    ]
  },
  {
    slug: 'content',
    name: 'Content & Editorial',
    short: 'Content',
    icon: 'doc',
    image: '/img/service-brand.jpg',
    blurb: 'Writing that earns the click and survives the read.',
    lede: 'Website copy, long-form articles, guest posts and editorial strategy — written by people who understand the subject.',
    process: [
      { title: 'Research', text: 'Interviews, SERP analysis, sales-call notes and competitor gaps.' },
      { title: 'Outline & angle', text: 'A point of view per piece, approved before drafting.' },
      { title: 'Draft & edit', text: 'Two editing passes, fact-check, and a readability check that is not just a score.' },
      { title: 'Distribute', text: 'Internal links, schema, social cuts and outreach where it fits.' }
    ],
    faqs: [
      { q: 'Do you use AI to write?', a: 'As a research and drafting aid, yes — always with a human edit, original reporting and a named editor. We do not publish unreviewed machine text.' },
      { q: 'Who writes technical content?', a: 'Specialist writers briefed by your subject experts. We record the interview and turn it into copy you can defend.' },
      { q: 'How is content priced?', a: 'Per piece, scoped by research depth and length. Retainers reduce the per-article rate and reserve capacity each month.' }
    ]
  },
  {
    slug: 'care',
    name: 'Speed, Security & Care',
    short: 'Care',
    icon: 'shield',
    image: '/img/service-care.jpg',
    blurb: 'The unglamorous work that keeps a site valuable.',
    lede: 'Performance engineering, maintenance, backups, monitoring and security — so the site you paid for keeps earning.',
    process: [
      { title: 'Baseline', text: 'Real-user and lab metrics, uptime history, plugin and dependency inventory.' },
      { title: 'Stabilise', text: 'Patch, prune, cache, compress, monitor. Fix the things that break quietly.' },
      { title: 'Maintain', text: 'A monthly window for updates, testing and a rollback checkpoint.' },
      { title: 'Report', text: 'Uptime, Core Web Vitals, security events and what changed.' }
    ],
    faqs: [
      { q: 'What does a care plan include?', a: 'Updates, backups, uptime and security monitoring, a monthly performance check, small content changes and priority support.' },
      { q: 'What counts as an emergency?', a: 'Site down, suspected breach, payment failure or a broken checkout. Those are handled first, within the response window in your plan.' },
      { q: 'Can you take over an abandoned site?', a: 'Yes. We start with a forensic audit and a full backup before changing anything, then stabilise before improving.' }
    ]
  }
];

const services = [
  // ── Web design ────────────────────────────────────────────────
  {
    slug: 'website-design', category: 'web-design', icon: 'layout', featured: true,
    name: 'Website Design & Development',
    tagline: 'Your best salesperson, open 24/7.',
    summary: 'A considered, fast, mobile-first website that explains what you do and turns visitors into enquiries.',
    body: [
      `Most business websites fail for the same reason: they describe the company instead of answering the visitor's question. We start from the visitor — what they need to believe before they call you — and build the page order, copy and proof around that.`,
      `Design and engineering happen together. Type, grid and motion are set in the browser, not just in a design file, so what launches is what you approved: responsive, accessible, and fast on a mid-range phone on a weak connection.`
    ],
    deliverables: ['Discovery workshop and sitemap', 'Two design directions, one refined', 'Responsive build on a CMS', 'Copy editing and image direction', 'Analytics, schema and launch checklist'],
    bestFor: 'Businesses whose current site undersells them or cannot be edited without a developer.',
    timeline: '3–6 weeks',
    priceFrom: '₹75,000'
  },
  {
    slug: 'corporate-website-design', category: 'web-design', icon: 'briefcase',
    name: 'Corporate & Business Websites',
    tagline: 'Credibility at the scale you operate.',
    summary: 'Multi-section corporate sites for companies with several divisions, geographies or stakeholder groups.',
    body: [
      `A corporate site has to serve investors, recruits, buyers and regulators at once — usually without a content team to keep it current. We build a clear information architecture and a CMS model that lets each division own its section without breaking the design system.`,
      `The result is a site that stays coherent as it grows: shared components, governance rules, and templates that non-designers can use without producing a page that looks like a different company.`
    ],
    deliverables: ['Stakeholder and audience mapping', 'Multi-division information architecture', 'Design system and page templates', 'CMS roles and publishing workflow', 'Annual report and IR-ready components'],
    bestFor: 'Groups, manufacturers and service companies with multiple business lines.',
    timeline: '6–10 weeks',
    priceFrom: '₹1,75,000'
  },
  {
    slug: 'ui-ux-design', category: 'web-design', icon: 'monitor', featured: true,
    name: 'UI/UX Design',
    tagline: 'Make the product feel inevitable.',
    summary: 'Research-led interface and experience design for websites, dashboards and digital products.',
    body: [
      `Good UX is mostly the removal of doubt. We map the user's job, find where the current flow asks them to think unnecessarily, and redesign the sequence before touching the visuals.`,
      `Then we build the interface as a system — type scale, spacing, states, error messages, empty states — and hand over components a developer can implement without guessing.`
    ],
    deliverables: ['User and task research', 'Journey maps and flow diagrams', 'Wireframes and clickable prototype', 'Visual design system with states', 'Developer handover and QA'],
    bestFor: 'SaaS products, portals and internal tools with confused or underperforming flows.',
    timeline: '4–8 weeks',
    priceFrom: '₹1,25,000'
  },
  {
    slug: 'landing-page-design', category: 'web-design', icon: 'target',
    name: 'Landing Page Design',
    tagline: 'One page, one decision.',
    summary: 'Campaign and conversion pages built around a single offer, with tracking that proves the result.',
    body: [
      `A landing page is not a small website. It is an argument in a fixed order: relevance, proof, offer, objection handling, action. We write and design that argument for the specific traffic source it will receive.`,
      `Every page ships with event tracking on the form, CTA and scroll depth, plus a test plan. When the numbers disappoint, you know which section to fix instead of rebuilding the whole page.`
    ],
    deliverables: ['Offer and message hierarchy', 'Conversion-focused page design', 'Responsive build and form integration', 'Event and conversion tracking', 'A/B test roadmap'],
    bestFor: 'Paid campaigns, product launches and lead-generation offers.',
    timeline: '1–2 weeks',
    priceFrom: '₹35,000'
  },
  {
    slug: 'website-redesign', category: 'web-design', icon: 'spark',
    name: 'Website Redesign',
    tagline: 'Keep the equity. Lose the debt.',
    summary: 'A rebuild that preserves rankings, content and brand recognition while fixing what no longer works.',
    body: [
      `Redesigns go wrong when they are treated as a visual exercise. We begin with performance, structure and content — what ranks, what converts, what nobody reads — and carry that evidence into the new design.`,
      `Migration is planned like surgery: URL mapping, redirects, staged QA, analytics continuity and a rollback point. Your traffic should not notice the change; your conversion rate should.`
    ],
    deliverables: ['Content and SEO inventory', 'URL and redirect map', 'New design system', 'Staged migration and QA', 'Post-launch performance watch'],
    bestFor: 'Sites that look dated, load slowly or have grown past their original structure.',
    timeline: '5–9 weeks',
    priceFrom: '₹95,000'
  },

  // ── E-commerce ────────────────────────────────────────────────
  {
    slug: 'shopify-development', category: 'ecommerce', icon: 'cart', featured: true,
    name: 'Shopify Store Development',
    tagline: 'Launch fast. Look nothing like a template.',
    summary: 'Custom Shopify storefronts with clean catalogue architecture, strong product pages and reliable integrations.',
    body: [
      `Shopify gives you a dependable engine; the theme decides whether anyone stays. We build custom storefronts — or heavily art-direct an existing theme — around the way your products actually need to be compared, configured and bought.`,
      `Beyond the storefront we handle the operational layer: payments, shipping rules, tax, ERP or inventory sync, email flows and analytics, tested with real orders before launch.`
    ],
    deliverables: ['Custom or art-directed theme', 'Catalogue, filter and search setup', 'Product page conversion design', 'Payments, shipping and app integrations', 'Analytics, feeds and launch QA'],
    bestFor: 'D2C brands moving off a marketplace or a generic theme.',
    timeline: '3–6 weeks',
    priceFrom: '₹85,000'
  },
  {
    slug: 'woocommerce-development', category: 'ecommerce', icon: 'wp',
    name: 'WooCommerce Development',
    tagline: 'Commerce with room for custom logic.',
    summary: 'WooCommerce builds for catalogues, pricing rules and content models that Shopify cannot bend to fit.',
    body: [
      `WooCommerce wins when your business has awkward requirements: dealer pricing, quotation flows, variable tax, subscription parts, or a catalogue that doubles as a technical library.`,
      `We keep it fast and maintainable — lean plugin stack, custom checkout where needed, object caching and a staging environment — because WooCommerce sites fail through accumulated plugins, not the platform itself.`
    ],
    deliverables: ['Custom theme and product templates', 'Dealer and role-based pricing', 'Payment, shipping and tax configuration', 'Performance and caching setup', 'Migration and launch support'],
    bestFor: 'B2B catalogues, wholesalers and content-heavy stores.',
    timeline: '4–8 weeks',
    priceFrom: '₹95,000'
  },
  {
    slug: 'magento-development', category: 'ecommerce', icon: 'layers',
    name: 'Magento Development',
    tagline: 'For catalogues that have outgrown simple.',
    summary: 'Magento and Adobe Commerce builds for large, multi-store and multi-currency operations.',
    body: [
      `Magento earns its complexity when you run thousands of SKUs, several storefronts and countries, or complex B2B pricing. Below that threshold it is expensive maintenance for features you will not use.`,
      `We handle architecture, theme, module development and performance tuning — including the indexing, caching and search configuration that decide whether a Magento store feels fast or fights you daily.`
    ],
    deliverables: ['Store architecture and multi-store setup', 'Theme and module development', 'ERP, PIM and payment integration', 'Search, indexing and cache tuning', 'Upgrade and support planning'],
    bestFor: 'Large multi-store retailers and B2B distributors.',
    timeline: '8–14 weeks',
    priceFrom: '₹3,50,000'
  },
  {
    slug: 'opencart-development', category: 'ecommerce', icon: 'bag',
    name: 'OpenCart Development',
    tagline: 'Lean commerce for a focused catalogue.',
    summary: 'OpenCart builds, extensions and upgrades for businesses that want a straightforward store.',
    body: [
      `OpenCart suits small and mid-sized catalogues where the requirement is simple: products, orders, payments, shipping, done. It is lightweight and inexpensive to host.`,
      `The usual problem is a decade of extensions on an unpatched core. We rebuild or upgrade cleanly, replace abandoned extensions with maintained code, and put a backup and update routine in place.`
    ],
    deliverables: ['Theme build or refresh', 'Extension audit and replacement', 'Payment and shipping setup', 'Version upgrade and data migration', 'Backup and maintenance routine'],
    bestFor: 'Small retailers and regional stores with a stable SKU count.',
    timeline: '2–4 weeks',
    priceFrom: '₹45,000'
  },

  // ── WordPress / CMS ───────────────────────────────────────────
  {
    slug: 'wordpress-development', category: 'cms', icon: 'wp', featured: true,
    name: 'WordPress Development',
    tagline: 'The CMS, without the baggage.',
    summary: 'Custom WordPress themes and blocks built for editing speed, clean markup and long-term maintenance.',
    body: [
      `We build WordPress the way it should be built: custom theme, native blocks, custom fields, no page-builder bloat, and a plugin list short enough to audit.`,
      `Editors get a predictable interface; developers get clean templates. The site stays fast because nothing is loading three copies of jQuery to render a heading.`
    ],
    deliverables: ['Custom theme and block library', 'Custom post types and fields', 'Editor-friendly templates', 'Staging, backups and security baseline', 'Admin training and documentation'],
    bestFor: 'Marketing teams that publish weekly and want control without fragility.',
    timeline: '3–6 weeks',
    priceFrom: '₹65,000'
  },
  {
    slug: 'wordpress-speed-optimization', category: 'cms', icon: 'speed',
    name: 'WordPress Speed Optimisation',
    tagline: 'Fast is a feature.',
    summary: 'A measured programme to cut load time, stabilise Core Web Vitals and keep them there.',
    body: [
      `We do not install a caching plugin and call it optimisation. We measure the render path, find what is actually blocking it — fonts, unoptimised images, render-blocking scripts, slow database queries — and fix the causes.`,
      `Typical outcomes are a 40–70% improvement in LCP and a large drop in layout shift, without removing functionality or redesigning the site.`
    ],
    deliverables: ['Full performance audit', 'Critical CSS and script strategy', 'Image and font optimisation', 'Caching and database cleanup', 'Monthly Core Web Vitals monitoring'],
    bestFor: 'WordPress sites that feel slow on mobile and lose conversions.',
    timeline: '2–3 weeks',
    priceFrom: '₹40,000'
  },
  {
    slug: 'wordpress-support', category: 'cms', icon: 'shieldCheck',
    name: 'WordPress Support & Maintenance',
    tagline: 'Somebody who knows the site.',
    summary: 'Updates, fixes, backups and small changes handled by the team that understands the build.',
    body: [
      `WordPress sites decay quietly: core updates, abandoned plugins, PHP version changes, certificates. A monthly maintenance window catches those before they become an outage.`,
      `Support includes the small work that otherwise waits weeks — a new banner, a page edit, a form fix — with a clear monthly allowance instead of hourly surprises.`
    ],
    deliverables: ['Core, theme and plugin updates', 'Off-site backups and restore tests', 'Security and uptime monitoring', 'Monthly content-change allowance', 'Performance and health report'],
    bestFor: 'Businesses without an in-house developer but with a site that matters.',
    timeline: 'Monthly retainer',
    priceFrom: '₹12,000 / month'
  },
  {
    slug: 'wordpress-migration', category: 'cms', icon: 'download',
    name: 'WordPress Migration',
    tagline: 'Move the site. Keep the rankings.',
    summary: 'Hosting, domain and platform migrations executed with redirects, QA and zero lost content.',
    body: [
      `A migration is mostly risk management. We inventory content and URLs, build a redirect map, replicate the site on the target environment and test forms, payments and tracking before DNS moves.`,
      `After the switch we monitor crawl errors, rankings and uptime for 30 days — the period when most migrations quietly break something.`
    ],
    deliverables: ['Content and URL inventory', 'Redirect map and canonical checks', 'Staging migration and QA', 'DNS cutover plan and rollback', '30-day post-migration monitoring'],
    bestFor: 'Host changes, domain consolidations and replatforming to WordPress.',
    timeline: '1–3 weeks',
    priceFrom: '₹35,000'
  },

  // ── Apps ──────────────────────────────────────────────────────
  {
    slug: 'ios-app-development', category: 'apps', icon: 'phone',
    name: 'iOS App Development',
    tagline: 'Built for the platform, not ported to it.',
    summary: 'Swift and SwiftUI apps designed around iOS conventions, performance and App Store review.',
    body: [
      `iOS users notice when an app feels foreign. We build with native patterns — navigation, gestures, typography, accessibility — and test on the oldest device you intend to support.`,
      `We also handle the parts teams underestimate: App Store metadata, privacy declarations, review responses and a release process that does not panic every update.`
    ],
    deliverables: ['Product and technical discovery', 'SwiftUI / UIKit implementation', 'API integration and offline handling', 'App Store submission and assets', 'Crash monitoring and release plan'],
    bestFor: 'Consumer and field-service apps where polish and reliability matter.',
    timeline: '8–14 weeks',
    priceFrom: '₹4,00,000'
  },
  {
    slug: 'android-app-development', category: 'apps', icon: 'phone',
    name: 'Android App Development',
    tagline: 'Performance across the devices people actually use.',
    summary: 'Kotlin apps tested across screen sizes, OS versions and the mid-range hardware that dominates the market.',
    body: [
      `Android is a breadth problem. We test on realistic devices and network conditions, not just the newest flagship, and tune memory, startup time and battery behaviour accordingly.`,
      `Play Store release management, staged rollouts and crash triage are part of the build, not an afterthought.`
    ],
    deliverables: ['Kotlin / Jetpack Compose build', 'Device and OS compatibility matrix', 'API integration and local storage', 'Play Store release and rollout plan', 'Analytics and crash reporting'],
    bestFor: 'Apps for Indian and international markets with varied device fleets.',
    timeline: '8–14 weeks',
    priceFrom: '₹3,50,000'
  },
  {
    slug: 'flutter-app-development', category: 'apps', icon: 'layers', featured: true,
    name: 'Flutter App Development',
    tagline: 'One codebase. Two stores. No compromise.',
    summary: 'Cross-platform apps with native-feeling interfaces, shared logic and a single release process.',
    body: [
      `Flutter is our default for business apps: one codebase, consistent UI, and a build pipeline that ships to both stores on the same day.`,
      `We are honest about the limits — heavy platform-specific integrations and some graphics workloads still favour native — and we say so during scoping rather than after the invoice.`
    ],
    deliverables: ['Cross-platform architecture', 'Custom widget and design system', 'API, auth and offline sync', 'iOS and Android store releases', 'Maintenance and upgrade plan'],
    bestFor: 'MVPs and business apps that need both platforms quickly.',
    timeline: '6–12 weeks',
    priceFrom: '₹3,00,000'
  },
  {
    slug: 'react-native-app-development', category: 'apps', icon: 'code',
    name: 'React Native App Development',
    tagline: 'Your web team can help maintain it.',
    summary: 'React Native builds that reuse JavaScript skills, share logic with the web app and ship natively.',
    body: [
      `React Native makes sense when you already have a React web team or a large JavaScript codebase. Shared types, shared API clients and one hiring profile reduce long-term cost.`,
      `We keep the native layer disciplined — navigation, performance and platform integrations — so the app does not feel like a website in a wrapper.`
    ],
    deliverables: ['React Native architecture', 'Shared API and state layer', 'Native module integration', 'Store release and CI pipeline', 'Performance profiling'],
    bestFor: 'Product teams with existing React capability.',
    timeline: '6–12 weeks',
    priceFrom: '₹3,00,000'
  },

  // ── Branding ──────────────────────────────────────────────────
  {
    slug: 'logo-brand-identity', category: 'branding', icon: 'spark', featured: true,
    name: 'Logo & Brand Identity',
    tagline: 'A mark, and the system around it.',
    summary: 'Positioning, naming support, logo, identity system and the guidelines that keep it consistent.',
    body: [
      `A logo is the smallest part of a brand. We start with positioning — who you serve, what you promise, how you should feel next to competitors — then design an identity that expresses it across every surface.`,
      `You receive a system, not a file: colour, type, grid, photography direction, iconography and usage rules, with editable templates for the things your team makes every week.`
    ],
    deliverables: ['Positioning and competitor review', 'Two identity directions', 'Logo suite and responsive marks', 'Colour, type and layout system', 'Brand guidelines and templates'],
    bestFor: 'New ventures, rebrands and companies that have outgrown a homemade identity.',
    timeline: '4–7 weeks',
    priceFrom: '₹85,000'
  },
  {
    slug: 'brochure-design', category: 'branding', icon: 'doc',
    name: 'Brochure & Print Design',
    tagline: 'Print that still works when the screen is off.',
    summary: 'Company profiles, product catalogues, annual reports and event collateral designed for the press.',
    body: [
      `Print demands different discipline: paper, ink, fold, bleed, and a layout that reads in the hand rather than on a 27-inch monitor.`,
      `We handle the full production file — CMYK, preflight, press-ready PDFs — and coordinate with printers so the first proof is not the first surprise.`
    ],
    deliverables: ['Content structure and copy edit', 'Cover and spread design', 'Image retouching and diagrams', 'Press-ready production files', 'Print coordination and proofing'],
    bestFor: 'Company profiles, catalogues, annual reports and trade-show material.',
    timeline: '2–4 weeks',
    priceFrom: '₹35,000'
  },
  {
    slug: 'packaging-design', category: 'branding', icon: 'bag',
    name: 'Packaging Design',
    tagline: 'The shelf is the first impression.',
    summary: 'Structural and surface packaging design that reads clearly at two metres and complies with labelling rules.',
    body: [
      `Packaging has three jobs at once: attract, explain and comply. We design the hierarchy so the brand is recognisable at shelf distance, the product benefit is legible in the hand, and the mandatory information is correct.`,
      `We produce dielines, artwork and print-ready files, and work with your converter on material and finish so the mockup resembles the manufactured pack.`
    ],
    deliverables: ['Category and shelf audit', 'Structural dielines', 'Front-of-pack hierarchy', 'Compliance and barcode layout', 'Print-ready artwork and press check'],
    bestFor: 'FMCG, food, cosmetics and D2C products entering retail.',
    timeline: '3–5 weeks',
    priceFrom: '₹55,000'
  },
  {
    slug: 'graphic-design', category: 'branding', icon: 'brush',
    name: 'Graphic Design',
    tagline: 'Everyday assets, held to a standard.',
    summary: 'Social creatives, decks, event graphics, infographics and campaign assets produced on a consistent system.',
    body: [
      `Most brands do not fail at the logo; they fail at the hundred small things made in a hurry. We build templates and a production routine so everyday design stays on-brand.`,
      `For campaigns we can take the whole set — key visual, adaptations, deck, print, social cuts — and deliver in formats your team can actually use.`
    ],
    deliverables: ['Campaign key visual', 'Social and display adaptations', 'Presentation and pitch decks', 'Infographics and diagrams', 'Editable source files and templates'],
    bestFor: 'Marketing teams with steady production needs and no in-house designer.',
    timeline: '1–3 weeks',
    priceFrom: '₹25,000'
  },
  {
    slug: 'video-editing', category: 'branding', icon: 'film',
    name: 'Video Editing & Motion Graphics',
    tagline: 'Short, sharp, subtitled.',
    summary: 'Brand films, product videos, reels and animated explainers edited for the platform they live on.',
    body: [
      `Video is watched silent, vertical and briefly. We edit for that reality: a hook in the first two seconds, captions burned in, and a cut that makes sense without sound.`,
      `Motion graphics are built from your identity system, so animated titles and lower-thirds look like the same brand rather than a stock template.`
    ],
    deliverables: ['Script and shot plan', 'Edit, colour and sound', 'Motion graphics package', 'Captions and platform exports', 'Thumbnail and cover assets'],
    bestFor: 'Product launches, brand films, social reels and explainers.',
    timeline: '2–4 weeks',
    priceFrom: '₹45,000'
  },

  // ── SEO ───────────────────────────────────────────────────────
  {
    slug: 'seo-services', category: 'seo', icon: 'search', featured: true,
    name: 'SEO Services',
    tagline: 'Be found by people already looking.',
    summary: 'A complete organic programme: technical foundation, content architecture, authority and reporting.',
    body: [
      `SEO is not a checklist. It is the cumulative result of a site that can be crawled, pages that answer a real query better than the alternatives, and enough authority for Google to trust them.`,
      `We work in that order, month by month, and report what changed and why. If a tactic cannot be explained to your board in one sentence, we do not use it.`
    ],
    deliverables: ['Technical audit and fixes', 'Keyword and intent map', 'Content plan and briefs', 'Internal linking and schema', 'Monthly performance reporting'],
    bestFor: 'Businesses with a useful product and no organic visibility.',
    timeline: '6-month programme',
    priceFrom: '₹45,000 / month'
  },
  {
    slug: 'on-page-seo', category: 'seo', icon: 'doc',
    name: 'On-Page SEO',
    tagline: 'Make every page earn its place.',
    summary: 'Titles, headings, content, internal links and schema aligned to search intent, page by page.',
    body: [
      `On-page work is where most sites leave money on the table: pages targeting the wrong intent, duplicate titles, thin service descriptions, no internal links between related offers.`,
      `We audit at template level, fix the pattern once, then work through priority pages individually — because a fix applied to 400 pages is worth more than 40 manual tweaks.`
    ],
    deliverables: ['Template-level audit', 'Title, meta and heading rewrites', 'Content gap and depth fixes', 'Internal linking model', 'Structured data implementation'],
    bestFor: 'Sites with traffic but poor rankings for commercial terms.',
    timeline: '3–6 weeks',
    priceFrom: '₹40,000'
  },
  {
    slug: 'off-page-seo', category: 'seo', icon: 'link',
    name: 'Off-Page SEO & Link Building',
    tagline: 'Authority earned, not bought in bulk.',
    summary: 'Digital PR, editorial links, citations and brand mentions that survive an algorithm update.',
    body: [
      `Link building has a bad reputation because most of it is bought. We earn links the slow way: useful resources, expert commentary, local partnerships and genuine PR.`,
      `Every placement is vetted for relevance, traffic and spam signals. We would rather deliver five links that matter than fifty that put the domain at risk.`
    ],
    deliverables: ['Backlink and competitor gap audit', 'Digital PR angles and outreach', 'Editorial link acquisition', 'Citation and directory cleanup', 'Toxic link disavow where needed'],
    bestFor: 'Established sites that have plateaued on content alone.',
    timeline: 'Monthly retainer',
    priceFrom: '₹35,000 / month'
  },
  {
    slug: 'local-seo', category: 'seo', icon: 'pin', featured: true,
    name: 'Local SEO',
    tagline: 'Own the map, not just the results.',
    summary: 'Google Business Profile, location pages, reviews and local citations that drive calls and visits.',
    body: [
      `Local search is a different game: proximity, profile completeness, review velocity and consistent name-address-phone data decide who appears in the map pack.`,
      `We optimise the profile, build genuinely useful location pages — not one template with the city swapped — and put a review routine in place that your team can sustain.`
    ],
    deliverables: ['Google Business Profile optimisation', 'Location page architecture', 'Review generation system', 'Citation and NAP consistency', 'Local rank and call tracking'],
    bestFor: 'Multi-location businesses, clinics, studios, dealers and service areas.',
    timeline: '3-month setup',
    priceFrom: '₹30,000 / month'
  },
  {
    slug: 'seo-audit', category: 'seo', icon: 'chart',
    name: 'SEO Audit',
    tagline: 'A diagnosis, not a 90-page export.',
    summary: 'A prioritised technical and content audit with the fixes ranked by impact and effort.',
    body: [
      `Most audits are tool exports with a cover page. Ours is written: what is broken, what it costs you, what to fix first, and what to ignore.`,
      `You get a crawl analysis, index and canonical review, Core Web Vitals, content and intent gaps, backlink profile, and a sequenced 90-day action plan you can hand to any developer.`
    ],
    deliverables: ['Full crawl and index analysis', 'Core Web Vitals review', 'Content and keyword gap analysis', 'Backlink profile assessment', 'Prioritised 90-day action plan'],
    bestFor: 'Teams inheriting a site or starting a new SEO programme.',
    timeline: '1–2 weeks',
    priceFrom: '₹45,000'
  },
  {
    slug: 'orm', category: 'seo', icon: 'eye',
    name: 'Online Reputation Management',
    tagline: 'What people find when they search your name.',
    summary: 'Monitoring, review strategy and content that puts your side of the story on page one.',
    body: [
      `Reputation problems are search problems. A single review or forum thread can outrank your own homepage for your brand name.`,
      `We monitor mentions, build a review-response routine, and create owned and earned content that competes for branded queries — legally and honestly.`
    ],
    deliverables: ['Brand SERP audit', 'Mention monitoring setup', 'Review response playbook', 'Owned content for branded queries', 'Escalation and crisis plan'],
    bestFor: 'Brands with negative results or no control over their brand SERP.',
    timeline: '3-month programme',
    priceFrom: '₹40,000 / month'
  },

  // ── Performance marketing ─────────────────────────────────────
  {
    slug: 'digital-marketing-strategy', category: 'marketing', icon: 'compass',
    name: 'Digital Marketing Strategy',
    tagline: 'A plan you can actually run.',
    summary: 'Audience, offer, channel mix, budget and measurement defined before anyone spends a rupee.',
    body: [
      `Strategy is the part most agencies skip because it is hard to invoice. We start with your unit economics and sales process, then decide which channels can realistically produce a customer at a viable cost.`,
      `The output is a working document: priorities, budget split, targets, reporting cadence and the decisions we will revisit in 90 days.`
    ],
    deliverables: ['Market and competitor review', 'Audience and offer definition', 'Channel and budget plan', 'Measurement framework', '90-day roadmap and targets'],
    bestFor: 'Brands spending on marketing without a clear acquisition model.',
    timeline: '3–4 weeks',
    priceFrom: '₹60,000'
  },
  {
    slug: 'ppc-google-ads', category: 'marketing', icon: 'target', featured: true,
    name: 'PPC & Google Ads',
    tagline: 'Buy attention where intent already exists.',
    summary: 'Search, shopping, display and YouTube campaigns managed against cost per qualified lead.',
    body: [
      `Search ads are the closest thing to a measurable sales channel. The work is unglamorous: tight keyword groups, honest landing pages, negative keyword hygiene and a landing page that matches the ad.`,
      `We report on qualified leads or revenue, not clicks. If the account cannot beat the economics you need, we will say so.`
    ],
    deliverables: ['Account structure and tracking', 'Keyword and competitor research', 'Ad copy and asset testing', 'Landing page alignment', 'Weekly optimisation and reporting'],
    bestFor: 'Businesses with proven demand and a clear customer value.',
    timeline: 'Monthly retainer',
    priceFrom: '₹30,000 / month + media'
  },
  {
    slug: 'social-media-advertising', category: 'marketing', icon: 'megaphone',
    name: 'Social Media Advertising',
    tagline: 'Creative-led paid social.',
    summary: 'Meta, LinkedIn and YouTube campaigns built around creative testing and clean conversion data.',
    body: [
      `On paid social the creative does most of the work. We produce variants, test hooks and formats, and kill losers quickly instead of scaling a comfortable ad into fatigue.`,
      `Pixel and server-side tracking are set up properly before spend scales, so the algorithm optimises for the event that actually matters.`
    ],
    deliverables: ['Campaign and audience structure', 'Creative concepts and variants', 'Pixel and server-side tracking', 'Weekly testing and scaling', 'Creative performance reporting'],
    bestFor: 'D2C, B2B lead generation and app installs.',
    timeline: 'Monthly retainer',
    priceFrom: '₹30,000 / month + media'
  },
  {
    slug: 'email-marketing', category: 'marketing', icon: 'mail',
    name: 'Email Marketing',
    tagline: 'The channel you own.',
    summary: 'Lifecycle flows, campaigns and list growth that turn customers into repeat buyers.',
    body: [
      `Email is the only acquisition channel you control outright. It also decays fast if it is only ever a discount blast.`,
      `We build the flows that do the quiet work — welcome, abandoned cart, post-purchase, win-back — then layer campaigns on top, with segmentation and deliverability handled properly.`
    ],
    deliverables: ['List and segmentation audit', 'Lifecycle flow design', 'Campaign calendar and templates', 'Deliverability and authentication', 'Revenue reporting'],
    bestFor: 'E-commerce and subscription businesses with a customer list.',
    timeline: '3–5 weeks',
    priceFrom: '₹40,000'
  },
  {
    slug: 'cro', category: 'marketing', icon: 'chart',
    name: 'Conversion Rate Optimisation',
    tagline: 'More from the traffic you already have.',
    summary: 'Research, hypotheses, tests and analysis aimed at lifting conversion without buying more clicks.',
    body: [
      `CRO begins with evidence: session recordings, funnel data, customer interviews and a prioritised hypothesis backlog. Then we test, one meaningful change at a time.`,
      `We are honest about statistical power — small sites often need sequential testing or qualitative fixes rather than a monthly A/B test ritual.`
    ],
    deliverables: ['Funnel and session analysis', 'Customer and objection research', 'Prioritised test backlog', 'Test design and implementation', 'Results analysis and rollout'],
    bestFor: 'Sites with steady traffic and a conversion rate stuck below benchmark.',
    timeline: '2–3 months',
    priceFrom: '₹50,000 / month'
  },
  {
    slug: 'lead-generation', category: 'marketing', icon: 'users',
    name: 'Lead Generation',
    tagline: 'Pipeline, not form fills.',
    summary: 'Multi-channel lead programmes with qualification, routing and follow-up built in.',
    body: [
      `A lead is only worth what happens next. We design the capture, qualification and routing together, so sales receives context instead of a name and an email.`,
      `Depending on the market, that means landing pages, paid search, LinkedIn, content offers or outbound — chosen by where your buyer actually spends attention.`
    ],
    deliverables: ['ICP and offer definition', 'Landing pages and lead magnets', 'Qualification and scoring rules', 'CRM routing and automation', 'Cost-per-qualified-lead reporting'],
    bestFor: 'B2B services and high-consideration purchases.',
    timeline: '4–8 weeks',
    priceFrom: '₹75,000'
  },

  // ── Social ────────────────────────────────────────────────────
  {
    slug: 'social-media-management', category: 'social', icon: 'share', featured: true,
    name: 'Social Media Management',
    tagline: 'Consistent, not constant.',
    summary: 'Strategy, calendar, publishing and community management for brands that want a recognisable feed.',
    body: [
      `A good social presence is a system: a point of view, three or four content pillars, a repeatable visual language and someone answering comments like a human.`,
      `We run the calendar, produce or direct the assets, publish, and report on what earned attention — then do more of that.`
    ],
    deliverables: ['Channel strategy and pillars', 'Monthly content calendar', 'Design and caption production', 'Publishing and community replies', 'Monthly performance review'],
    bestFor: 'Brands posting inconsistently or handing the account to whoever is free.',
    timeline: 'Monthly retainer',
    priceFrom: '₹25,000 / month'
  },
  {
    slug: 'social-media-creatives', category: 'social', icon: 'camera',
    name: 'Social Media Creatives',
    tagline: 'Scrolling is a design problem.',
    summary: 'Static, carousel and short-form video assets built in a consistent brand system.',
    body: [
      `Most social creative is designed to look good in a grid and fails in the feed. We design for the thumb: a clear idea, one focal point, readable type at small size.`,
      `Templates keep production fast without making every post identical — and give your team a system when they need to publish without us.`
    ],
    deliverables: ['Art direction and templates', 'Static and carousel design', 'Short-form video edits', 'Story and highlight assets', 'Export kit for every placement'],
    bestFor: 'Teams with an active calendar and inconsistent visual quality.',
    timeline: '1–2 weeks',
    priceFrom: '₹20,000 / month'
  },
  {
    slug: 'influencer-marketing', category: 'social', icon: 'star',
    name: 'Influencer Marketing',
    tagline: 'Borrowed attention, properly briefed.',
    summary: 'Creator selection, briefing, contracting and measurement tied to actual business outcomes.',
    body: [
      `Follower count is the least useful metric in influencer marketing. We select creators for audience overlap, engagement quality and tone — then brief them well enough that the content does not feel like an advert.`,
      `Rights, usage, disclosure and measurement are agreed up front, so paid amplification and repurposing do not become a legal afterthought.`
    ],
    deliverables: ['Creator shortlist and vetting', 'Brief and concept development', 'Contracting and usage rights', 'Content review and approvals', 'Performance and ROI reporting'],
    bestFor: 'Consumer brands launching products or entering new markets.',
    timeline: '4–8 weeks',
    priceFrom: '₹60,000 + creator fees'
  },
  {
    slug: 'brand-campaigns', category: 'social', icon: 'spark',
    name: 'Brand Campaigns',
    tagline: 'One idea, every surface.',
    summary: 'Integrated campaigns — concept, key visual, content, media and measurement — launched as one system.',
    body: [
      `A campaign is a coordinated argument across channels. We develop the idea centrally, then adapt it properly for search, social, email, print and the landing page it all points to.`,
      `Success is defined before launch: awareness, consideration or conversion, with the metric and the measurement plan agreed in writing.`
    ],
    deliverables: ['Campaign concept and territory', 'Key visual and asset system', 'Channel adaptations', 'Media plan and launch schedule', 'Post-campaign measurement'],
    bestFor: 'Launches, festive moments, rebrands and market entry.',
    timeline: '4–8 weeks',
    priceFrom: '₹1,25,000'
  },

  // ── Content ───────────────────────────────────────────────────
  {
    slug: 'content-writing', category: 'content', icon: 'doc', featured: true,
    name: 'Content Writing',
    tagline: 'Copy that sounds like a person.',
    summary: 'Website copy, service pages, articles and case studies written with subject knowledge and an editor.',
    body: [
      `We write for two readers at once: the person deciding and the search engine indexing. The person comes first; the structure makes the rest follow.`,
      `Every piece is briefed, drafted, edited and fact-checked. If we do not understand the subject, we interview someone who does rather than paraphrasing a competitor.`
    ],
    deliverables: ['Content brief and outline', 'Draft with subject research', 'Two editorial passes', 'SEO structure and internal links', 'Final proofread and formatting'],
    bestFor: 'Service pages, blogs, case studies and thought leadership.',
    timeline: '1–2 weeks per batch',
    priceFrom: '₹4 / word'
  },
  {
    slug: 'guest-posting', category: 'content', icon: 'edit',
    name: 'Guest Posting & Outreach',
    tagline: 'Published where it counts.',
    summary: 'Editorially placed articles in relevant publications, with real bylines and real readers.',
    body: [
      `Guest posting works when the publication is actually read by your buyers. We build a shortlist by relevance and traffic, pitch a genuine angle, and write something worth publishing.`,
      `No link farms, no sponsored-post networks disguised as editorial. If a site sells links openly, we do not use it.`
    ],
    deliverables: ['Publication shortlist and vetting', 'Angle development and pitching', 'Article writing and editing', 'Editorial liaison and revisions', 'Published link and referral reporting'],
    bestFor: 'B2B brands building authority in a niche.',
    timeline: 'Monthly retainer',
    priceFrom: '₹30,000 / month'
  },
  {
    slug: 'content-strategy', category: 'content', icon: 'layers',
    name: 'Content Strategy',
    tagline: 'Decide what to publish, and what to stop.',
    summary: 'Topic architecture, audience mapping, formats and a publishing system your team can sustain.',
    body: [
      `Most content operations fail from volume without direction. We map the questions your buyers ask at each stage, audit what already exists, and design a topic architecture that compounds instead of scattering.`,
      `The deliverable includes editorial standards, a 90-day calendar and a measurement model — so content is judged by pipeline, not page views.`
    ],
    deliverables: ['Audience and intent mapping', 'Content audit and gap analysis', 'Topic architecture and clusters', 'Editorial standards and workflow', '90-day calendar and KPIs'],
    bestFor: 'Teams publishing regularly without traction.',
    timeline: '3–4 weeks',
    priceFrom: '₹55,000'
  },

  // ── Care ──────────────────────────────────────────────────────
  {
    slug: 'page-speed-optimization', category: 'care', icon: 'speed', featured: true,
    name: 'Page Speed Optimisation',
    tagline: 'Every 100ms is revenue.',
    summary: 'Performance engineering across front end, assets, fonts, images and hosting configuration.',
    body: [
      `Speed is a design and engineering outcome, not a plugin setting. We profile the critical path, measure real-user data, and fix the largest sources of delay first.`,
      `Targets are agreed in Core Web Vitals, not arbitrary scores: LCP under 2.5s, CLS under 0.1, INP under 200ms on a representative mobile device.`
    ],
    deliverables: ['Real-user and lab performance audit', 'Critical CSS and JS strategy', 'Image, font and asset optimisation', 'Caching, CDN and server tuning', 'Before/after Core Web Vitals report'],
    bestFor: 'Any site where mobile speed is costing conversions.',
    timeline: '2–4 weeks',
    priceFrom: '₹40,000'
  },
  {
    slug: 'website-maintenance', category: 'care', icon: 'shieldCheck',
    name: 'Website Maintenance',
    tagline: 'Nothing breaks quietly.',
    summary: 'Proactive updates, monitoring, backups and a monthly allowance for changes.',
    body: [
      `Websites are systems with dependencies, and dependencies age. A monthly maintenance window catches the failures that otherwise surface at the worst possible moment.`,
      `You get a named contact, a response window, and a report that says what changed — not a black box and an invoice.`
    ],
    deliverables: ['Updates and patch management', 'Daily backups with restore tests', 'Uptime and security monitoring', 'Monthly content-change hours', 'Health and performance report'],
    bestFor: 'Business-critical sites without in-house technical cover.',
    timeline: 'Monthly retainer',
    priceFrom: '₹10,000 / month'
  },
  {
    slug: 'website-security', category: 'care', icon: 'shield',
    name: 'Website Security & Backup',
    tagline: 'Assume something will try.',
    summary: 'Hardening, malware cleanup, WAF configuration and a recovery plan that has been tested.',
    body: [
      `Security is a routine, not a product. We harden the application, restrict access, monitor file changes and keep off-site backups that are actually restorable.`,
      `If a site is already compromised, we isolate it, clean it, find the entry point and close it — then monitor for reinfection instead of declaring victory after the scan.`
    ],
    deliverables: ['Security audit and hardening', 'Malware removal and root-cause fix', 'WAF and access rules', 'Off-site backup and restore test', 'Incident response plan'],
    bestFor: 'Sites handling customer data, payments or reputations.',
    timeline: '1–3 weeks',
    priceFrom: '₹30,000'
  }
];

module.exports = { categories, services };
