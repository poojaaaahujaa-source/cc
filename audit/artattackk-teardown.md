# Art Attackk — Deep Teardown

**Site:** https://www.artattackk.com/
**Date:** 17 October 2026
**Scope:** design system, information architecture, all service lines, content, conversion, SEO, performance, accessibility, stack and reputation
**Method:** full crawl of sitemaps, 12 pages read end-to-end, HTTP header inspection, WordPress REST enumeration, Lighthouse lab run, third-party reputation cross-check
**Reviewed as:** a senior front-end/WordPress engineer and design lead would review a competitor's build

---

## 1. Snapshot

| | |
|---|---|
| **Business** | Full-service web design, development, e-commerce, branding and digital marketing agency |
| **Location** | E-92, Masjid Moth, Greater Kailash Part III, New Delhi 110048 |
| **Phone** | +91 94993 99914 (a Telangana mobile number, not a Delhi landline) |
| **Email** | contact@artattackk.com |
| **Claimed founding** | 2009 |
| **Parent / sister brand** | "Brand Dad: Addictive Media" (footer credit) |
| **Platform** | WordPress, custom theme, Cloudflare |
| **Public URLs** | **≈320+** across services, case studies, portfolio, programme pages and a second blog install |
| **Named clients** | Amazon, NDTV, Times of India, Orient Electric, GD Goenka, Lotus Herbals, Jiva Ayurveda, Big Boy Toyz, Looks Salon, Kapoor Watch Co., Elan Group, Drishti IAS, SoulTree, Karbonn, Religare |
| **Third-party ratings** | Google **4.2** (23 reviews), Justdial **4.0** (23), Rannkly aggregate **4.9** (2,384) |

**One-line verdict:** this is a genuinely strong *content and SEO machine* wrapped around a *mediocre-to-poor front end*. The architecture, page count and client logos are top-decile for a Delhi agency; the performance, data integrity and conversion path are bottom-quartile.

### Scorecard

| Area | Score | Note |
|---|---|---|
| Positioning & brand voice | **8 / 10** | Distinct, memorable, fearless. Rare in this market |
| Information architecture | **8 / 10** | 78 service pages, 50 case studies, city pages, learn hub — a real moat |
| Content depth (service pages) | **7 / 10** | Substantial, but templated and repetitive across 78 URLs |
| Design craft | **6 / 10** | Bold art direction, undermined by duplicated DOM and stock doodles |
| Front-end engineering | **4 / 10** | Duplicate sections, theme-bundled images, split CSS/asset folders |
| Performance | **3 / 10** | **LCP 5.9 s**, FCP 3.9 s on mobile — for a web design agency this is the headline failure |
| Conversion path | **4 / 10** | Forms exist, but CTAs self-link and the primary form opens with a joke |
| SEO — technical | **5 / 10** | Good robots/sitemaps/canonicals in places, broken by a second install and redirecting sitemap URLs |
| SEO — on-page | **7 / 10** | Strong titles, intent-mapped pages, real keyword coverage |
| Trust & data integrity | **3 / 10** | Contradictory stats, inflated review claims, self-serving "top 10" lists |
| Accessibility | **3 / 10** | Broken heading hierarchy, 10 empty H6s, marquee text duplicated 24+ times |
| Security & infrastructure | **8 / 10** | Best-in-class headers, Cloudflare, Wordfence, HTTP/3 |
| **Overall** | **5.6 / 10** | A marketing asset that is being throttled by its own front end and credibility leaks |

---

## 2. Who they are, commercially

Art Attackk has been running since 2009 and has clearly done real work for real brands. The client wall is not decorative — Big Boy Toyz, Orient Electric, GD Goenka and Lotus Professional have public case studies with screenshots, and third-party directories independently list the same names.

But the business is smaller than the site implies. Cross-referencing public profiles:

| Source | Employees | Rate | Min project | Founded |
|---|---|---|---|---|
| Clutch | 10–49 | $25–49/hr | $1,000+ | 2009 |
| Techreviewer | 50–99 | <$20/hr | <$5,000 | 2009 |
| TopSEOs | 10+ | — | — | 2009 |
| Justdial listing A | — | — | — | **2019** |
| Justdial listing B | — | — | — | 9 years in business |

The site itself says **13 years**, **14 years**, and **"since 2009"** (which is 17) on the same pages. That inconsistency is the single cheapest thing to fix and the most damaging to a premium positioning.

**Positioning in one line:** *"We are the loud, funny, genuinely creative Delhi agency — not the template shop, not the cheap freelancer."* The home page even prices against both competitors explicitly (freelancer ₹2,000–20,000; random ad agency ₹25,000–55,000; "us — 2X, worth every pixel"). That is a confident, differentiated move and very few Indian agencies have the nerve to do it.

---

## 3. Information architecture — the real asset

This is where the site punches far above its weight. From the four sitemaps:

| Section | Approx. URLs | Purpose |
|---|---|---|
| **Service pages** (`sitemap-services.xml`) | **78** | Design, dev, platforms, apps, branding, SEO, social, content, video |
| **Case studies** (`/casestudies/*`) | **50** | Client work, one page per project |
| **Portfolio** (`/portfolio-*`) | **35** | Legacy project pages, pre-case-study era |
| **Directory / listicles** (`/directory/*`) | **80+** | "Top 10 X companies in Y" — programmatic SEO |
| **City pages** | **3** (`/website-design-company-in-gurgaon`, `-noida`, plus Delhi home) | Local landing pages |
| **City × service pages** (`/noida/*`) | **12** | e.g. `/noida/seo-company-in-noida/` |
| **Blog** (`/blogs/*`, separate WP install) | **~60 posts** across 11 categories | Top-of-funnel |
| **Resources / Learn** | **~12** | Guides, "my website isn't working" series |
| **Company** | About, Clients, Career, Current Openings, Value, Outsourcing, Presentation, Contact | Corporate |

**Total: roughly 320+ indexable URLs.** For comparison, the average Delhi web design agency site has 8–15.

**What's smart here:**

1. **Intent-mapped service pages.** They didn't write one "Services" page. They wrote one page per buying phrase: `shopify-migration-company`, `shopify-ecommerce-audits`, `shopify-priority-support`, `wordpress-speed-optimization-service-india`, `ott-app-development-company-india`. That is how you capture long-tail commercial intent.
2. **Platform clusters.** Shopify has **7** dedicated pages, WordPress has **6**, Magento/WooCommerce/OpenCart each have one. This is agency SEO done properly — build authority around a platform, not a generic "web development".
3. **City × service matrix.** Delhi, Noida, Gurgaon × design, SEO, social, app, branding. Classic local-SEO spawning, executed at scale.
4. **Case-study library.** 50 projects gives them something almost nobody in this market has: proof at volume.
5. **"Learn" hub with problem-first titles.** *"My website isn't showing up on Google"*, *"My website isn't making money"*, *"My website doesn't convert"* — these map to panic searches, not vanity keywords.

**What's wrong with the architecture:**

- **Two WordPress installations.** The main site runs at `/`, the blog at `/blogs/` — a **separate install with its own plugin set** (Yoast instead of Rank Math, its own Wordfence, its own Contact Form 7). That means two update cycles, two security surfaces, two sitemaps, two canonical policies.
- **Non-www URLs inside the posts sitemap.** `sitemap-posts.xml` lists `https://artattackk.com/blogs/...`, while the site canonicalises to `www`. Every one of those entries takes a redirect hop.
- **A three-hop redirect chain for the blog.** `/blog/` → `artattackk.com/blogs/` → `www.artattackk.com/blogs/` → 200.
- **Sitemap URLs that redirect to the home page.** `https://www.artattackk.com/directory/top-10-website-designing-companies-in-delhi/` returns **301 → https://artattackk.com/ → https://www.artattackk.com/** (200, homepage). A URL in your sitemap should never land on the homepage.
- **Duplicate case-study slugs.** There are two Big Boy Toyz case studies (`/casestudies/bbt/` and `/casestudies/big-boy-toyz-preowned-super-car-brand/`), two Wishnew (`wishnew-wellness` and `wishnew-wellness-health-brand`) and two QHT (`qht` and `qht-hair-transplant`). That's six competing near-duplicate pages splitting their own authority. (Lotus also has two — cosmetic brand and photography brand — which may be genuinely different projects.)
- **Portfolio and case studies overlap.** 35 legacy `/portfolio-*` pages plus 50 `/casestudies/*` pages describe the same projects in two different templates.

---

## 4. Design system — what it actually is

### 4.1 The visual concept

Art Attackk runs a **hand-drawn, neo-brutalist, cosmic-doodle** aesthetic. It is not a SaaS template and it is not a corporate agency site. The system is built from:

- **Sketch illustrations** — hand-drawn characters, arrows, stars, clouds, planets (`astro-img.webp`, `design-star.webp`, `italix-star-sketch.webp`, `in-house-team.webp`)
- **Animated GIFs as UI elements** — rocket, pencil, speaker, 404 animation (`rocket-raw.gif`, `img-servicesbox1.gif`, `error-404-animate.gif`)
- **A handwritten display face** — the theme CSS references `font-family: 'gooddogregular'` for its button style, confirming a hand-written font family is part of the brand kit
- **Oversized display typography** — headline conventions like *"Design Partner for Those **That Refuse To Fail**"* mix sentence case with bold all-caps emphasis
- **A "gate" motif** — `half-gate.png` and `full-gate.png` open and close full-width typographic bands
- **Marquee keyword strips** — moving bands of phrases that act as both decoration and keyword reinforcement

It is loud, it is memorable, and it does not look like anyone else in Delhi. That is a genuine strategic asset.

### 4.2 The service-page template (used on all 78 pages)

Every service page follows the same anatomy:

```
1. H1 + one-line hook + "Get In Touch" CTA
2. Client logo strip (Amazon, BBT, Orient, NDTV, GD Goenka, Jiva, Looks, SoulTree)
3. "Gate" marquee — 9–11 keyword phrases repeated 4x
4. Stats row — 4 numbers with labels
5. Project cards — 6 case studies
6. Services grid — 6–10 sub-service cards with "Know More"
7. Why Us — 6–8 differentiators
8. Stats strip — "14 Years / 100% In-house / 500+ Projects"
9. FAQ accordion
10. Contact form / WhatsApp / phone
```

This is a **good template**. It answers, in order: *what do you do, who trusts you, what results, show me work, what's included, why you, objections (FAQ), how to start.* Most agencies never get past step 1.

### 4.3 Where the build breaks

The template is sound; the **implementation** is sloppy in ways a client will eventually notice.

**a) Duplicated DOM for desktop and mobile.**
On the branding page the entire "What we make" block and the "Book a Discovery Call" CTA appear **twice** in the rendered output. On the home page the hero image appears twice and the client logo strip appears **twice**; on the Noida city page the same logo strip appears **four times**. This is the classic "render both versions and `display:none` one" pattern. It doubles HTML weight, duplicates headings for screen readers, and is invisible to the team but obvious in View Source.

**b) Empty headings as placeholders.**
The website-designing page renders **ten consecutive `<h6>latest project</h6>` elements** before the actual project cards. That is leftover template scaffolding shipped to production.

**c) Three parallel asset folders.**
The theme pulls images from `/site/images/`, `/site/image/`, and `/images/` — three directories with near-identical names, all inside the theme. The logo served to crawlers is `aa-logo.gif` (a **GIF**, 144×112), with `sm-logo.png` used elsewhere. Assets live in the theme, so marketing cannot swap an image without a developer.

**d) Same image, different service.**
On the website-designing page, the **same file** (`ecommerce-website.webp`) is the thumbnail for "Mobile Website Design", "Dynamic Website Design", "Static Website Design", **and** "Campaign Landing Page Design". Four services, one picture.

**e) GIFs as hero-grade UI.**
`homepage-banner-1.webp` is fine, but the page also loads `img-servicesbox1.gif`, `img-servicesbox3.gif`, `rocket-raw.gif`, `new-hp-mobile.gif`, `astro-img.webp`, `heart-img.gif`, plus a Vimeo iframe on About. Animated GIFs cannot be lazy-decoded efficiently and are huge relative to WebP.

**f) The "gate" is keyword stuffing with a nice wrapper.**
The marquee on the mobile-app page repeats `mobile app development company india / mobile app development company in delhi / india mobile app development company / top mobile app development company in india / best mobile app development company in india / app developers india` **four times**. It looks like art direction; Google reads it as repeated keyword text, and a screen reader reads all 24 repetitions aloud. It also does no SEO work that the H1 and title don't already do.

### 4.4 Design verdict

**Art direction: strong. Design system: doesn't exist.** There is no documented type scale, no spacing scale, no colour tokens, no component library. Each page is hand-assembled HTML with inline classes, which is why the same "Why Us" block looks different on every page and why the stats strip contradicts itself. A senior design lead would keep the visual language and throw away the implementation.

---

## 5. Service lines — the full map

Art Attackk sells **78 distinct service pages**. Grouped into the real offer:

### 5.1 Web design & development (core)
Website design, corporate/business websites, portfolio sites, mobile sites, dynamic sites, static sites, responsive sites, custom sites, UX/UI design, website redesign, campaign landing pages, website maintenance.

### 5.2 Platforms
- **WordPress** (6 pages): development, design, customisation, migration, support, **speed optimisation**, PSD→WordPress
- **Shopify** (7 pages): design, development, audits, migration, PSD→Shopify, priority support, marketing
- **WooCommerce**, **OpenCart**, **Magento** (1 each)
- **Open-source / custom development** (`/development/`, `/open-source-developer-india/`)

### 5.3 E-commerce
Store design, Shopify e-commerce, e-commerce development, e-commerce apps, logistics/payment integration (implied in case studies).

### 5.4 Mobile & apps
iOS, Android, Flutter, React Native, e-commerce apps, OTT apps, custom apps, app UI/UX, web apps.

### 5.5 Branding & design
Branding, logo design, brochure design, packaging design, graphic design, infographic & motion graphics, visual design, video editing.

### 5.6 Digital marketing
SEO (on-page, off-page, local, technical/audit, content writing, link building), Google Ads/PPC, social media (page management, advertising, campaigns, brand management, Instagram), influencer marketing, email marketing, content marketing, Quora marketing, guest posting, media buying, performance marketing, conversion optimisation, lead-gen tools, online reputation management.

**The commercial read:** the top of the funnel is *very* wide. A 20-person agency cannot credibly be excellent at OTT app development, packaging design, Quora marketing and Shopify migration simultaneously. The breadth wins SEO; it loses trust with a serious buyer who reads "OTT app development" next to "brochure design" and concludes *generalist*.

**The fix is not to delete pages** — it's to tier them: three flagship services given real depth (web design, Shopify, SEO), the rest kept as SEO capture pages with honest "we do this with our partner team" language.

---

## 6. Content & copy — the most interesting part of this site

The copy is written by someone with a real voice. Sample lines:

> *"A stunning website is like the fancy outfit you wear to the digital party."*
>
> *"We'll transform your website from 'meh' to 'yeah!'"*
>
> *"Your brand is too precious to leave up to fate."*
>
> *"Choosing us is like buying a puzzle and getting all the pieces, not just the corners."*

And in the FAQ, answering "Where do we work?":

> *"You can find us lurking in our office drinking coffee till the machines stop functioning."*

### Where the voice wins

- It is **memorable**. Nobody remembers the 400th agency that says "we deliver cutting-edge solutions". People remember "Bunty to Birla".
- It **disarms price objections** with the freelancer-vs-agency-vs-us comparison table. That table is the best-converting idea on the site.
- It **signals personality**, which matters when clients are buying a relationship from a 20-person team.

### Where the voice loses money

1. **It talks down to the buyer.** "Why here, bro?" is literally the first option in the contact form dropdown. On a ₹5 lakh enterprise enquiry, that reads as unserious.
2. **The team page has no team.** The About page lists departments as jokes: *Creative Guys*, *Blabbermouths*, *BDM Bandhu*, *SEO Wale*, *Baburao*, *HR Billi*. No names, no faces, no leadership. Enterprise procurement needs to know who they're contracting.
3. **It substitutes jokes for evidence.** The case studies are the weakest content on the site relative to their importance — see below.
4. **Typos leak through.** "Bunty to birla" (home), "Modi Care" vs "Modicare", "14 Years" vs "13 YEARS" on the same page, "WE BUILD planets, stars, asteroids" in a band that is visually broken across lines.

### The case-study problem

`/casestudies/bbt/` — their flagship client — is: a hero image, one paragraph about Big Boy Toyz, a nine-item bullet list of what was done, one gallery image, and "You may also like". **No problem statement, no before/after, no numbers, no timeline, no client quote, no link to the live site.**

For a company whose entire pitch is "we make websites that make money", publishing 50 case studies with **zero measurable outcomes** is the biggest content failure on the site. The proof exists (they quote "skyrocketed our sales" in a testimonial) but it's never substantiated.

**What a case study should contain, minimum:** client + sector, the problem in one paragraph, what was built (with 2–3 screens), the stack, the timeline, 2–3 metrics (traffic, conversion, revenue, speed), one client quote, and a link.

---

## 7. Conversion path

| Element | Status |
|---|---|
| Popup "Request Quote" form | Present sitewide, multi-field, service dropdown |
| Contact page form | Present (Contact Form 7) |
| Phone CTA | Present, but **+91 94993 99914** — a Telangana mobile on a Delhi office |
| WhatsApp CTA | Present sitewide, pre-filled message |
| Sticky mobile bar | Present (Request Quote / call / WhatsApp) |
| Pricing | **None** — only "2X cost" positioning |
| Calendar booking | **None** ("Book a Discovery Call" is a self-link) |
| Live chat | None |
| Thank-you page / conversion tracking | Not verifiable; no evidence of GA4 events |
| Case-study CTA to enquire | Weak — case study pages end in "You may also like" |

**The critical bug: self-linking CTAs.** On the website-designing page, "Get In Touch" points to **the same page**. On the branding page, "Book a Discovery Call" and "Start your Journey" both point to **the same page**. On the mobile-app page, "Connect with a professional" and "Let's Collaborate" both point to **the same page**. These are the primary buttons and they do nothing. Three of the highest-intent service pages have dead primary CTAs.

That single defect probably costs more revenue than every design issue in this document combined.

---

## 8. SEO teardown

### What's right

- **robots.txt is genuinely well written** — blocks admin, author, tag, attachment, search, tracking params; allows CSS/JS/images; blocks CCBot and Bytespider; declares the sitemap. This is better than 95% of Indian agency sites.
- **Sitemap index with four clean children** (pages / services / portfolio / posts), each with `lastmod`.
- **Canonical host enforced**: `artattackk.com` → 301 → `www.artattackk.com`.
- **Real 404s return 404** (verified with a junk URL — `HTTP/1.1 404 Not Found`), not soft-200.
- **`readme.html` is blocked** and returns the themed 404.
- **Titles are intent-mapped and unique per page**, e.g. *"Ecommerce Website Development Company in Delhi | Ecommerce Website Developers Delhi"*.
- **Rank Math** with an AI-visibility module is installed — a modern choice.

### What's broken

| Issue | Evidence | Impact |
|---|---|---|
| **Second WP install at `/blogs/`** | `/blogs/wp-json/` returns a separate site (`name: "wordpress"`, Yoast, own CF7) | Double maintenance, split authority, inconsistent SEO config |
| **Non-www URLs in posts sitemap** | `sitemap-posts.xml` lists `https://artattackk.com/blogs/...` | Every blog URL takes a redirect |
| **Sitemap URLs redirecting to home** | `/directory/top-10-website-designing-companies-in-delhi/` → 301 → `artattackk.com/` → 301 → `www/` | Crawl waste; sitemap trust damage |
| **Duplicate case studies** | Two BBT, two Wishnew, two QHT URLs | 6+ pages cannibalising each other |
| **Duplicate portfolio + case-study coverage** | 35 `/portfolio-*` + 50 `/casestudies/*` for overlapping projects | Thin/duplicate content at scale |
| **Keyword marquees** | 24 reps of "mobile app development company india" on one page | Repetitive text signal, no ranking benefit |
| **"Top Ranked" in the title tag** | `<title>Top Ranked Website Designing Company in Delhi` | Unverifiable superlative in the SERP snippet |
| **Author = "Admin Super"** | Page metadata on directory pages | No E-E-A-T signal on 80+ listicles |
| **Self-serving "Top 10" lists** | 80+ directory pages that rank Art Attackk **#1 with "Our Rating 5/5"** | Google's own guidance treats self-promoting listicles as low quality; at 80 pages it becomes a sitewide quality signal |
| **Aggregate rating markup** | A directory page's snippet shows `aggregateRating: ratingValue 4.9, ratingCount 2300, reviewCount 4300` | Rating count ≠ review count, and self-reviews violate review-snippet policy. Manual-action risk |

### The programme-page strategy — honest assessment

The `/directory/` section is 80+ pages of "Top 10 X companies in Y" where Art Attackk is always #1. This is a known Indian agency SEO play. It does capture long-tail traffic, but:

- Google has been steadily devaluing self-published "top 10" lists, especially where the publisher is #1 with no methodology.
- It creates **sitewide quality risk**: 80 thin, self-serving pages out of ~320 total is 25% of the site.
- It damages trust with buyers who notice the conflict of interest.

**Better version:** keep the pages, add a real methodology (how shortlisting was done, what was measured, dates), rank competitors honestly above you where they're better, and add original data (pricing, project counts, review counts scraped on a date). That converts a liability into an asset.

---

## 9. Performance — the biggest engineering failure

Lighthouse 13.5, mobile emulation, homepage, 17 Oct 2026:

| Metric | Result | Target |
|---|---|---|
| First Contentful Paint | **3.9 s** | < 1.8 s |
| Largest Contentful Paint | **5.9 s** | < 2.5 s |
| Speed Index | **4.0 s** | < 3.4 s |
| HTTPS | Pass | — |
| CDN | Cloudflare, HTTP/3 | — |
| Edge cache | `cf-cache-status: HIT`, `Age: 909456` | — |

**The infrastructure is not the problem.** Cloudflare is serving a cached HTML response in milliseconds. The 5.9-second LCP is happening **in the browser**, after the HTML arrives. Which means it's the document itself.

Likely causes, in order of probability:

1. **Render-blocking CSS/JS in the head.** A hand-built theme with multiple stylesheets and jQuery-style scripts will block first paint. The 3.9 s FCP with a cached HTML response points directly at this.
2. **The LCP element is a large hero image** (`homepage-banner-1.webp`) that is **loaded twice** (desktop + mobile variants both in the DOM) and is not preloaded.
3. **Duplicated DOM.** Logo strips repeated 5×, sections repeated 2×. Every duplicate is layout work.
4. **Animated GIFs** — `rocket-raw.gif`, `img-servicesbox1.gif`, `img-servicesbox3.gif`, `new-hp-mobile.gif`, `astro-img.webp`. GIFs are decoded on the main thread and cannot be efficiently lazy-loaded.
5. **Vimeo iframe on About** — a third-party player with its own network chain.
6. **No visible evidence of critical CSS, font preloading, or `loading="lazy"` discipline.**

**Why this matters commercially:** they are a web design agency. A prospect who clicks their Google result on a phone waits ~6 seconds for the hero. The pitch is "we make fast, beautiful websites". The site disproves it before the first scroll.

**Fix priority:** (1) inline critical CSS and defer the rest, (2) preload the hero WebP and remove the duplicate variant, (3) replace GIFs with WebP/AVIF or CSS/SVG animation, (4) lazy-load the Vimeo facade, (5) remove the duplicated DOM, (6) add `width`/`height` to every image. Realistic target: LCP under 2.5 s within a sprint.

---

## 10. Accessibility

| Issue | Evidence | Severity |
|---|---|---|
| Broken heading hierarchy | Home goes H1 → H4 → H6; service pages jump H1 → H4 → H5/H6 with no H2/H3 level | High |
| Empty headings | 10 × `<h6>latest project</h6>` on the website-designing page | High |
| Marquee text read aloud 24× | Mobile-app page keyword band | High |
| GIFs with no pause control | Sitewide decorative animations; no `prefers-reduced-motion` evidence | Medium |
| Link text | "Know More", "Explore", "Fb/IG/Tw" style labels | Medium |
| Duplicated forms/labels for mobile | Modern form markup is present, but duplicate DOM can double-announce fields | Medium |
| Alt text | Present but often just the client name or a repeated phrase | Low |
| Contrast | Not measured without a render | Unknown |

For an agency that sells design, publishing a site that fails basic heading structure is a credibility problem in every enterprise RFP that asks for a WCAG statement.

---

## 11. Stack & security — genuinely good, with two caveats

**Detected:**

- **CMS:** WordPress (REST root exposes plugins)
- **Theme:** custom, folder `twentytwentyoneaablogs123` — a bespoke build, not a marketplace theme
- **Plugins (main):** Rank Math SEO, Wordfence, Contact Form 7, Redirection, Newsletter (tnp), Akismet, plus a `mcp` namespace
- **Plugins (`/blogs/`):** Yoast SEO, Wordfence, Contact Form 7
- **Server:** Cloudflare in front, HTTP/3 (`alt-svc: h3`), Brotli
- **Database:** MySQL

**Headers — better than most banks, let alone agencies:**

```
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), camera=(), microphone=()
content-security-policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';
cache-control: public, max-age=0, s-maxage=2592000
```

HSTS is preloaded, which means the domain is in browsers' built-in HTTPS list. That is a deliberate, senior-level decision.

**Caveats:**

1. **`unsafe-inline` and `unsafe-eval` in the CSP** neutralise much of its XSS protection. Understandable for a WordPress site with inline scripts, but it means the CSP is mostly decorative.
2. **Two WordPress installs = two attack surfaces, two update queues.** With 20+ plugins across both, the odds of one falling behind double.
3. **`/wp-json/` root is fully open** and advertises every plugin and version namespace. `wp/v2/users` is correctly blocked (401), and `readme.html` is blocked — so someone has done hardening work. But the REST root still hands an attacker a plugin inventory.
4. **Wordfence is present on both installs** — good, and it appears to be working.

**Verdict:** infrastructure and security are the strongest part of this build. Whoever set up Cloudflare, HSTS preload and the header set knew exactly what they were doing. The same person did not review the front end.

---

## 12. Data integrity & trust — the leak nobody has plugged

This is where the site does real commercial damage to itself.

### 12.1 The numbers contradict each other

| Claim | Where |
|---|---|
| "13 YEARS of Web Development" | Footer, every page |
| "14 Years of Track Record" | Home, hero stats |
| "14 Years" | Stats strip, every page |
| "since 2009" | Home copy (2009 → 2026 = **17 years**) |
| "1,014+ Websites Launched" | Footer |
| "500+ Projects" | Stats strip, same page |
| "250+ Store Launched" | Ecommerce page |
| "100+ startups" | Mobile app page |
| "1000 of reviews" / "1000s of Reviews" | Home, two different spellings |

On `/about/`, **both** "14 Years" and "13 YEARS" appear within one viewport. A procurement officer comparing three agencies will notice, and will assume the rest of the numbers are invented too.

### 12.2 Review claims vs reality

The site says "1000s of reviews". Public reality:

| Platform | Rating | Reviews |
|---|---|---|
| Google | **4.2** | 23 |
| Justdial | 4.0 | 23 |
| "Reviews" platform | 3.8 | 38 |
| Rannkly aggregate | 4.9 | 2,384 (of which 2,300 sit on a single "Art" platform) |

The 2,300 figure appears to come from an in-house/partner review widget. Meanwhile the Google Business Profile — the only source a buyer checks — has **23 reviews at 4.2**, and at least one public complaint about unprofessional conduct.

**The honest move:** publish "4.2★ on Google (23 reviews)" with a live link, and run a review campaign for 90 days. Twenty-three reviews at 4.2 is unremarkable; 150 at 4.6 is credible and rankable.

### 12.3 Self-canonicalising proof

The 80 `/directory/` pages rank Art Attackk #1 with "Our Rating 5/5" and "5 star on google". Their Google rating is **4.2**. A reader who clicks through finds the contradiction in ten seconds.

### 12.4 Team anonymity

No named founder, no leadership, no photos, no LinkedIn. Third-party profile names **Asheesh Bhardwaj** as owner. For a business selling trust at ₹1–5 lakh a project, hiding the humans behind cartoon department names is a self-inflicted wound.

---

## 13. Bug list (concrete, reproducible)

1. Primary CTAs self-link on `/website-designing-company-india/`, `/branding-company-india/`, `/mobile-app-development-company-india/`.
2. `10 × <h6>latest project</h6>` empty headings on the website-designing page.
3. Same image `ecommerce-website.webp` used for four different services.
4. Mobile-app page: "Modi Care", "Greaser" and "Search Education" all carry the subtitle **"Pre-owned luxury cars Company"**.
5. `sitemap-pages.xml` lists `/directory/top-10-website-designing-companies-in-delhi/`, which 301s to the homepage.
6. `sitemap-posts.xml` uses `https://artattackk.com/...` (non-www) for every blog URL.
7. `/blog/` redirects through two hosts before landing at `/blogs/`.
8. Two BBT case studies, two Wishnew, two Lotus, two QHT.
9. Portfolio images are served from the **theme folder**, not the media library.
10. Logo asset is a GIF (`aa-logo.gif`).
11. Contact form's first dropdown option is **"Why here, bro?"**.
12. Footer phone `+91-9499399914` is a Telangana mobile; Justdial lists a different establishment year (2019) vs site (2009).
13. Vimeo showreel embedded as a raw iframe, not a click-to-play facade.
14. `unsafe-inline` + `unsafe-eval` in the CSP.
15. Duplicated sections (branding page), duplicated hero and 5× duplicated logo strip (home).

---

## 14. How it compares to a typical Delhi agency site (e.g. samasolution.in)

| Dimension | Art Attackk | Typical 5-page agency site |
|---|---|---|
| Indexable pages | **320+** | 5 |
| Service coverage | 78 pages, platform clusters | One "Services" page |
| Proof | 50 case studies + 35 portfolio + named logos | None |
| Reviews | 23 Google / 2.4k aggregate | None |
| Blog | Separate WP install, 60 posts | None |
| Performance (LCP) | **5.9 s** (poor) | 3.0 s (better) |
| Conversion | Forms, popup, WhatsApp — but broken CTAs | Phone + WhatsApp only |
| Security headers | Excellent | Usually none |
| Data integrity | **Poor** (contradictory stats) | N/A |

**The lesson:** structure and proof beat polish. Art Attackk wins the SEO and trust battle at the *architecture* level and loses it at the *execution* level. A 5-page site that loads in 1.5 s and has honest numbers is not automatically worse than a 320-page site that lies about its age.

---

## 15. What to steal, what to avoid

### Steal (in order of value)

1. **The service-page-per-intent model.** Don't build 78. Build 8–12 that map to how people actually search. One page per buying phrase.
2. **Platform clusters.** If you're good at Shopify or WordPress, own it with 5–6 pages, not one bullet.
3. **The competitor price-comparison table.** "Freelancer vs ad agency vs us" is the highest-converting block on their site. Adapt it honestly.
4. **Problem-first content titles.** "My website isn't showing up on Google" outperforms "Importance of SEO" every time.
5. **Case-study library as a sales asset** — but do it properly, with metrics.
6. **Cloudflare + HSTS preload + the header set.** Copy the exact config.
7. **Named, human trust signals** (real team, real address, real reviews) — this is the gap Art Attackk left open.

### Avoid

1. **Keyword marquees.** They look like design and behave like spam.
2. **Self-published "Top 10" lists with yourself at #1.** At scale it's a sitewide quality risk.
3. **Inflated, contradictory statistics.** One honest number beats six conflicting ones.
4. **Joke-first conversion UI.** "Why here, bro?" in a form dropdown costs enterprise leads.
5. **A second WordPress install for the blog.** Use one install, one SEO plugin, one sitemap.
6. **Cartoon team names instead of a team page.** Personality is fine; anonymity is not.
7. **GIFs as primary UI.** Use WebP/AVIF or CSS animation.
8. **Duplicated desktop/mobile DOM.** Build responsive, not dual.

---

## 16. If this were my build — 30/60/90

### Week 1 (highest revenue impact per hour)
1. Fix the three self-linking CTAs → point to `/contact/` with a pre-filled service parameter.
2. Replace the form's "Why here, bro?" option with "Select a service".
3. Reconcile every statistic to one source of truth: founding year, projects, clients, retention. Use 2009 and one number each.
4. Publish the real Google rating with a link; start a 90-day review campaign.
5. Remove the 10 empty `<h6>latest project</h6>` nodes.
6. Correct the three wrong project subtitles on the mobile-app page.

### Month 1 (performance and credibility)
7. Inline critical CSS, defer the rest, preload the hero, remove the duplicate hero asset.
8. Replace all UI GIFs with WebP/AVIF or SVG/CSS animation.
9. Replace the Vimeo iframe with a click-to-play facade.
10. Ship one H1 per page with a clean H2/H3 hierarchy.
11. Add named leadership + a real team section to About.
12. Rewrite 4 flagship case studies with problem → build → metrics → quote.

### Month 2 (architecture)
13. Retire the 35 legacy `/portfolio-*` pages with 301s into `/casestudies/*`.
14. Deduplicate the six duplicate case studies (BBT, Wishnew, QHT).
15. Fix the three sitemaps: one host, no redirecting URLs, accurate `lastmod`.
16. Add methodology + honest rankings to the directory pages, or prune the weakest 30.
17. Fix `/blog/` → single 301.
18. Decide: migrate `/blogs/` into the main install, or accept two installs and standardise the SEO plugin.

### Month 3 (growth)
19. Add pricing guidance (starting-from bands) — even ranges convert better than silence.
20. Add a booking flow (Calendly/Cal.com) behind "Book a Discovery Call".
21. Add GA4 + server-side conversion tracking on forms, calls, WhatsApp.
22. Rebuild the service-page template as components (hero, logos, proof, work, FAQ, CTA) so pages stop being hand-assembled.
23. Set a performance budget in CI: LCP < 2.5 s, CLS < 0.1, JS < 250 KB.

---

## 17. Method and limits

**Done:** read the four sitemaps; read home, about, contact, portfolio, website-designing, ecommerce, branding, mobile-app, BBT case study, Noida city page, a directory page, and the 404; inspected HTTP headers via an external header service; enumerated the WordPress REST root of both installs; ran Lighthouse 13.5 mobile; cross-checked Clutch, Techreviewer, TopSEOs, Justdial, Rannkly and Google rating data via search.

**Not done:** no rendered visual review or screenshots (the origin refused this environment's TLS handshake; analysis is from markup, assets and third-party renderers); no Search Console, GA4, Ads or CMS access; no Core Web Vitals field data; colours and exact type scale inferred from asset and CSS references, not from a compiled stylesheet; employee count and revenue figures are third-party estimates, not confirmed.

---

*Prepared 17 October 2026. The two findings that matter most: the primary CTAs on the top three service pages go nowhere, and the site takes ~6 seconds to show its hero on mobile. Fix those two and the same content will convert materially better.*
