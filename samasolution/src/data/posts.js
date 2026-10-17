'use strict';

const posts = [
  {
    slug: 'why-your-website-is-slow',
    title: 'Why your website is slow — and what actually fixes it',
    category: 'Performance',
    cover: '/img/blog-1.jpg',
    excerpt: 'Most speed problems are not hosting problems. They are font, image and script decisions made months ago. Here is how to find the real cause.',
    published_at: '2026-09-24',
    read_minutes: 6,
    featured: true,
    body: `Every conversation about a slow website starts in the same place: someone suggests a better host. Sometimes that helps. More often you move servers, pay more, and the site still takes four seconds to show a headline.

The reason is that speed is decided long before the request reaches the server.

## Start with the critical path

Open the page on a throttled connection and watch what the browser must download before it can paint anything. Usually it is a render-blocking stylesheet, two font files, a third-party tag manager and a hero image that is 2400 pixels wide.

Those five things, not the hosting plan, decide your Largest Contentful Paint.

Measure first. Real-user data from Chrome UX Report or your analytics beats a lab score, because your visitors are not on a fast connection in a quiet room. Then fix in order of impact.

## The five fixes that usually matter

**1. Images.** Serve the right size, in a modern format, and stop lazy-loading the hero image. A 300 KB AVIF at the correct dimensions replaces a 1.8 MB JPEG without a visible quality difference.

**2. Fonts.** Two weights, self-hosted, with \`font-display: swap\` and a preload for the one file used above the fold. Every extra weight is another blocking request.

**3. Scripts.** Audit what runs on first load. Chat widgets, heat maps, A/B tools and four analytics tags often add more delay than the entire page's own JavaScript. Defer what can wait and delete what nobody uses.

**4. Critical CSS.** Inline the styles needed for the first screen and load the rest asynchronously. This is the single most reliable fix for a page that flashes blank for a second.

**5. Caching and compression.** Static assets get long-lived cache headers; HTML gets a short one. Brotli or gzip on text. A CDN helps most when your audience is far from the origin — which, for an Indian business selling abroad, is often the case.

## What does not fix it

Buying a "speed optimisation" plugin and enabling every checkbox. Preloading twenty assets. Moving to a bigger server when the bottleneck is a 3 MB hero video. Chasing a perfect Lighthouse score in a lab while real users wait.

> A score is a diagnostic. The number that matters is how long a real customer waits before they can read your offer.

## A realistic target

Aim for LCP under 2.5 seconds on a mid-range Android phone over 4G, CLS under 0.1, and INP under 200 milliseconds. Those are Google's "good" thresholds and they are achievable on a normal business site without rebuilding it.

If your site cannot get there, the problem is usually structural: a page builder generating two megabytes of CSS, or a theme loading every component whether the page uses it or not. In that case, fixing the theme beats optimising around it.`
  },
  {
    slug: 'local-seo-map-pack',
    title: 'Local SEO: what actually moves the map pack',
    category: 'SEO',
    cover: '/img/blog-2.jpg',
    excerpt: 'Proximity you cannot change. Relevance and prominence you can. A practical breakdown of the three inputs Google uses for local results.',
    published_at: '2026-08-18',
    read_minutes: 7,
    featured: true,
    body: `Local search looks simple from the outside: five businesses on a map, a few reviews, a phone number. Underneath, Google is balancing three things — proximity, relevance and prominence — and only two of them are yours to influence.

## The three inputs, honestly

**Proximity** is distance between the searcher and your location. You cannot optimise your way around it. If you serve a city from one office, you will not appear in the map pack at the far end of it. What you can do is build landing pages that rank in the organic results for those areas, even when the map pack is out of reach.

**Relevance** is how well your profile and site match the query. This is where most businesses are lazy. A profile with the category "Internet marketing service" and no services, no products and no description is telling Google almost nothing.

**Prominence** is reputation and authority: reviews, citations, links, brand mentions, and how consistently your name, address and phone number appear across the web.

## The profile work that pays

- Choose the most specific primary category available, then add secondary categories that reflect real services.
- List every service with a short description. This is free relevance.
- Add products with prices, even if the price is "from".
- Upload real photographs — exterior, interior, team, work. Stock images do nothing.
- Set hours accurately, including special hours. Wrong hours generate one-star reviews.
- Use the posts feature monthly. It is a weak ranking factor but a useful conversion surface.

## Reviews are a system, not a plea

A business with 40 recent reviews outranks a business with 200 old ones more often than people expect. Recency and velocity matter.

Build a routine: ask every satisfied customer at the moment the work is finished, send a direct link, reply to every review within 48 hours, and never buy reviews. Fake reviews are the fastest way to lose the profile entirely.

## Location pages need to be pages

This is the part that separates real local SEO from doorway spam.

A city page that swaps the name into an identical template adds nothing — Google has seen ten thousand of them. A city page that answers local questions does: which areas you serve, how delivery or onboarding works there, local project examples, local pricing or timelines, nearby locations, and a genuine FAQ.

> If the page would be equally useful with a different city name in the title, it is not a local page. It is a template.

## Measure the things that matter

Rankings and impressions are diagnostics. Track calls, direction requests, form fills and booked jobs by location. If the map pack improves and the phone does not ring, the problem is the offer or the profile, not the ranking.

## A 90-day sequence

Weeks 1–2: fix categories, services, hours, photos, NAP consistency. Weeks 3–6: rebuild the three most important location pages with genuine local content. Weeks 7–12: review generation, monthly posts, and citation cleanup. Then measure and repeat.`
  },
  {
    slug: 'shopify-vs-woocommerce-india',
    title: 'Shopify vs WooCommerce: an honest comparison for Indian brands',
    category: 'E-Commerce',
    cover: '/img/blog-3.jpg',
    excerpt: 'Not a feature table. A decision framework based on catalogue size, payment reality, in-house capability and five-year cost.',
    published_at: '2026-07-11',
    read_minutes: 8,
    featured: true,
    body: `Most "Shopify vs WooCommerce" articles compare feature checklists. That is not how the decision is actually made. The right choice depends on four things: how you sell, who maintains the store, what you can afford over five years, and how much custom logic your business needs.

## Where Shopify wins

**Speed to market.** A competent custom theme can launch in three to six weeks. Payments, tax, shipping labels, abandoned-cart flows and CDN are included or one click away.

**Operational simplicity.** No servers to patch, no plugin conflicts, no PHP upgrades. For a team without a developer, this is worth more than the subscription cost.

**Reliability under traffic.** A campaign that sends 50,000 visitors in an hour is a non-event. On a self-hosted store it is a fire drill.

**The app ecosystem.** Loyalty, subscriptions, reviews, returns — usually a monthly fee and a script tag, but genuinely quick to deploy.

## Where WooCommerce wins

**Awkward business rules.** Dealer pricing, quotation flows, GST complexity, composite products, or a catalogue that doubles as a technical library. WooCommerce bends; Shopify mostly does not.

**Content and SEO depth.** If your growth strategy depends on editorial content, programmatic landing pages and deep internal linking, WordPress is a stronger substrate. Shopify's blog is functional but limited.

**Ownership and marginal cost.** No platform fee on revenue, no transaction surcharge, full control of the codebase. At scale, the economics can favour self-hosting — if you have the team to run it.

## The five-year cost, roughly

Shopify: subscription plus apps plus theme plus payment fees. A serious store commonly lands between ₹1.5–4 lakh a year before media spend, depending on app stack.

WooCommerce: hosting, theme, plugins, and maintenance. Lower subscription, higher maintenance — someone has to own updates, security and performance.

The number that decides it is usually not the licence fee. It is the cost of the person who maintains the store.

## The Indian payment reality

Both platforms support Razorpay, PayU and Cashfree. The practical differences are in checkout conversion, UPI handling and COD reconciliation. Test a real order on a real phone before you commit. A checkout that fails on UPI loses more revenue than any design decision on this list.

## My default recommendation

- Catalogue under 2,000 SKUs, small team, growth led by paid ads: **Shopify**.
- Complex pricing, B2B, content-led growth, in-house WordPress capability: **WooCommerce**.
- Multi-store, multi-currency, thousands of SKUs with ERP: **Magento or Shopify Plus**, and budget accordingly.
- Very small catalogue, tight budget, simple operations: **OpenCart** is still viable, provided you keep it patched.

> Pick the platform your team can actually operate. The best store is the one that stays online, stays fast and gets updated on Monday morning.

## What matters more than the platform

Product photography. A clear returns policy. Delivery estimates that are true. Search that works. A checkout with three steps, not five. These decide conversion far more than the logo at the bottom of the admin panel.`
  },
  {
    slug: 'website-cost-india',
    title: 'What should a business website cost in India?',
    category: 'Strategy',
    cover: '/img/blog-1.jpg',
    excerpt: 'A transparent breakdown of what drives price — pages, templates, content, integrations and the invisible work most quotes leave out.',
    published_at: '2026-06-05',
    read_minutes: 6,
    featured: false,
    body: `Quotes for the same brief can range from ₹15,000 to ₹8 lakh. Both numbers can be honest. They are pricing different things.

Here is what actually moves the price.

## 1. Number of unique templates, not pages

A 40-page site built from six templates costs less than a 12-page site where every page is bespoke. Template count drives design and development effort; page count mostly drives content.

## 2. Content

Copywriting is the most commonly underestimated line item. A six-page site needs roughly 2,500–4,000 words of deliberate, edited copy. If the client supplies it, the quote drops. If the agency writes it, it should appear as a line item — not disappear into "design".

## 3. Integrations

A contact form is not an integration. CRM sync, ERP, payment gateways, subscription billing, multi-language, SSO and inventory feeds are. Each one needs an owner, error handling and testing. This is where budgets quietly double.

## 4. Performance and accessibility expectations

A template installed in a day will load in four seconds. A hand-built site with a performance budget, image pipeline and accessible components takes longer to build and costs more. It also converts better, which is rarely reflected in the quote comparison.

## 5. Who actually does the work

A senior freelancer, a small studio and a large agency have different overheads. You are not only buying hours; you are buying judgement, project management and the cost of someone being accountable when something breaks.

## Realistic Indian market bands

- **Brochure site, 5–8 pages, template-led:** ₹40,000–₹90,000.
- **Custom marketing site, 8–20 pages, CMS, copy support:** ₹1–3 lakh.
- **Corporate or multi-division site with design system:** ₹3–8 lakh.
- **E-commerce, 100–1,000 SKUs, custom theme:** ₹1.5–6 lakh.
- **Custom web application or portal:** ₹5 lakh upwards, scoped in phases.

These are 2026 Delhi-market ranges for professional work. You can find cheaper. You can also find more expensive. The band is not the quality signal; the scope behind it is.

## What a good quote contains

Deliverables, page or template count, content responsibility, revision rounds, timeline with dates, hosting and domain ownership, post-launch support window, and what is explicitly excluded.

> If a quote does not say what is excluded, assume it is excluded.

## The cheapest website is rarely the cheapest

A ₹25,000 site that cannot be edited, loads in five seconds and has no analytics costs more over three years than a ₹90,000 site that works. The first one gets rebuilt. The second one gets updated.

Spend the difference on content and performance, not on more pages.`
  },
  {
    slug: 'service-page-anatomy',
    title: 'The anatomy of a service page that converts',
    category: 'Web Design',
    cover: '/img/blog-2.jpg',
    excerpt: 'Nine blocks, in this order, with the reasoning behind each. A practical template for B2B service pages.',
    published_at: '2026-04-22',
    read_minutes: 5,
    featured: false,
    body: `Most service pages are a description of the service. A converting service page is an argument. The difference is structure.

Here is the order we use, and why.

## 1. A headline that states the outcome

Not "Digital Marketing Services". Something closer to "Be found by people already searching for what you sell." The headline should make the right visitor recognise themselves.

## 2. One sentence of proof or context

Who this is for, and what makes your approach different. Two lines maximum. This is where a visitor decides whether to keep reading.

## 3. The problem, in their words

Three or four sentences describing the situation the visitor is in. This is not manipulation — it is recognition. If you cannot describe their problem, they will not trust your solution.

## 4. What you actually do

Concrete deliverables, not adjectives. "Technical audit, keyword map, content briefs, monthly reporting" beats "holistic, best-in-class solutions".

## 5. How it works

Four steps, with what happens in each and how long it takes. Process reduces perceived risk more than credentials do.

## 6. Proof

Case studies, metrics, screenshots, logos, testimonials. Specific beats impressive. "Reduced LCP from 5.9s to 1.8s" is stronger than "improved performance".

## 7. Price signal

Even "projects start at ₹75,000" filters out mismatched enquiries and increases the quality of the ones that arrive. If you truly cannot publish a number, publish the shape of the engagement: fixed scope, retainer, or phased.

## 8. Objections

An FAQ that answers the three things people are actually worried about: how long, how much control do I have, what happens if it does not work.

## 9. One next step

A single, specific call to action. Not "contact us" in four places with three different forms. One action, repeated at natural pauses.

## The mistake most pages make

They put the company story first. Nobody arrives at a service page wanting your history. They arrive with a problem and a deadline. Earn the right to tell your story by solving the problem first.

## A quick test

Cover the logo and read the page. If it could belong to any of your competitors, it is not done.`
  },
  {
    slug: 'core-web-vitals-plain-english',
    title: 'Core Web Vitals, explained without the jargon',
    category: 'Performance',
    cover: '/img/blog-3.jpg',
    excerpt: 'LCP, INP and CLS — what they measure, why Google cares, and the practical fixes that move each one.',
    published_at: '2026-03-09',
    read_minutes: 6,
    featured: false,
    body: `Core Web Vitals are three measurements of how a page feels to use. They are not a score you chase for its own sake; they are a proxy for whether a real person can read and interact with your site without frustration.

## LCP — Largest Contentful Paint

**What it measures:** how long until the biggest element in the viewport is visible. Usually the hero image or the main heading.

**Why it matters:** it is the moment the page starts to feel real.

**Good:** under 2.5 seconds on mobile.

**What moves it:** compress and correctly size the hero image; serve AVIF or WebP; preload it; stop lazy-loading above-the-fold media; remove render-blocking CSS and fonts.

## INP — Interaction to Next Paint

**What it measures:** the delay between a user interaction — tap, click, key press — and the next visible response.

**Why it matters:** it is the difference between a site that feels responsive and one that feels broken on a mid-range phone.

**Good:** under 200 milliseconds.

**What moves it:** break up long JavaScript tasks; defer third-party scripts; avoid heavy hydration on pages that do not need it; remove chat widgets that load on first paint.

## CLS — Cumulative Layout Shift

**What it measures:** how much the page jumps around while loading.

**Why it matters:** a button that moves as you tap it is a lost conversion and a damaged trust signal.

**Good:** under 0.1.

**What moves it:** set explicit width and height on images and embeds; reserve space for ads and banners; avoid injecting content above existing content; use \`font-display: swap\` with a matched fallback metric.

## The part people miss

Lab tools like Lighthouse run on a fast machine with a simulated network. They are useful for diagnosis, but they are not your users. Field data — Chrome UX Report, or real-user monitoring — is what Google uses and what reflects your actual audience.

> Optimise for the 4G Android phone in a tier-2 city, not for the MacBook in your office.

## A sane order of work

1. Measure field data by template, not by whole site.
2. Fix images and fonts first — usually the largest and easiest wins.
3. Audit third-party scripts. Delete before optimising.
4. Fix layout shift on the templates that get the most traffic.
5. Re-measure after 28 days, because field data lags.

## What not to do

Do not chase 100/100. A site at 92 that loads in 1.9 seconds for real users is better than a 100 that only achieves it in a lab. Do not install three performance plugins that conflict with each other. Do not preload everything — preloading is a priority hint, and if everything is a priority, nothing is.`
  },
  {
    slug: 'meta-title-formulas',
    title: 'Writing meta titles people actually click',
    category: 'SEO',
    cover: '/img/blog-1.jpg',
    excerpt: 'Formulas, character limits and the three mistakes that waste a good ranking. With examples for service and location pages.',
    published_at: '2026-02-14',
    read_minutes: 5,
    featured: false,
    body: `A meta title has one job: earn the click from someone who is already searching. It is not a place to list keywords. It is a 60-character advertisement.

## The three mistakes

**1. Keyword stuffing.** "Web Design Company Delhi | Web Designing Delhi | Website Design Delhi" reads like spam and gets rewritten by Google more often than not.

**2. Ignoring the brand.** Unless you are Nike, put the brand at the end. The user is looking for a solution, not a logo.

**3. Duplicate titles across templates.** If 400 pages share a title, Google picks its own. That is a ranking and click-through loss you never see in a report.

## Four formulas that work

**Service + location:**
\`Website Design in Noida | Custom Sites, Built Fast\`

**Outcome + service:**
\`E-Commerce Development That Converts | Shopify & Woo\`

**Question + answer:**
\`How Much Does a Website Cost in India? | 2026 Rates\`

**Comparison:**
\`Shopify vs WooCommerce for Indian Brands | Honest Guide\`

Notice what they have in common: a specific promise, a qualifier, and no repeated keywords.

## The character budget

Google truncates by pixel width, not characters. As a rule, keep the title under 60 characters and the description under 155. Front-load the important phrase — mobile results cut earlier than desktop.

## Descriptions are not a ranking factor, but they are a conversion factor

A description should extend the title's promise, not repeat it. Include a concrete detail: a timeline, a price signal, a differentiator, a number.

> "Custom websites in 3–6 weeks. Fixed scope, hand-coded, CMS included. See recent work and pricing."

That earns more clicks than "We are a leading web design company in Noida with 10 years of experience."

## For location pages

The trap is generating 400 titles from one string. Vary the promise by market:

- Metro: \`Web Design Agency in Mumbai | Brand-Led, Performance-First\`
- Tier-2: \`Website Design in Indore | Fast, Mobile-First, Fixed Price\`
- International: \`Web Design for Dubai Businesses | Bilingual-Ready Sites\`

Same service, different buyer, different sentence.

## Test, then stop testing

Meta titles are cheap to change and easy to measure in Search Console: compare impressions and CTR for the same position over 28 days. Change one variable at a time, and give it a month before judging.`
  },
  {
    slug: 'market-area-strategy',
    title: 'What a market area is — and how to build one without spam',
    category: 'Growth',
    cover: '/img/blog-2.jpg',
    excerpt: 'Location pages can be a growth engine or a liability. The difference is whether each page contains something only true there.',
    published_at: '2025-12-02',
    read_minutes: 7,
    featured: true,
    body: `If you sell a service across many cities, the obvious idea is to build a page for every city. It works — until it does not.

Google's spam policies are explicit about "doorway pages": pages created primarily to funnel search traffic to the same destination, with near-identical content. Thousands of city pages with the name swapped is the textbook example.

So how do you get the coverage without the risk?

## Start with the commercial map, not the gazetteer

The mistake is copying an administrative list of districts. A country has 700+ districts; your business does not have demand in all of them.

Build the list from evidence instead:

- Where your existing customers are.
- Where your sales team can actually service.
- Where search demand exists (keyword volume by city).
- Where your competitors have a physical or commercial presence.
- Where the logistics or delivery model works.

That usually produces 30–150 locations, not 700. Fewer, better pages beat more, thinner ones.

## The uniqueness test

For each location page, ask: *what here would be false if I changed the city name?*

If the answer is "nothing", the page is a template. Add at least three genuinely local inputs:

1. **Local proof** — a project, client, delivery or installation in that area.
2. **Local logistics** — delivery time, service radius, local partner, currency, working hours.
3. **Local context** — the industries, regulations or seasonality that change the offer there.
4. **Local people** — a named contact or team if one exists.
5. **Local answers** — FAQs that only make sense for that market.

## Architecture that scales

A clean hierarchy helps users and crawlers:

\`\`\`
/market-area                      → all countries
/market-area/india                → states
/market-area/india/maharashtra    → cities
/market-area/india/maharashtra/mumbai  → city hub
/market-area/india/maharashtra/mumbai/web-design → city × service
\`\`\`

Keep the city hub genuinely useful — services available, local proof, nearby cities, contact. Then let the city × service pages carry the long-tail queries, with a clear link back to the hub.

## Avoid the trap of 40,000 pages

A grid of every city × every service multiplies fast: 400 cities × 40 services is 16,000 pages. That is not automatically bad, but it is automatically risky if the content is generated by substitution.

Two safeguards:

- **Only generate combinations that make commercial sense.** Not every service belongs in every city.
- **Give the generated pages real data.** Local pricing, timelines, proof and FAQs — pulled from a database, not invented in a template.

## Measure coverage, not page count

The dashboard that matters has four numbers: indexed location pages, pages with impressions, pages with clicks, and enquiries by location. A thousand indexed pages with no impressions are a liability, not an asset.

> Coverage is not how many places you claim. It is how many places can find you and buy from you.

## The honest version

A market area is a sales-territory map expressed as a website. If you would not open an office, appoint a partner or send a team there, think twice before publishing a page that says you serve it.`
  }
];

module.exports = { posts };
