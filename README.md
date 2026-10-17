# Website teardowns & audits

Three independent studies, carried out **17 October 2026** by inspecting live HTTP responses, sitemaps, WordPress REST endpoints, Lighthouse lab runs, registry/financial filings and public reputation data.

| Site | What it is | Focus | Overall | Report |
|---|---|---|---|---|
| **samasolution.in** | 5-page Delhi web-design brochure site | Technical & credibility audit | **3.3 / 10** | [`audit/samasolution-website-audit.md`](audit/samasolution-website-audit.md) |
| **artattackk.com** | 320+ URL Delhi agency with a full content engine | Design, services, stack, SEO | **5.6 / 10** | [`audit/artattackk-teardown.md`](audit/artattackk-teardown.md) |
| **auroguard.co.in** | B2B highway-safety manufacturer, ~41,400 URLs | How the market-area grid actually works | **5.4 / 10** | [`audit/auroguard-market-area-report.md`](audit/auroguard-market-area-report.md) |

## Headlines

**samasolution.in**
- 🔴 Home page returns **HTTP 500** (empty body); interior pages return 200.
- 🔴 PHP 7.4.33 (end-of-life since Nov 2022); client staging subdomains publicly reachable.
- 🟠 5 pages, sitemap last modified 2020, no `robots.txt`, no contact form, no portfolio or pricing.
- 🟠 Only public review is a 1-star Trustpilot complaint.

**artattackk.com**
- 🔴 **LCP 5.9 s / FCP 3.9 s on mobile** — for a web design agency, the headline failure.
- 🔴 Primary CTAs on the top three service pages **link back to themselves**.
- 🟠 Two separate WordPress installs (`/` with Rank Math, `/blogs/` with Yoast).
- 🟠 Contradictory proof: "13 years", "14 years", "since 2009" (17) on the same page; "500+" vs "1,014+" projects.
- 🟢 Genuinely strong: 78 service pages, 50 case studies, 35 portfolio pages, ~80 programme pages, excellent security headers, Cloudflare + HTTP/3, HSTS preload.

**auroguard.co.in**
- 🔴 Market area = **737 cities × 55 products = 40,535** near-identical city-product pages, plus 773 hubs — **≈41,400 URLs** on a **7-month-old domain**.
- 🔴 One Kolkata room as the registered office; **no factory, depot, dealer or branch published** on any of 8 domains.
- 🔴 Three different product counts on one page: hero **62**, category cards **65**, sitemap **55**; state count **28+ vs 310+ vs 36**; zinc **4,744 g/m² vs 550**.
- 🟠 "Since 2005" / "over two decades" vs MCA incorporation **19 Feb 2020**, paid-up **₹5 lakh**, revenue under **₹10 Cr**.
- 🟢 Genuinely ahead: `llms.txt` plus **18 individually named AI crawlers** welcomed in `robots.txt` — Generative Engine Optimisation most Indian manufacturers haven't started.
- 🟢 Fast custom PHP 8.3 / Hostinger stack, HTTP/3, HSTS, real technical depth in the blog (IRC:119, MoRTH §800, containment classes).

## Evidence

| File | Contents |
|---|---|
| [`audit/artattackk-evidence-log.md`](audit/artattackk-evidence-log.md) | Raw headers, REST namespaces, sitemap inventory, page defects, reputation cross-check |
| [`audit/evidence-log.md`](audit/evidence-log.md) | samasolution.in headers, DNS, RDAP, certificates, Lighthouse, archive history |

## Reading order

1. `audit/samasolution-website-audit.md` §1–2 — the 500 error and the P0 fixes.
2. `audit/artattackk-teardown.md` §3–6 — what a 320-page agency content engine looks like.
3. `audit/artattackk-teardown.md` §15 — what to steal, what to avoid.
4. `audit/artattackk-teardown.md` §16 — 30/60/90 plan.
5. `audit/auroguard-market-area-report.md` §3 — the grid maths, decoded.
6. `audit/auroguard-market-area-report.md` §12–15 — the 30/60/90 fix plan and scorecard.

---

*Limits: no rendered visual review (all three origins refused this environment's TLS handshake, so analysis is from markup, assets and third-party renderers), no Search Console or analytics access, third-party company data is unconfirmed.*
