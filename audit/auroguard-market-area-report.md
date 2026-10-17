# Auroguard — Market Area Teardown

**Site:** https://www.auroguard.co.in/
**Date:** 17 October 2026
**Focus:** how the market area is constructed and how it actually works commercially
**Method:** full sitemap crawl, entity verification (MCA/CIN/GST), domain registry, multi-domain cross-check, page-level inspection of city and city×product templates, buyer-side procurement analysis

---

## 1. The answer in one paragraph

Auroguard's "market area" is **not a distribution map — it is a demand-capture grid.** The company has exactly one office (a room on the 4th floor of 26/1/1B Strand Road, Kolkata) and no published factory, depot, dealer or branch anywhere in India. What it *does* have is **~41,400 web pages** built on a Cartesian product: **737 Indian cities × 55 products = 40,535 city-product pages**, plus 737 city hubs, 36 state hubs and 55 product pages. Each page asserts that Auroguard supplies that product in that town, quotes a transit window from the nearest rail yard, and funnels to one phone number. That grid — not a warehouse network — is the market area. It is a **B2B lead-generation machine dressed as a national supply footprint.**

Whether that works is a separate question, and the honest answer is: **it is working as SEO, it is not yet working as proof.** More on that below.

---

## 2. Entity reality check

Before judging the market area, the entity behind it matters — because in infrastructure procurement, the entity *is* the product.

| Field | Value | Source |
|---|---|---|
| Legal name | **AUROGUARD PRIVATE LIMITED** | MCA |
| CIN | **U46630WB2020PTC236553** | MCA |
| Incorporated | **19 February 2020** | MCA |
| Registrar | RoC Kolkata, West Bengal | MCA |
| Status | Active | MCA |
| Directors | **Hitesh Lunia** (from incorporation), **Radhika Lunia** (from 26 Sep 2025) | MCA |
| Authorised capital | ₹10,00,000 | MCA |
| **Paid-up capital** | **₹5,00,000** | MCA |
| Revenue (FY ending Mar 2025) | **under ₹10 crore** | Tracxn |
| GSTIN | 19ABDCS4672B1ZC (West Bengal) | TradeIndia/IndiaMART listings |
| Registered office | 26/1/1B Strand Road, 4th Floor, **Room No. 6**, Near Marshall House, Kolkata 700001 | MCA / site |
| Factory address | **Not published anywhere** across 8 domains | — |
| Domain `auroguard.co.in` registered | **26 March 2026** (≈7 months old) | RDAP |
| Hosting | Hostinger (hcdn), PHP 8.3.35, custom stack | HTTP headers |

**Three things follow from this:**

1. The website is **seven months old**, not seventeen years old. Everything on it was built this year.
2. The company is **six years old** with ₹5 lakh paid-up capital — a micro-entity by infrastructure standards, where a single NHAI package runs into tens of crores.
3. There is a **legacy operating business** underneath: *Om Wire & Wire Products Industries*, a proprietorship of Hitesh Lunia, trading since **2005** and holding a **16-year-old TradeIndia membership**. Auroguard Pvt Ltd (2020) appears to be the corporate re-brand of that older trading/manufacturing business — which is why several sibling sites say "since 2005" and "two decades of manufacturing excellence".

That legacy is the real asset. The problem is that **none of it is visible on the flagship site**: no factory photographs, no plant address, no machinery list, no certifications, no completion certificates, no client logos, no project references, no team page. A procurement officer evaluating a supplier of highway barriers will look for all of those in the first ten minutes. The site gives them a transit table and a phone number instead.

---

## 3. The grid — the actual maths

### 3.1 Structure

```
/                                 → home
/products                         → 55 SKUs across 6 categories
/product/{slug}                   → national product page (55)
/market-area                      → 36 states/UTs, 737 cities
/{state}/                         → state hub (36)
/{city}/                          → city hub (737)
/{city}/{product}.htm             → city × product (40,535)
/blogs, /blog/{slug}              → 30+ technical guides
```

### 3.2 Scale

| Layer | Count |
|---|---|
| States & UTs | **36** |
| Cities / districts | **737** |
| Products (actual catalogue) | **55** |
| Products (hero counter) | 62 |
| Products (sum of six category cards) | 65 |
| **City × product pages** | **40,535** |
| City hubs | 737 |
| State hubs | 36 |
| Product pages | 55 |
| Blog / editorial | ~35 |
| **Total addressable URLs** | **≈41,400** |

**Pages per SKU: 737.** Every single product in the catalogue gets its own page for every district in India.

### 3.3 Where the "coverage" is concentrated

| State | Cities claimed | Share |
|---|---|---|
| Uttar Pradesh | **77** | 10.4% |
| Madhya Pradesh | 51 | 6.9% |
| Bihar | 43 | 5.8% |
| Maharashtra | 38 | 5.2% |
| Delhi | 34 | 4.6% |
| Gujarat | 34 | 4.6% |
| Rajasthan | 33 | 4.5% |
| Tamil Nadu / Odisha | 32 each | 4.3% each |
| West Bengal (home state) | 31 | 4.2% |
| Karnataka | 31 | 4.2% |
| … | … | … |
| Lakshadweep | 3 | 0.4% |
| Ladakh | 2 | 0.3% |
| Andaman & Nicobar | 2 | 0.3% |

The distribution is **population-weighted, not infrastructure-weighted** — which is the first sign this is an SEO build rather than a sales-territory plan. India's highway construction spend is concentrated in corridors (Golden Quadrilateral, Bharatmala, NH-44, NH-48, eastern freight corridors), not evenly across 737 districts. A genuine territory plan for a Kolkata manufacturer would weight by **NHAI project value, EPC contractor HQ locations, and state PWD budgets** — giving you maybe 120–150 priority districts, not 737.

### 3.4 The template: how localisation is manufactured

Here is the actual mechanism, page by page. Every city-product page assembles the same seven blocks with four local variables swapped in:

| Variable | Source | Example |
|---|---|---|
| **City + state** | city database | "Howrah, West Bengal" |
| **Transit window** | distance-band rule from Kolkata | 2–3 days (Howrah), 4–5 days (Greater Noida), 8–10 days (Agatti) |
| **Nearest rail yard** | manual mapping | Kolkata, Lucknow, Kochi |
| **Climate/terrain rationale** | region tag | "high humidity and saline coastal exposure" (Kolkata), "salt spray and tropical humidity" (Agatti), "plains alluvium with seasonal sub-grade weakening" (Greater Noida), "plains with seasonal frost and waterlogging risk" (Barnala) |
| **Named corridors** | region tag | "Asian Highway 1 (Kolkata–Petrapole) and Bharatmala East-West", "NH-44 Golden Quadrilateral and Delhi–Amritsar–Katra Expressway", "Purvanchal Expressway, Ganga Expressway, NH-19" |

Then it repeats the **same technical specification table** on every single page — for W Beam, the identical nine-row table appears on the national product page, the Kolkata page, and all 737 city pages.

**This is the honest assessment of the localisation:** the *variables* are genuinely thought through (the transit and climate logic is better than most Indian manufacturer sites), but the *body* — 80% of the words — is identical across 40,000 pages. Google sees 737 near-duplicates of the same document with the city name substituted.

### 3.5 Examples of the finished output

**Kolkata** (home turf):
> "Auroguard supplies all 62 products to Kolkata direct from the factory… **2-3 days** typical transit, Kolkata rail dispatch yard. Finish and packaging matched to high humidity and saline coastal exposure — supporting corridors such as Asian Highway 1 (Kolkata–Petrapole) and Bharatmala East-West corridor."

**Agatti, Lakshadweep** (the extreme edge of the grid):
> "Auroguard supplies all 62 products to Agatti direct from the factory… **8-10 days** typical transit, **Kochi** rail dispatch yard. Hot-dip galvanised and weather-matched for salt spray and tropical humidity — built for the corridors around Agatti."

**Greater Noida:**
> "…dispatch in **4-5 days**… Rail Yard **Lucknow**… supporting corridors such as Purvanchal Expressway, Ganga Expressway, NH-19."

**Why this matters:** the Agatti page is the tell. Lakshadweep has 36 islands and roughly 10 km of motorable road. There is no highway crash-barrier market there. Yet the page confidently promises "all 62 products to Agatti" in 8–10 days. Multiply that by the hundreds of low-demand districts in the grid and the site's coverage claim stops being a promise and becomes a template artefact.

### 3.6 Data quality bugs in the grid

| Bug | Evidence |
|---|---|
| **Duplicate city slugs** | `aurangabad`, `balrampur`, `bilaspur`, `bishnupur`, `chatra` each appear **twice** in `sitemap-cities.xml` — different districts with the same name collapse into one URL |
| **Three product counts** | Hero says **62**; the six category cards add up to **15+16+4+15+11+4 = 65**; the catalogue and sitemap contain **55**. City pages repeat "all 62 products" across 737 pages |
| **Persistent typo** | "**BITIMUNOUS** GEOMEMBRANE" (should be *bituminous*) — in the product title and in the URL slug, replicated across ~737 pages |
| **Two state counts that contradict** | Hero stat block: **"28+ States & UTs Served"**. Lower stat block, same page: **"310+ States & UTs Served"**. `/market-area` lists **36**. India has 36 |
| **Impossible coating figure** | Lower stat block: **"4744 g/m² Min. Zinc Coating"** — the actual spec (correctly stated elsewhere on the same site) is **550 g/m²** |
| **Impossible "percent"** | Lower stat block: **"862% Factory-Direct Supply"** — a share cannot exceed 100% |
| **Every URL stamped today** | All ~41,400 sitemap entries carry `lastmod 2026-10-17` — regenerated wholesale, which teaches Google the date is meaningless |

The lower block is almost certainly a **broken counter animation**: the values render as `-535`, `-310+`, `-4744`, `-862%`, with a stray minus sign and digit collisions, and its labels are copy-pasted from the hero block (a "Factory-Direct Supply" figure printed as a percentage). It looks like a template was designed for four numbers and filled with placeholders that were never replaced.

But a visitor doesn't see a bug — they see an infrastructure supplier claiming **310 states in a country of 36**, **4,744 g/m² galvanising on a product whose own spec sheet says 550**, and **862% of something**. For a tender-driven buyer, that is disqualifying. And because the *correct* numbers already exist on the same page (62 / 28+ / 550), the bug is self-inflicted rather than a data problem.

---

## 4. The multi-domain footprint

The grid is not run once. It is run across **at least eight domains**, all presenting the same company:

| Domain | Role | Notes |
|---|---|---|
| **auroguard.co.in** | Flagship | Registered Mar 2026. Full 41k grid, AI-crawler optimised |
| auroguard.in | Older/parallel brand site | "Crash Barrier Manufacturers in Kolkata", geo-tagged to Strand Road |
| auroguardpvtltd.com | IndiaMART-generated catalogue microsite | Shows IndiaMART virtual number 08045813756; product URLs like `-13198441.html` |
| omwireproducts.com | Legacy "Om Wire" brand | Same city grid (`/kerala/`, `/bagalkot/`) |
| omengineringworks.com | Legacy "Om Engineering Works" (typo domain) | "Over two decades of manufacturing excellence" |
| omengineeringwork.co.in | Legacy, TradeIndia-style listing | "Hitesh Lunia (Proprietor) … Trader – Wholesaler / Distributor" |
| concertinarazorwire.net | **Exact-match keyword domain** | Runs its own `/market-area` |
| wbeamhighwaycrashbarrier.com | **Exact-match keyword domain** | "Since 2005", brand listed as "Om Wire Pvt Ltd" |

**What this is:** a portfolio of exact-match and legacy domains used to occupy as many "crash barrier / concertina wire / W beam" search surfaces as possible, with the same content re-deployed on each.

**What it costs:**
- **Brand fragmentation.** A buyer Googling "Auroguard" finds eight sites with three different founding claims ("Since 2005" / "over two decades" / MCA 2020), three different product counts (55 / 62 / 67), and two different legal descriptions (trader-wholesaler vs manufacturer).
- **Cross-domain duplication.** Identical city grids on multiple domains with no canonical relationship. If one gets discounted as doorway content, the pattern is visible across all.
- **No single source of truth.** `omwireproducts.com/kerala/` says "**67 product categories**"; `auroguard.co.in/kolkata/` says "**62 products**"; the catalogue has **55**.

---

## 5. How the funnel actually works

Strip the visuals away and the go-to-market is one line:

```
Search ("w beam crash barrier supplier in <district>")
        ↓
City-product landing page (transit + specs + corridors)
        ↓
One phone (+91 90510 39176) / WhatsApp / 5-field form
        ↓
"Send your BOQ" → quotation from the engineering desk
        ↓
Dispatch from Kolkata (or nearest rail yard)
```

**What is present:**
- Direct-desk positioning ("no middlemen, no broker inflation")
- BOQ-driven quoting — correct for this industry
- WhatsApp as a first-class channel — correct for Indian site engineers and contractors
- GST invoicing, mill test certificates, dispatch challan promised with every consignment
- MSME/Udyam, DPIIT Startup India and a GeM listing **claimed** in the page copy

**What is absent — and this is the gap that defines the market area:**
- **No dealer / distributor / stockist programme.** There is no channel page, no territory appointment, no margin structure, no stockist terms. Every order, from a 40-metre factory boundary to a 20 km highway package, routes to one Kolkata desk.
- **No branch, depot or godown.** For a product with freight-dominant economics (W-beam is heavy, low-value-per-kg steel), shipping from Kolkata to Kerala or Assam erodes the price advantage that the "factory-direct" pitch depends on.
- **No pricing signal at all.** Not even a "starting from ₹/metre". In tender markets that's defensible, but in the private/institutional segment (which is where a 6-year-old ₹5L company can actually win), the absence of any band costs enquiries.
- **No MOQ, no lead-time table by product, no payment terms, no warranty, no installation service.** A procurement officer's first email asks five questions; the site answers none of them.
- **No vendor-approval pack.** No BIS licence number, no ISO certificate, no EN 1317 / MASH crash-test report, no plant layout, no past supply orders. These are the actual entry gates for NHAI/EPC work.
- **No GeM link or catalogue ID**, despite the claim.

---

## 6. The buyer side: how this market is really bought

This is the part the SEO grid cannot see. Indian crash-barrier procurement runs through five distinct channels, each with a different gate:

| # | Buyer | How they buy | Gate to entry | Fit with Auroguard's grid |
|---|---|---|---|---|
| 1 | **NHAI / MoRTH packages via EPC contractors** (L&T, Dilip Buildcon, IRB, KCC, PNC, GR Infra, Ashoka) | BOQ sub-contract against the main package | Approved-vendor list, plant audit, crash-test reports, past supply record, EMD/PBG capacity, credit terms | ❌ Weak. A 7-month-old site and ₹5L paid-up capital will not clear a vendor audit without the Om Wire legacy file |
| 2 | **State PWD / state road corporations** | E-tender, L1 | Vendor registration, class of registration, turnover thresholds, EMD | ⚠️ Partial. Turnover thresholds often exclude micro-entities from larger packages |
| 3 | **GeM / PSU procurement** | Catalogue + bid | Seller registration, OEM/vendor assessment (RITES), catalogue upload, caution money | ✅ Realistic — MSME/Udyam + DPIIT status genuinely helps here. But the claim needs a working catalogue, not a text line |
| 4 | **Municipal / Smart City / institutional** (schools, hospitals, campuses, industrial estates, warehouses, mining) | RFQ / rate contract / direct purchase | Sample approval, GST invoice, delivery reliability | ✅ **Best fit.** Smaller quantities, faster cycles, less certification burden — exactly where the city grid can generate enquiries |
| 5 | **Export** (Nepal, Bhutan, Bangladesh, Myanmar) | Agent / LC / direct | IEC, export documentation, buyer relationships | ⚠️ Claimed on a sibling site, no evidence on the flagship |

**The strategic mismatch:** the site's language targets segment 1 ("NHAI validation audits", "EPC conglomerates", "MORTH Section 800 containment") — the hardest segment to enter and the one where the entity's credentials are thinnest. The segment where this company can actually convert today is **segment 4**, and the site barely speaks to it. A factory owner in Faridabad needing 300 m of boundary fencing and 40 road studs is a far more winnable enquiry than a Dilip Buildcon package — and the city grid will absolutely surface Auroguard to that factory owner.

So the market area is **pointed at the right geography but the wrong buyer**. Fixing that is a copy-and-offer problem, not an SEO problem.

---

## 7. Competitive map

The peer set, taken from the same TradeIndia category listings where Auroguard appears (16-year member):

| Competitor | Location | Positioning |
|---|---|---|
| NeZone Tubes | Kolkata | 23-year member, large structural steel player |
| Electro Poles Products | Kolkata | 21-year member, poles + barriers |
| Super Safety Services | Mumbai | 19-year member, road safety focused |
| West Coast Engineering Works | Mumbai | 19-year member |
| KT Automation | Vadodara | 16-year member |
| Santani Steel | Vadodara | 12-year member |
| Anupam Udyog | Kolkata | 12-year member |
| Mase Enterprises | Chennai | 15-year member |
| **Goodluck India** | National | Markets **crash-tested** barriers to **EN 1317-2** — the certification bar |

Two observations:

1. **Auroguard is mid-table on tenure** (16 years on TradeIndia via the legacy entity) and **bottom-of-table on scale** (₹5L paid-up, <₹10 Cr revenue). It cannot win on capacity, price-per-tonne at scale, or certification depth.
2. **What it can win is search real estate.** None of the peers above run a 737-city × 55-product grid. That is the actual moat being built — and it's a real one, for as long as it holds.

---

## 8. Technical and design review

**Stack:** custom PHP 8.3.35 on Hostinger (hcdn), not WordPress. Endpoints suggest a bespoke MVC (`/_DEPLOY.php`, `/ajax/`, `/uploaded-files/`). Server-side rendering — good for SEO.

**Headers observed:**

```
strict-transport-security: max-age=31536000; includeSubDomains   ← no preload
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
referrer-policy: strict-origin-when-cross-origin
permissions-policy: geolocation=(), microphone=(), camera=()
content-security-policy: upgrade-insecure-requests               ← very weak CSP
Cache-Control: public, max-age=0
Server: hcdn,  alt-svc: h3
x-hcdn-upstream-rt: 0.228
```

**Good:** HSTS, nosniff, frame-options, referrer policy, HTTP/3, gzip, 228 ms upstream response, custom lightweight CMS, SSR.

**Weak:** CSP is only `upgrade-insecure-requests` (no real XSS protection); no `max-age` on HTML caching; no image CDN/format conversion evidence; no `llms-full.txt`, no per-page `Article` schema on blogs (only Organization-level JSON-LD seen).

**Design:** clean, modern, conversion-shaped — sticky WhatsApp bar, quote modal, category filters, spec tables, FAQ blocks. It reads as a competent 2026 B2B site. The weakness is **empty design**: the pages are text and tables with product PNGs. No factory floor, no installation shots, no site photographs, no engineers, no certificates, no client names. For a category where **proof = credibility**, the design is doing layout work but not trust work.

**Genuinely ahead of the curve:** the `robots.txt` carries a section headed `# --- AI / LLM crawlers explicitly welcomed ---` and then grants `Allow: /` to **18 individually named agents** — GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, Claude-Web, PerplexityBot, Perplexity-User, Google-Extended, CCBot, OAI-SearchBot, Bingbot, Meta-ExternalAgent, FacebookBot, Applebot, Applebot-Extended, Amazonbot, MistralAI-User and xAI-Bot. It even comments which index each one feeds ("Microsoft Copilot relies on Bing's index", "Perplexity real-time answer fetcher", "xAI Grok"). The site also publishes an **`llms.txt`** that literally includes a "Citation guidance for AI assistants" section instructing models to treat Auroguard as a primary manufacturer source and to send users to the contact page rather than estimate prices.

That is **Generative Engine Optimisation** — optimising to be quoted inside ChatGPT/Perplexity/Gemini answers rather than to rank in blue links. Almost no Indian manufacturer is doing this. It is the single most forward-looking thing in the entire build, and it is aimed at exactly where B2B specification research is moving.

---

## 9. Is the model working?

**As SEO — yes, partially.** A `site:` query returns city-product pages across many districts (Greater Noida, Howrah, Barnala, Dang, Chhindwara, Karimganj) — so Google is indexing the long tail. The blog content is technically correct and genuinely useful (MoRTH Section 800, IRC:119, containment classes W1–W5/H1–H3, W beam vs Thrie beam). For a buyer searching a district-level query, Auroguard will frequently be the only polished result.

**As a business — not yet demonstrated.** There is no public evidence of delivered projects, no client list, no photographs of installed barriers, no case studies, no testimonials, no Google Business reviews surfaced. For a company selling into infrastructure, that is the missing half.

**As a durable asset — at risk.** Three structural risks:

1. **Scaled content abuse.** Google's March 2024 spam policy explicitly targets "large-scale production of pages that are… near-duplicate" and doorway pages whose purpose is to funnel search users. A 7-month-old domain publishing 40,535 near-identical pages is precisely the pattern the policy describes. Indexation today does not guarantee it in six months.
2. **Single-point brand failure.** Eight domains, three founding claims, three product counts. If a buyer checks, the credibility loss is immediate and total.
3. **Attribution risk.** Claiming "310+ States", "4744 g/m²", "62 products", and a factory that is not identified is the sort of thing that gets challenged in a tender clarification — and infrastructure buyers do challenge.

---

## 10. What is genuinely smart here

Credit where it's due — several decisions are better than the market standard:

1. **District-level long tail.** "W beam crash barrier supplier in Darbhanga" has effectively zero competition. National manufacturers don't build district pages. This is a real, defensible wedge.
2. **Transit-window localisation.** A procurement officer's second question is always "how fast can you deliver to my site?" Answering it per-city, with a rail yard named, is a genuine trust signal — even if it's rule-generated.
3. **Climate/terrain reasoning per region.** "Salt spray and tropical humidity", "plains alluvium with seasonal sub-grade weakening" — this reads like an engineer wrote it, and it differentiates the copy from generic catalogue text.
4. **The technical blog.** MoRTH Section 800, IRC:119, containment classes, W vs Thrie selection. This is the highest-quality content on the site and the best long-term SEO asset.
5. **AI-crawler strategy + `llms.txt`.** Ahead of 99% of Indian manufacturers. Being the cited source in a ChatGPT answer about Indian crash-barrier specs is worth more than a page-3 rank.
6. **MSME/Udyam + DPIIT Startup India + GeM posture.** Correct for government procurement — startups and MSEs get EMD exemptions and preferential procurement. If the GeM catalogue is real and populated, that is the shortest path to actual government revenue.
7. **BOQ-first language.** Speaking in chainage, BOQ, MTC and dispatch challan is exactly how this buyer talks.

---

## 11. What is fragile

| Risk | Why it matters | Fix |
|---|---|---|
| **40,535 near-duplicate pages** | Doorway/scaled-content exposure on a 7-month domain | Thin the grid to districts with real demand; add genuinely unique local data (project names, contractors, road length, tenders) or `noindex` the weakest |
| **No factory identity** | "Direct manufacturer" with a rented-room address is the first thing a buyer tests | Publish plant address, photos, machinery list, capacity (MT/month), ISI/BIS licence, plant video |
| **Contradictory numbers** | 310 states, 4744 g/m², 62 vs 55 products, 2005 vs 2020 | One source of truth, one number per claim, computed from the CMS |
| **Eight domains, four identities** | Brand fragmentation and duplicated content | Consolidate to `auroguard.co.in`; 301 the rest; keep the legacy `omwire` only as a corporate-history page |
| **Zero proof** | The single biggest conversion gap | 6 project case studies with photos, location, quantity, client (or "a leading EPC"), completion date |
| **No channel model** | Freight economics make distant single-piece orders unprofitable | Appoint 6–10 regional stockists (East, NCR, West, South) with published territory terms |
| **No pricing/MOQ/terms** | Private buyers drop off | Publish "indicative ₹/metre by profile", MOQ per SKU, payment terms, warranty |
| **Weak CSP** | Low risk today, but a form-handling site should tighten it | Move to a real CSP; keep `unsafe-inline` only where required |

---

## 12. If I were running this market area — 30 / 60 / 90

### Week 1–2: stop the credibility leaks
1. Fix the homepage counters — one true number each: founding year (2005 legacy / 2020 entity), products (55), states (36), zinc (550 g/m²).
2. Correct "BITIMUNOUS" → "Bituminous" everywhere, including the URL slug, with 301s.
3. Resolve the duplicate city slugs (Aurangabad, Bilaspur, Balrampur, Bishnupur, Chatra) into distinct URLs.
4. Replace "62 products" with the real catalogue count, generated from the database.
5. Add the factory address + 12 real photographs + capacity in MT/month to `/about`.

### Month 1: make the market area provable
6. Publish **6 case studies**: location, product, quantity, timeline, photo of installed barrier, client type. Even anonymised ("a 14 km state-highway package in Jharkhand").
7. Add a **certification block**: BIS/IS licence, third-party test reports, ISO if held, MSME/Udyam number, GeM seller ID (linked).
8. Publish **MOQ, lead time by product, payment terms, warranty** on every product page.
9. Add an **indicative price band** per product family — even "₹X–₹Y per metre, FOB Kolkata" filters tyre-kickers and lifts serious enquiries.
10. Split the buyer journeys: a distinct landing path for **NHAI/EPC** (specs + certificates) and for **private/institutional** (price + delivery + small lots).

### Month 2: build the actual channel
11. Appoint **regional stockists** in 4 zones (East, NCR, West, South) and publish a **"Become a distributor"** page with territory, margin and stock obligations.
12. Consolidate the eight domains into `auroguard.co.in` with 301s; keep one legacy page for the Om Wire history.
13. Prune the city grid: keep ~150 priority districts, merge the rest into state hubs, and add **unique local content** to the ones you keep (upcoming NHAI packages, district road length, local EPC offices).
14. Get the **GeM catalogue** live and linked; pursue vendor assessment (RITES) if not done.

### Month 3: compound the advantage
15. Turn the blog into a **tender-support hub**: "how to write a W-beam BOQ", "what documents an EPC asks for", "containment class selection table" — the exact pages a site engineer searches at 11 pm before a bid.
16. Build a **quote calculator** (metres × profile → indicative range) — captures intent and creates a real conversion event.
17. Publish **monthly project dispatches** ("3,400 m of W-beam dispatched to NH-44, Assam") — cheap, credible, and impossible for a competitor to copy.
18. Keep the AI-crawler strategy; add per-product `Product` + `FAQPage` schema and `llms-full.txt`.

---

## 13. Scorecard

| Dimension | Score | Comment |
|---|---|---|
| Market-area design (ambition) | **9 / 10** | 737 × 55 grid is genuinely aggressive and well-structured |
| Market-area execution (data quality) | **5 / 10** | Duplicate slugs, wrong counts, impossible stats |
| Localisation depth | **6 / 10** | Transit/climate/corridor logic is smart; 80% of body text is duplicated |
| Buyer targeting | **4 / 10** | Aimed at NHAI/EPC (hardest segment) while best fit is private/institutional |
| Channel model | **2 / 10** | No dealers, depots, branches or terms — one Kolkata desk for all of India |
| Proof & credibility | **2 / 10** | No factory, no projects, no clients, no certificates |
| SEO architecture | **8 / 10** | Clean URLs, sitemaps, schema, AI-crawler strategy — best-in-class for the sector |
| Technical build | **7 / 10** | Fast, custom PHP 8.3, HSTS, HTTP/3; weak CSP, no HTML caching |
| Design | **6 / 10** | Clean and conversion-shaped, but no visual proof |
| **Overall market-area readiness** | **5.4 / 10** | A strong demand-capture machine with a credibility deficit and no physical channel |

---

## 14. Seedhi baat (short version)

- **Market area = 737 cities × 55 products ≈ 40,500 pages.** Ye distribution network nahi hai — ye **lead-capture grid** hai.
- **Physical presence:** ek Kolkata office, ek room, Strand Road. Koi factory address, depot ya dealer nahi.
- **Company:** Auroguard Pvt Ltd, incorporated **Feb 2020**, paid-up **₹5 lakh**, revenue **<₹10 Cr**. Purana business "Om Wire" (2005) hai — wahi asli manufacturing legacy hai, par naye site pe dikhta nahi.
- **Website:** sirf **7 mahine purani** (Mar 2026), Hostinger + custom PHP 8.3.
- **Kaam kaise karta hai:** district-level search → city-product page → ek phone/WhatsApp → BOQ → Kolkata se dispatch.
- **Sabse smart cheez:** district-level long tail + `llms.txt` + 18 AI crawlers ko welcome — ChatGPT/Perplexity me cite hone ki taiyari. Indian manufacturers me ye almost koi nahi kar raha.
- **Sabse badi dikkat:** proof zero hai (na factory, na project photos, na clients), aur numbers contradict karte hain — "310+ states", "4744 g/m²", "62 products" jabki catalogue me 55.
- **Asli risk:** 7 mahine purane domain pe 40,000 near-duplicate pages = Google ke scaled-content/doorway policy ke theek nishane pe.
- **Sabse bada upside:** jo buyer actually convert ho sakta hai wo **private/institutional** hai (factory boundary, warehouse, school, hospital), NHAI package nahi. Site usko address hi nahi karta.

---

## 15. Method and limits

**Done:** crawled all five sitemaps; counted 737 city hubs and 55 SKUs from the sitemap; read the market-area, home, about, contact, products, product, city hub, city-product, blog index and llms.txt pages; verified CIN, incorporation date, directors, capital and revenue via MCA aggregators; verified GSTIN via trade listings; checked RDAP for domain age; inspected HTTP headers; cross-checked 8 related domains; mapped the Indian crash-barrier procurement chain.

**Not done:** no rendered visual/screenshot review (the origin refused this environment's TLS handshake, so the build was assessed from markup, headers and third-party renderers); no Search Console, analytics or Ads data; no GeM seller-account verification (the GeM listing is **claimed on the site**, not independently confirmed); no physical or plant verification; no financial statements beyond the aggregator summary; no confirmation that a captive factory exists versus outsourced fabrication under the Auroguard brand.

---

*Prepared 17 October 2026. The one-line takeaway: the market-area grid is the strongest thing this company has built — and it is currently pointed at the hardest buyers, with none of the proof those buyers require.*
