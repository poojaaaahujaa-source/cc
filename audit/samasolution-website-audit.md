# Website Audit — samasolution.in

**Date:** 17 October 2026
**Site:** https://www.samasolution.in/
**Pages reviewed:** Home, Who We Are, What We Do, Services, Contacts (the entire public site)
**Also checked:** DNS/email, TLS, HTTP headers, sitemap/robots, archive history, search visibility, public listings, hosting infrastructure
**Prepared for:** the site owner / marketing team

---

## 1. Verdict

**Overall score: 3.3 / 10 — live, but not working as a business asset.**

The site is a five-page brochure built in 2020 and essentially untouched since. That alone would be a growth problem. But there is a harder problem: **the home page is currently returning HTTP 500 — an error page — to every visitor.** The interior pages load, so the site looks "up" in a browser tab you already have open, but anyone who types the domain, clicks a Google result, or taps a social bio link lands on an error.

Three things need to be true before any marketing spend makes sense:

1. The home page loads reliably (currently it does not).
2. A visitor can see proof you can do the work (currently there is no portfolio, no case study, no testimonial, no team, no pricing).
3. A visitor can contact you without leaving the page (currently there is no form — only a phone number, an email address and a WhatsApp button).

Everything else in this report is secondary to those three.

### Scorecard

| Area | Score | Summary |
|---|---|---|
| Availability | **2 / 10** | Home page returns HTTP 500 (empty body); interior pages return 200 |
| Performance | **6 / 10** | LCP 3.0 s on mobile; shared host, no CDN, no cache headers |
| Technical SEO | **4 / 10** | 5 URLs, stale sitemap, missing robots.txt, duplicate host + `/index.php` |
| On-page SEO | **4 / 10** | Generic subpage titles, one meta description reused sitewide, weak headings |
| Content | **3 / 10** | ~1,200 words total, duplicated paragraphs, spun-sounding English, 2020 pandemic copy |
| UX / conversion | **3 / 10** | No form, no portfolio, no pricing, no trust signals, template artefacts |
| Trust & credibility | **3 / 10** | No address, no legal pages, no reviews; one public 1-star complaint |
| Security | **3 / 10** | PHP 7.4 (EOL 2022), no security headers, no DNSSEC, DMARC monitor-only |
| Accessibility | **3 / 10** | Missing alt text, duplicate H1s, H1→H6 heading jumps, non-descriptive link text |
| Local SEO | **2 / 10** | No street address, no Google Business Profile found, no NAP citations |
| **Overall** | **3.3 / 10** | **Fix P0s, then rebuild the front end around proof + conversion** |

### What is genuinely working

- **Domain age.** `samasolution.in` was registered on **21 June 2020** and is paid through **21 June 2027** — six years of history is an asset most new agencies don't have.
- **HTTPS is correctly enforced.** `http://` → `https://` returns a clean 301, and the certificate is valid (Let's Encrypt wildcard `*.samasolution.in`, plus a GoDaddy cert for `www`).
- **Interior pages return 200** and render normally, which means the failure is isolated to the home page rather than the server.
- **The service list is clear and commercially sensible** — design, development, digital marketing, branding, mobile apps, software, video.
- **Contact details are consistent** across the site and Facebook: +91 93114 93072, info@samasolution.in, New Delhi.
- **The WhatsApp CTA is a good instinct** for the Indian market and is present on every page.

---

## 2. P0 — fix in the next 48 hours

### 2.1 The home page is down (HTTP 500)

**Evidence (17 Oct 2026, 07:23–07:24 UTC):**

```
GET https://www.samasolution.in/            → HTTP/1.1 500 Internal Server Error
                                              Content-Length: 0
                                              X-Powered-By: PHP/7.4.33
GET https://samasolution.in/                → HTTP/1.1 500 Internal Server Error
GET https://www.samasolution.in/index.php   → HTTP/1.1 500 Internal Server Error
GET https://www.samasolution.in/services.php → HTTP/1.1 200 OK
GET https://www.samasolution.in/contacts.php → HTTP/1.1 200 OK
GET http://www.samasolution.in/             → 301 → https → 500
```

The body is empty (`Content-Length: 0`), which is PHP's behaviour when `display_errors` is off and a fatal error occurs. Chrome renders its default title: *"www.samasolution.in is currently unable to handle this request."* Independent clients (a header-checking API, a headless browser, and this audit's fetcher) all reproduce it, so it is not a one-off.

**Why it matters:** the home page is where brand searches, ads, social bios, email signatures and Google's main result all point. Every one of those visits is currently a dead end. If the 500 persists, Google can drop the URL from the index and slow crawling across the whole domain.

**How to diagnose (in order):**

1. Open cPanel → **Errors** (or `~/logs/error_log`) and read the fatal-error line at the timestamp of the failure.
2. Check the most recently modified file in the web root — a partial upload or edited `index.php` is the most common cause.
3. Temporarily comment out includes one at a time (header, config, mailer) to isolate the failing component.
4. If the host recently changed PHP version, that is a strong suspect — but **do not** downgrade as the fix; fix the code for PHP 8.2 (see 2.2).
5. Restore `index.php` from the last good backup if the cause isn't obvious within an hour.

**Then prevent a repeat:**

- Add uptime monitoring with SMS/WhatsApp alerts (UptimeRobot, Better Stack, or your host's equivalent) on `/`, `/services.php` and `/contacts.php`.
- Keep a static `maintenance.html` fallback so visitors see a branded message, never a raw Apache/PHP error.
- Take a full backup (files + database) before and after the fix.

### 2.2 PHP 7.4.33 has been end-of-life since 28 November 2022

The server advertises `X-Powered-By: PHP/7.4.33` on every response. PHP 7.4 has received no security patches for nearly four years. On a shared cPanel host this is usually a one-click change (MultiPHP Manager) — but the code must be tested first, because the site already shows signs of fragile, older PHP.

**Do:** clone the site to a staging subdomain, switch to PHP 8.2, fix deprecations, test every page and the contact/mail path, then switch production. Remove or mask the `X-Powered-By` header either way.

### 2.3 Client staging sites are publicly exposed

Certificate Transparency logs and live checks show client projects served from public subdomains of your domain, for example:

| Subdomain | Status | Last modified |
|---|---|---|
| `adityainnovatives.com.samasolution.in` | **200 OK**, 106 KB | 25 Apr 2026 |
| `www.mkfiresafety.in.samasolution.in` | **200 OK**, 64 KB | 08 Jun 2026 |
| `ashvah.in.samasolution.in`, `hpj.co.in.samasolution.in` | certificates issued | — |
| `mountainfacecottage.com.samasolution.in`, `suroliaenterprises.com.samasolution.in`, `10xrealty.co.in.samasolution.in`, `makaandekho.in.samasolution.in` | certificates issued | — |

These appear to be live client builds or staging copies. Publicly reachable staging sites are a real risk: unfinished work indexed by Google, duplicate content competing with the client's real domain, exposed admin paths, and client data visible to anyone who guesses the pattern.

**Do:** put every `*.samasolution.in` staging host behind HTTP Basic Auth, add `X-Robots-Tag: noindex`, and block them in `robots.txt`. If a client site has launched, move it to the client's own domain and remove the subdomain.

### 2.4 Domain parking incident — confirm renewal settings

The archived snapshot from **10 July 2025** shows the domain redirecting to `demospace.com/lander`, a parking lander. The June 2025 capture shows a bot-challenge screen. That pattern usually means the domain lapsed into parking or DNS was detached for a period. Whatever the cause, it is worth confirming:

- Auto-renew is **on** (domain expires 21 June 2027).
- Registrar lock is **on** (it currently is — `clientTransferProhibited`).
- The registrant email is a mailbox someone actually reads.

---

## 3. SEO audit

### 3.1 Site architecture and indexing

| Check | Result |
|---|---|
| Public pages | **5** (`/`, `who-we-are.php`, `what-we-do.php`, `services.php`, `contacts.php`) |
| `sitemap.xml` | Present, but lists only those 5 URLs, all with `lastmod` **2020-07-07** |
| `robots.txt` | **404 — does not exist** |
| Duplicate home URL | `/` and `/index.php` both indexed, both currently 500 |
| `www` vs apex | Both serve content (`https://samasolution.in/services.php` → 200). **No canonical redirect.** |
| URLs in search results | A `site:` query surfaces only **4 pages** |
| Structured data | None found in the page metadata; confirm with the Rich Results Test |
| Canonical tags | Not verifiable from outside; assume missing until confirmed |

**Issues:** a 2020 sitemap tells Google the site is abandoned; a missing `robots.txt` means no crawl guidance and no sitemap declaration; the apex/www split divides link equity; `.php` URLs with no keywords (`services.php`) are weaker than `/services/`.

**Fix:**

- 301 `https://samasolution.in/*` → `https://www.samasolution.in/*` (pick one host and enforce it).
- 301 `/index.php` → `/`.
- Publish a `robots.txt` with `Sitemap: https://www.samasolution.in/sitemap.xml`.
- Regenerate the sitemap with real dates, and keep it current.
- Move to clean URLs: `/services/website-design/`, `/work/`, `/about/`, `/contact/` (do this as part of a rebuild, with 301s from the old `.php` URLs).

### 3.2 Titles and meta descriptions

All five pages share **one meta description**, ~250 characters long, so Google truncates it and every page competes with identical snippets. Subpage titles carry no keywords.

| Page | Current title | Recommended title | Recommended description |
|---|---|---|---|
| Home | `Website Designing Company in Delhi, Website Development India` | `Website Design Company in Delhi \| Sama Solution` | `Custom, responsive websites for Delhi businesses — design, development, SEO and support from a Delhi agency since 2020. Get a free quote in 24 hours.` |
| Services | `Our Services - Sama Solution` | `Web Design, Development & Digital Marketing Services in Delhi` | `Web design, custom development, SEO, Google Ads, branding, mobile apps and video — one Delhi team, fixed timelines, clear pricing.` |
| Who We Are | `Who We Are - Sama Solution` | `About Sama Solution — Delhi Web Design & Digital Agency` | `A Delhi web design and digital marketing agency, founded in 2020. Meet the team, see how we work, and learn what a project looks like.` |
| What We Do | `What We Do - Sama Solution` | `Our Process — Web Design & Marketing \| Sama Solution` | `From discovery to launch: a clear four-step process, fixed milestones and one point of contact for your website project.` |
| Contact | `Contact Us - Sama Solution` | `Contact Sama Solution — Delhi Web Design Agency` | `Call +91 93114 93072, WhatsApp us, or send a brief. New Delhi. Replies within one working day.` |

### 3.3 Headings

The extracted markup shows the brand and page name used as **duplicate H1s** on every interior page:

```
H1  Sama Solution  What We Do
H1  Sama Solution  What We Do     ← duplicate (mobile + desktop nav)
H2  What We Do
```

On the Services page, the seven service names are marked up as **H6**, skipping H3–H5 entirely. That's a hierarchy a screen reader and a crawler both struggle with.

**Fix:** one H1 per page containing the page's primary phrase ("Web design services in Delhi"), then H2 for sections, H3 for cards. Move the logo/brand name out of headings entirely.

### 3.4 Content depth and duplication

The site totals roughly **1,200–1,500 words across five pages**. One paragraph — *"Our Website Development team believes in helping everyone globally…"* — is repeated verbatim on the home page, What We Do and Contacts.

The copy reads like machine-spun English rather than a person writing:

> "Incredible online encounters happen just when an all around arranged UX procedure is envisioned with head class plan style; and we do it best."
>
> "Our master in-house group utilizes forefront advancements to construct programming projects and custom web applications that are staggering, strong and adaptable."

That last sentence says "software" twice while saying nothing about what you build. For an agency selling communication, this is the single most damaging content problem after the 500.

There is also dated material: *"As the world takes on a determined conflict against the pandemic… this lockdown gave us the opportunity…"* — 2020 language on a 2026 site.

**Fix:** rewrite all five pages from scratch, ~500–700 words each, with specifics: technologies, timelines, deliverables, who does the work, what happens after launch. Replace adjectives with facts.

### 3.5 Keyword targeting

There is currently no page that can rank for anything except the home page's "website designing company in Delhi". Recommended mapping:

| Target query | Page |
|---|---|
| website designing company in delhi | Home |
| website design company in delhi | Home |
| web development company in delhi | `/services/web-development/` |
| ecommerce website design delhi | `/services/ecommerce/` |
| seo services delhi | `/services/seo/` |
| google ads agency delhi | `/services/google-ads/` |
| digital marketing agency in delhi | `/services/digital-marketing/` |
| mobile app development company in delhi | `/services/mobile-apps/` |
| website design cost in delhi / price | `/pricing/` |
| website redesign services delhi | `/services/website-redesign/` |

### 3.6 Local SEO

- The only location signal on the entire site is **"New Delhi, India"**.
- No street address, no map embed, no opening hours, no service-area statement.
- No Google Business Profile surfaced in search for the brand.
- No NAP consistency across Justdial, IndiaMART, Sulekha, LinkedIn or Bing Places.
- Facebook lists the page category as **"Social Media Agency"** and hours as **"Always open"** — both undermine a professional services business.

**Fix:** create/claim a Google Business Profile with a real address or service area, categories ("Website designer", "Web development company", "Internet marketing service"), 10+ photos, and a review-request link. Match name, address and phone exactly wherever the business is listed.

### 3.7 Content plan (first 8 articles)

1. How much does a website cost in Delhi in 2026? (real price bands)
2. Website design checklist for Delhi SMEs
3. How to choose a web design company in Delhi: 12 questions to ask
4. WordPress vs custom PHP for a small business site
5. E-commerce website cost in India: a line-by-line breakdown
6. Local SEO checklist for Delhi businesses
7. Website maintenance contracts: what should be included
8. GST, invoices and payment milestones for web projects

Each article should link to one service page and one case study. That is how a five-page site becomes a lead engine.

---

## 4. Performance

**Lab measurement** (Lighthouse 13.5, mobile emulation, `who-we-are.php`, 17 Oct 2026):

| Metric | Value | Target |
|---|---|---|
| First Contentful Paint | **2.9 s** | < 1.8 s |
| Largest Contentful Paint | **3.0 s** | < 2.5 s |
| Speed Index | **4.3 s** | < 3.4 s |
| Time to First Byte | not measured | < 0.8 s |

These are "needs improvement" numbers, not disasters — but they were measured on an interior page. The home page, which carries the hero imagery, could not be measured at all because it returns 500.

**Infrastructure:** single Apache shared host at HTS Solutions, Ghaziabad (AS134475), no CDN, no HTTP/3. HTML responses carry **no `Cache-Control` or `ETag`**, so every page view is a full round trip (Transfer-Encoding: chunked, no compression confirmed).

**Likely weight problems:**

- Hero images are PNG (`about-me.png`, `who-we-are.png`) rather than WebP/AVIF.
- The logo is a **843 × 375 PNG at 19 KB** — far larger than a header logo needs.
- The page prints a "CloseZoom" label, which suggests a leftover third-party lightbox/zoom script is still loading.

**Fix, in order of return:**

1. Serve hero images as WebP/AVIF at 2–3 responsive widths; add `width`/`height` and `loading="lazy"` below the fold.
2. Preload the LCP image, defer non-critical JS, and remove unused template scripts.
3. Add `Cache-Control: public, max-age=31536000, immutable` for static assets and `no-cache` for HTML.
4. Enable Brotli/gzip at the host.
5. Put Cloudflare (free tier) in front — this also gives you a WAF, HTTP/3, and a buffer against the PHP-version and firewall issues.
6. Upgrade PHP (see 2.2).

---

## 5. UX and conversion

### 5.1 There is no contact form

The Contacts page offers a phone number, an email address and a WhatsApp link — and nothing else. For a B2B service where the buyer is often at a desk, comparing three agencies, a form is the lowest-friction way to start. Right now the only options are to call (high commitment) or compose an email from scratch.

**Add:** name, phone, email, service (dropdown), budget (optional), message, consent checkbox. Send to email + WhatsApp/CRM. Confirm with a thank-you page (`/thank-you/`) so conversions can be tracked in GA4 and Ads.

### 5.2 There is no proof

A buyer evaluating a web design agency wants, in order: **work, results, price, people, process, reviews**. The site provides none of the six.

| What buyers look for | On the site today |
|---|---|
| Portfolio / live examples | None |
| Case studies with outcomes | None |
| Testimonials / reviews | None |
| Pricing or packages | None |
| Team, office, photos | None |
| Process and timeline | None |
| Client logos | None |
| Contact form | None |

This is the core commercial gap. It cannot be fixed with design polish; it needs content the business already has (past projects, client names, screenshots, results).

### 5.3 The positioning is split between two unrelated offers

The home page and Services page sell websites and marketing to businesses. The **Who We Are** page sells something else entirely: work-from-home "virtual employment" for women, with "free training to join us", "earn money sitting at home", and paragraphs about military spouses and remote work.

A business owner comparing Delhi agencies reads that page and concludes the company is a staffing/MLM operation with a web design sideline. Whichever business is real, the two need separate pages, separate navigation, or separate sites. **Do not mix them in the primary conversion path.**

### 5.4 Template artefacts and errors

These are visible to visitors and are especially costly for a company that sells web work:

- *"What I'm offering / My Services"* (first person singular on a company site)
- *"My Contact and Socials / How to Find Me"*
- *"Back toTop"*, *"ReturnBack"*, *"CloseZoom"* — unedited theme strings
- *"Send Message on Whatsaap"* — misspelling in the tooltip
- `tel:+9193114 93072` — a space inside the `tel:` URI breaks dialing on some phones
- LinkedIn icon on the Contacts page links to `#` (dead)
- On the archived home page, all four social icons link to `#`

A prospective client who spots "Whatsaap" and "CloseZoom" will assume the same carelessness applies to their project.

### 5.5 Recommended home page structure

1. **Header:** logo · Services (dropdown) · Work · About · Pricing · Blog · Contact · phone · "Get a quote"
2. **Hero:** H1 *"Websites that bring you business — designed and built in Delhi"*; one-line subhead; primary CTA "Get a free quote"; secondary "See our work"; trust row (founding year · projects delivered · Google rating — real numbers only)
3. **Proof bar:** six client logos (grayscale)
4. **Services:** three primary cards (Design, Development, Marketing) linking to full pages
5. **Featured work:** 3–6 projects, each with a screenshot, sector, and one result
6. **Process:** four steps with timings
7. **Pricing:** three packages with what's included
8. **Testimonials:** three, with name, company and photo
9. **FAQ:** 8 questions, FAQPage schema
10. **Final CTA + form**
11. **Footer:** address, GSTIN, CIN, phone, email, policies, map, social

---

## 6. Trust, legal and reputation

### 6.1 The only public review is a 1-star complaint

Trustpilot has **one review** for `samasolution.in`, dated 30 June 2023, rated 1 star. It alleges that the reviewer paid in advance, received an incomplete website, and was then ignored. The Facebook page has **0 reviews** and no rating.

One complaint does not define a business — but when it is the *entire* public record, it defines the search result. Anyone who Googles the brand before calling sees it.

**Do:**

- Reply publicly and factually on Trustpilot (businesses can respond; a calm, specific reply often matters more than the complaint).
- Build a review pipeline: after every delivered project, send a Google review link by WhatsApp.
- Ask 10 past clients this month. Ten honest reviews will outweigh one 2023 complaint in both perception and local ranking.
- Publish 3 testimonials with full names and companies on the site.

### 6.2 No legal or company information

There is no Privacy Policy, Terms of Service, Refund/Cancellation Policy, or company identification anywhere on the site. The site says "Sama Solutions Pvt. Ltd." but shows no CIN, GSTIN or registered address. (A public company-database search did not surface a matching "Sama Solutions Private Limited", so confirm the legal name and display it accurately.) Payment collection and GST invoicing without published terms is a dispute waiting to happen — and Google Ads requires a transparent business identity.

**Add:** `/privacy/`, `/terms/`, `/refund-policy/`, and a footer block with legal name, registered address, GSTIN, CIN, and email.

### 6.3 Claims that need evidence

- *"We Comes in Top 5 Website Designing Company in Delhi"* — by what measure? Unverifiable claims like this invite scepticism; replace with something provable ("120+ websites launched since 2020" — use your real number).
- *"We're a Google Partner"* — this is a specific, checkable status. If true, show the badge and link to the Partners profile. If not, remove it: misstating Google Partner status breaches Google's brand guidelines and Indian consumer-protection norms.
- *"world-known services"*, *"100% fulfilling results"*, *"a great deal of honors and grants"* — either name the awards or delete the sentences.

### 6.4 Brand-name collision

Searching "Sama Solution" returns Sama (the AI data company), Sama Solutions (Miami HR consultancy), Sama Solutions (France), and Sama Solution (Mexico), among others. The brand is generic and the site does nothing to disambiguate it. Use a consistent branded suffix ("Sama Solution Delhi") on every profile, add `sameAs` links in schema, and claim the knowledge panel via Google Business Profile.

---

## 7. Security and infrastructure

| Check | Result | Recommendation |
|---|---|---|
| HTTPS | Valid, enforced (301) | Keep; renew automatically |
| HSTS | **Missing** | Add `Strict-Transport-Security: max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | **Missing** | `nosniff` |
| X-Frame-Options / CSP frame-ancestors | **Missing** | `SAMEORIGIN` or CSP |
| Referrer-Policy | **Missing** | `strict-origin-when-cross-origin` |
| Permissions-Policy | **Missing** | Restrict camera/mic/geolocation |
| Server banner | `X-Powered-By: PHP/7.4.33` | Remove; upgrade PHP |
| DNSSEC | **Not enabled** | Enable at registrar |
| SPF | `v=spf1 +a +mx +ip4:103.160.129.7 ~all` | Replace `+a` with explicit senders; end with `-all` |
| DMARC | `v=DMARC1; p=none;` | Add `rua`, then move to `p=quarantine` → `p=reject` |
| DKIM | Not verified | Confirm it is enabled in cPanel Email Deliverability |
| Staging hosts | Publicly reachable | Basic Auth + `noindex` |
| Backups | Unknown | Daily automated + monthly offsite copy |

Two additional observations:

- **The server dropped the TLS handshake from this audit's sandbox IP**, while three third-party fetchers succeeded. That points to IP/geo filtering at the host (CSF, Imunify360, or similar). It rarely affects residential visitors, but it can cause false downtime alerts from monitoring services hosted abroad and can block legitimate crawlers. Worth reviewing the firewall's blocklist.
- **No WAF or CDN** sits in front of the origin. Cloudflare's free plan would absorb basic attacks, add HTTP/3 and caching, and hide the origin IP.

---

## 8. Accessibility

| Issue | Evidence | Fix |
|---|---|---|
| Missing alt text | Most `<img>` elements render with empty alt (service icons, `who-we-are.png`, WhatsApp icon) | Descriptive alt; `alt=""` only for decorative images |
| Duplicate H1s | Two identical H1s per page (mobile + desktop nav) | One H1 per page |
| Heading order | Services page jumps H1 → H6 | H2 section, H3 cards |
| Link text | "Fb", "IG", "Tw", "In" | "Facebook", "Instagram", "X (Twitter)", "LinkedIn" |
| Tiny targets / contrast | Not measured | Run axe DevTools + Lighthouse a11y; target 95+ |
| Keyboard focus | Not measured | Visible focus ring on all interactive elements |

Accessibility is not only a compliance issue: the same fixes improve how Google reads the page.

---

## 9. 30 / 60 / 90-day plan

### Week 1 — stop the bleeding

| # | Action | Owner | Effort |
|---|---|---|---|
| 1 | Restore `index.php`; verify `/` returns 200 | Dev/host | 1–4 h |
| 2 | Uptime monitoring with alerts on 3 URLs | Dev | 30 min |
| 3 | Add GA4 + Search Console + Bing Webmaster; submit sitemap | Marketing | 1 h |
| 4 | Fix broken LinkedIn link, `tel:` spaces, typos, theme artefacts | Dev | 2 h |
| 5 | Add a contact form + `/thank-you/` page; test delivery | Dev | 3 h |
| 6 | Publish Privacy, Terms, Refund pages; add GSTIN/CIN/address | Owner | 2 h |
| 7 | Password-protect all `*.samasolution.in` staging hosts | Host | 30 min |
| 8 | Reply to the Trustpilot review | Owner | 30 min |

### Month 1 — make the site credible

9. Rewrite all five pages (unique titles, descriptions, single H1, specifics).
10. Add **Work** (6 projects) and **Testimonials** (5) pages.
11. Publish **Pricing** with three packages and a "what's included" table.
12. Create/claim Google Business Profile; upload 10 photos; add review link.
13. Upgrade to PHP 8.2; add security headers; enable HSTS; tighten SPF; DMARC to `p=quarantine`.
14. Image optimisation, cache headers, Cloudflare.
15. Ask 10 past clients for Google reviews.

### Month 2 — build the organic engine

16. Seven service pages (design, development, e-commerce, SEO, ads, apps, redesign).
17. Four guides from the content plan; internal links to services and work.
18. Add LocalBusiness + Service + FAQPage schema.
19. Fix the apex/www and `/index.php` duplicates with 301s; publish `robots.txt`.
20. Monthly reporting: GSC impressions/clicks, GA4 enquiries, calls, WhatsApp.

### Month 3 — compound

21. Three case studies with before/after metrics.
22. Location pages only if there is a real presence (Delhi NCR first; don't fake Mumbai).
23. A/B test hero and CTA.
24. Decide on rebuild: the current template has no blog, no CMS, no form and no schema. A static or Next.js rebuild would be faster and easier to maintain than retrofitting this one.

---

## 10. Quick wins (under two hours each)

- Restore the home page.
- Delete *"Whatsaap"*, *"CloseZoom"*, *"Back toTop"*, *"ReturnBack"*.
- Fix the dead LinkedIn icon.
- Remove the space in the `tel:` URI (three places).
- Replace the sitewide meta description with five unique ones.
- Change the Facebook category from "Social Media Agency" to "Web Designer" and set real hours.
- Add alt text to the seven service icons and two hero images.
- Add a footer line with the legal name, address and GSTIN.
- Add "Since 2020 · New Delhi" under the hero.
- Ask three clients for a Google review today.

---

## 11. What "good" looks like

**Recommended sitemap**

```
/                                  Home
/services/                         Services overview
/services/website-design/          Website design
/services/web-development/         Web development
/services/ecommerce/               E-commerce
/services/seo/                     SEO
/services/google-ads/              Google Ads
/services/digital-marketing/       Digital marketing
/services/mobile-apps/             Mobile apps
/work/                             Portfolio
/work/[project]/                   Case studies
/about/                            About + team
/pricing/                          Packages
/blog/                             Guides
/contact/                          Contact + form
/privacy/  /terms/  /refund-policy/
```

**Targets for 90 days**

- Home page uptime 99.9%, monitored.
- Mobile LCP < 2.5 s; CLS < 0.1; INP < 200 ms.
- 12+ indexed pages, up from 4.
- 10+ Google reviews, 4.5★ average.
- 3 case studies, 6 portfolio items, published pricing.
- One tracked conversion path (form → thank-you → GA4 event).

---

## Appendix A — Page inventory

| URL | Status | Title | Words (approx.) | Issues |
|---|---|---|---|---|
| `/` | **500** | Website Designing Company in Delhi, Website Development India | — | Down; duplicate of `/index.php` |
| `/index.php` | **500** | same | — | Duplicate home URL |
| `/who-we-are.php` | 200 | Who We Are - Sama Solution | ~600 | Duplicate H1; WFH-recruitment content; generic title |
| `/what-we-do.php` | 200 | What We Do - Sama Solution | ~350 | Duplicate H1; pandemic-era copy; duplicated paragraph |
| `/services.php` | 200 | Our Services - Sama Solution | ~250 | H6 card headings; generic title; no detail |
| `/contacts.php` | 200 | Contact Us - Sama Solution | ~120 | No form; dead LinkedIn; no address |

## Appendix B — Evidence

Raw checks, headers, DNS records, Lighthouse metrics and archive timeline are recorded in [`evidence-log.md`](./evidence-log.md).

## Appendix C — Limits of this audit

- **No visual review.** The origin server refused the TLS handshake from this audit environment, so pages were assessed through independent fetchers, extracted markup and third-party renderers rather than a live browser session. Layout, colour contrast and mobile rendering should be reviewed manually.
- **No analytics or Search Console access.** Traffic, rankings, conversions and crawl errors could not be measured; conclusions about search visibility come from public `site:` queries and snippets.
- **One Lighthouse run** on one URL under mobile emulation. Field data (CrUX) may differ.
- **No backlink, ads or competitor-spend data.**
- The Trustpilot review is one user's account, reported as published, not as established fact.

---

*Prepared 17 October 2026. Re-check the home page status before acting on any other item — everything else assumes visitors can reach the site.*
