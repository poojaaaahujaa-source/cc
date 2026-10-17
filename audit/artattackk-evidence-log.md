# Evidence log — artattackk.com

Collected **17 October 2026, 07:29–07:33 UTC**. All raw output below was produced during the teardown.

---

## 1. HTTP headers — homepage

```
$ GET https://www.artattackk.com/
HTTP/1.1 200 OK
Server: cloudflare
Content-Type: text/html; charset=UTF-8
Transfer-Encoding: chunked
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-frame-options: SAMEORIGIN
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), camera=(), microphone=()
content-security-policy: default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';
Cache-Control: public, max-age=0, s-maxage=2592000
Age: 909456
last-modified: Tue, 06 Oct 2026 18:53:21 GMT
cf-cache-status: HIT
Content-Encoding: gzip
alt-svc: h3=":443"; ma=86400
```

**Read:** Cloudflare CDN, HTTP/3, HSTS preload, 30-day edge cache (`s-maxage=2592000`), gzip. Note `unsafe-inline` and `unsafe-eval` in the CSP.

## 2. Non-canonical host

```
$ GET https://artattackk.com/
HTTP/1.1 301 Moved Permanently
location: https://www.artattackk.com/
...
HTTP/1.1 200 OK
```

Canonical host enforcement works.

## 3. 404 handling

```
$ GET https://www.artattackk.com/this-page-does-not-exist-xyz123/
HTTP/1.1 404 Not Found
cf-cache-status: BYPASS
```

Correct status code (not a soft 404). The 404 page is a custom themed page ("All you'll get here is music and swag") that links to `/blog/`.

## 4. Blog redirect chain

```
$ GET https://www.artattackk.com/blog/
HTTP/1.1 301 Moved Permanently
location: https://artattackk.com/blogs/

$ GET https://artattackk.com/blogs/
HTTP/1.1 301 Moved Permanently
x-redirect-by: WordPress
location: https://www.artattackk.com/blogs/

$ GET https://www.artattackk.com/blogs/
HTTP/1.1 200 OK
```

Three hops, one of which drops to the non-www host.

## 5. Sitemap inventory

**Index:** `/sitemap.xml` → 4 children, all `lastmod 2026-04-30`:
`sitemap-pages.xml`, `sitemap-services.xml`, `sitemap-portfolio.xml`, `sitemap-posts.xml`

**`sitemap-services.xml` — 78 URLs.** Structure:

| Cluster | Count | Examples |
|---|---|---|
| Web design | 12 | `website-designing-company-india`, `corporate-and-business-website-design-company-in-delhi-ncr`, `ux-and-ui-website-design-company-in-delhi-ncr`, `campaign-landing-page-design-company-in-delhi-ncr` |
| Shopify | 7 | `shopify-experts-india`, `shopify-web-designers-india`, `shopify-ecommerce-audits`, `shopify-migration-company`, `psd-shopify-development`, `shopify-priority-support-company`, `digital-marketing-for-shopify-in-india` |
| WordPress | 6 | `wordpress-development-company-india`, `wordpress-speed-optimization-service-india`, `psd-wordpress-service-india`, `wordpress-support-services-india`, `wordpress-customization-services-india`, `wordpress-migration-services` |
| Other platforms | 4 | WooCommerce, OpenCart, Magento, open-source |
| Apps | 6 | iOS, Android, Flutter, React Native, e-commerce apps, OTT apps |
| Branding / design | 8 | logo, brochure, packaging, graphic, infographic & motion, visual design, video editing |
| Digital marketing | 13 | digital marketing services, strategy, PPC, Quora, guest posting, email, CRO, media buying, lead-gen, performance marketing |
| Social media | 7 | page management, creative management, advertising, influencer, campaigns, brand management, Instagram |
| SEO | 7 | on-page, off-page, content writing, link building, audit, local SEO, ORM |
| Speed / maintenance | 2 | page speed optimisation, website maintenance |

**`sitemap-pages.xml`:** core pages (about, contact, career, current-openings, clients, value, outsourcing, presentation, portfolio, case-studies-listing), **≈50 case studies**, resources (4), learn (5), **≈80 directory pages**, 3 city pages, **12 `/noida/*` pages**.

**`sitemap-posts.xml`:** ~60 posts across 11 categories — **all URLs on `https://artattackk.com` (non-www)**.

## 6. WordPress REST — main install

```
$ GET https://www.artattackk.com/wp-json/
{
  "name": "Artattackk Web Design Agency",
  "url": "https://www.artattackk.com",
  "page_on_front": 10901,
  "namespaces": ["oembed/1.0","akismet/v1","contact-form-7/v1","tnp","redirection/v1",
                 "rankmath/v1","rankmath/v1/setupWizard","wordfence-login-security/v1",
                 "wordfence/v1","rankmath/v1/ai-visibility","rankmath/v1/ca","rankmath/v1/an",
                 "rankmath/v1/in","rankmath/v1/status","mcp","wp/v2","wp-site-health/v1",
                 "wp-block-editor/v1","wp-abilities/v1"]
}
```

**Plugins identified:** Rank Math SEO, Wordfence, Contact Form 7, Redirection, Newsletter (tnp), Akismet.

```
$ GET https://www.artattackk.com/wp-json/wp/v2/users
{"code":"rest_user_cannot_view","message":"Sorry, you are not allowed to list users.","data":{"status":401}}
```

User enumeration blocked.

## 7. WordPress REST — blog install (separate)

```
$ GET https://www.artattackk.com/blogs/wp-json/
{
  "name": "wordpress",
  "url": "https://www.artattackk.com/blogs",
  "page_on_front": 8,
  "namespaces": ["oembed/1.0","contact-form-7/v1","wordfence/v1","yoast/v1",
                 "wp/v2","wp-site-health/v1","wp-block-editor/v1","wp-abilities/v1"]
}
```

**Conclusion:** `/blogs/` is a **second, independent WordPress installation**. It uses **Yoast**, not Rank Math; has its own Contact Form 7 and Wordfence; and still carries the default site title `wordpress`.

## 8. Sitemap URL that redirects to home

```
$ GET https://www.artattackk.com/directory/top-10-website-designing-companies-in-delhi/
301 → https://artattackk.com/
301 → https://www.artattackk.com/
200 (homepage)
```

Confirmed with a headless-browser fetch: `statusCode 200`, `redirects: [{301, directory URL}, {301, https://artattackk.com/}]`, final `url: https://www.artattackk.com/`.

A second directory URL (`/directory/top-10-seo-companies-in-india/`) returns **200** normally — so the breakage is partial and unmonitored.

## 9. Lighthouse — mobile

`api.microlink.io` (Lighthouse 13.5.0, HeadlessChrome 154, Moto G Power emulation), homepage:

| Metric | Value |
|---|---|
| First Contentful Paint | 3,901 ms (**3.9 s**) |
| Largest Contentful Paint | 5,928 ms (**5.9 s**) |
| Speed Index | 4,015 ms (4.0 s) |
| HTTPS | Pass |

Wappalyzer detections: WordPress, MySQL, PHP, HSTS, Cloudflare, HTTP/3.

The edge cache is a `HIT` with `Age: 909456` (~10.5 days), so the 3.9 s FCP is **client-side render blocking**, not server latency.

## 10. Service pages — content and defects

### `/website-designing-company-india/`
- Title: `Top Ranked Website Designing Company in India |Web Design` (missing space)
- CTA **"Get In Touch" links to the same page**
- 10 consecutive empty `<h6>latest project</h6>` headings before project cards
- `ecommerce-website.webp` used as the thumbnail for **four different services** (mobile, dynamic, static, campaign landing)
- Stats: `1 million+ Users Growth`, `3000% Onboarding Conversion Increase`, `43% Retention Rate Growth`, `120% CRO in SaaS Improved`
- Marquee: 9 phrases × 4 repetitions

### `/ecommerce-website-development-delhi-ncr/`
- Stats: `250+ Store Launched`, `$2B+ Revenue Empowered`, `14+ Years of Experience`, `6+ Awards Won`
- Marquee: 11 phrases, repeated with visible duplication including `Visions Transform. Visions Transform.`
- "We are Illustrious Ecommerce Website Developers in Delhi. Honour fuels our success."

### `/branding-company-india/`
- Entire "What we make" block and the "Book a Discovery Call" CTA **rendered twice**
- "Book a Discovery Call" **links to the same page**
- Emoji used in body copy (✨ 👀 💖 🤯)

### `/mobile-app-development-company-india/`
- Projects "Modi Care", "Greaser" and "Search Education" all carry the subtitle **"Pre-owned luxury cars Company"**
- Identical 10-item service list pasted under every project
- Marquee: 6 keyword phrases repeated 4×
- Stats: `100%`, `80%`, `98%`, `120%` — labels repeat the ones used on other pages
- Title has no brand separator: `Mobile App Development Company India - Artattackk Web Design Agency`

### `/casestudies/bbt/`
- Hero image, one paragraph, 9-bullet deliverable list, one gallery image, "You may also like"
- **No problem statement, no metrics, no timeline, no client quote, no live link**
- Decorative artefact renders as `January –012–0–012–01`
- "You may also like" repeated 10× as a marquee string

### `/about/`
- No named team; department names are jokes: *Creative Guys, Blabbermouths, BDM Bandhu, SEO Wale, SMM Team, Baburao, HR Billi*
- Vimeo showreel iframe `vimeo.com/127917189`
- Both **"14 Years"** and **"13 YEARS"** visible on the same page

### `/contact/`
- First dropdown option is literally `—Please choose an option—Why here, bro?`
- Phone `+91-9499399914`; address E-92 Masjid Moth, GK-3
- Map is a static image (`img-contactus-map.jpg`) with an external Google Maps link
- Body copy: "Now roll over, we'll get back to you."

### `/portfolio/`
- 35 client thumbnails, all served from **theme folders** (`/site/images/portfolio-*.png`)
- Same banner present as both `.gif` and `.jpg`

## 11. Reputation cross-check (public sources)

| Source | Figure |
|---|---|
| Google (via Rannkly/Techreviewer) | **4.2 / 5**, 23–24 reviews |
| Justdial listing A | 4.1 / 25 ratings, "Year of Establishment **2019**" |
| Justdial listing B | 3.9 / 9 ratings, "9 years in business" |
| Rannkly aggregate | 4.9 / 5 from 2,384 reviews (Google 23, Art 2,300, Justdial 23, Reviews 38) |
| Clutch | 10–49 employees, $25–49/hr, $1,000+ min, founded 2009 |
| Techreviewer | 50–99 employees, <$20/hr, <$5,000 min, founded 2009 |
| TopSEOs | 10+ employees, revenue ₹3 crore, 100 active clients, 95% retention |

**Inconsistencies:** headcount (10–49 vs 50–99), hourly rate ($25–49 vs <$20), founding year on Justdial (2019 vs 2009).

**Self-serving directory markup (search snippet):**
```
{"name":"Website Designing Company In Delhi",
 "aggregateRating":{"ratingValue":"4.9","ratingCount":"2300","reviewCount":"4300"}}
```
`ratingCount` (2,300) ≠ `reviewCount` (4,300), and the rating is self-published on a page that ranks the company #1.

## 12. Bug list — reproduction

| # | Bug | Where |
|---|---|---|
| 1 | Primary CTA links to its own page | website-designing, branding, mobile-app |
| 2 | 10 empty `<h6>latest project</h6>` | website-designing |
| 3 | One image reused for 4 services | website-designing |
| 4 | Wrong project subtitles ("Pre-owned luxury cars Company" ×3) | mobile-app |
| 5 | Sitemap URL 301s to homepage | directory (Delhi, website designing) |
| 6 | Non-www URLs in sitemap | sitemap-posts.xml |
| 7 | `/blog/` → 2 redirects, host change | blog |
| 8 | Duplicate case studies (BBT, Wishnew, Lotus, QHT) | /casestudies/* |
| 9 | Portfolio images live in theme, not media library | /portfolio/ |
| 10 | Logo served as GIF | `aa-logo.gif` |
| 11 | "Why here, bro?" in form dropdown | contact, sitewide forms |
| 12 | Phone is a Telangana mobile; Justdial says founded 2019 | sitewide |
| 13 | Raw Vimeo iframe (no facade) | /about/ |
| 14 | CSP allows `unsafe-inline` + `unsafe-eval` | sitewide |
| 15 | Duplicate sections/hero/logo strip | home, branding |

## 13. Not completed

| Check | Reason |
|---|---|
| Rendered visual/screenshot review | Origin refused this environment's TLS handshake; no local browser |
| Computed CSS (fonts, colours, breakpoints) | Theme CSS is split across multiple files; only root `style.css` was retrievable (`gooddogregular` font, gif-sprite button) |
| Search Console / GA4 / Ads | No access |
| Core Web Vitals field data (CrUX) | No API key |
| Server-side PHP version, DB, caching config | Cloudflare strips origin headers |
| SSL Labs grade | No cached result returned |
| Screenshot-based colour contrast | No render |
