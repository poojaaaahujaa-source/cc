# Evidence log — samasolution.in

Collected **17 October 2026, 07:21–07:26 UTC**. Every raw output below was produced during the audit. Where a third-party service was used, it is named so the check can be repeated.

---

## 1. HTTP responses

Checked with `api.hackertarget.com/httpheaders` (plain-text header relay), `api.microlink.io` (headless Chrome), and an independent page fetcher.

### Home page — down

```
$ GET https://www.samasolution.in/
HTTP/1.1 500 Internal Server Error
Date: Sat, 17 Oct 2026 07:23:34 GMT
Server: Apache
X-Powered-By: PHP/7.4.33
Content-Length: 0
Connection: close
Content-Type: text/html; charset=UTF-8
```

Headless Chrome (`api.microlink.io`) reproduced it:

```json
"statusCode": 500,
"title": "www.samasolution.in",
"description": "www.samasolution.in is currently unable to handle this request.",
"headers": {
  "server": "Apache",
  "x-powered-by": "PHP/7.4.33",
  "content-length": "0",
  "connection": "close"
}
```

### Apex domain — also down, no redirect to www

```
$ GET https://samasolution.in/
HTTP/1.1 500 Internal Server Error
Server: Apache
X-Powered-By: PHP/7.4.33
Content-Length: 0
```

### HTTP → HTTPS redirect works

```
$ GET http://www.samasolution.in/
HTTP/1.1 301 Moved Permanently
Location: https://www.samasolution.in/
Content-Length: 276

$ (follows) https://www.samasolution.in/
HTTP/1.1 500 Internal Server Error
```

### Interior pages — 200 OK

```
$ GET https://www.samasolution.in/services.php
HTTP/1.1 200 OK
Server: Apache
X-Powered-By: PHP/7.4.33
Keep-Alive: timeout=5
Transfer-Encoding: chunked
Content-Type: text/html; charset=UTF-8
```

```
$ GET https://www.samasolution.in/who-we-are.php   → 200 OK (same headers)
$ GET https://www.samasolution.in/contacts.php     → 200 OK (same headers)
$ GET https://samasolution.in/services.php         → 200 OK (apex also serves content)
```

### Duplicate home URL

```
$ GET https://www.samasolution.in/index.php
HTTP/1.1 500 Internal Server Error
Content-Length: 0
```

---

## 2. DNS and email

```
$ api.hackertarget.com/dnslookup?q=samasolution.in
A    : 103.160.129.7
MX   : 0 samasolution.in.
NS   : ns1.htshosting.org.
NS   : ns2.htshosting.org.
TXT  : v=spf1 +a +mx +ip4:103.160.129.7 ~all
SOA  : ns1.htshosting.org. support.htshosting.org. 2026101307 3600 1800 1209600 86400
```

```
$ dns.google/resolve?name=_dmarc.samasolution.in&type=TXT
v=DMARC1; p=none;
```

DNSSEC (`secureDNS.delegationSigned`): **false** (RDAP).

No DKIM selector was tested; verify in cPanel → Email Deliverability.

---

## 3. Hosting and domain registration

```
$ ipinfo.io/103.160.129.7/json
{
  "ip": "103.160.129.7",
  "hostname": "websrv.htshosting.org",
  "city": "Ghaziabad",
  "region": "Uttar Pradesh",
  "country": "IN",
  "org": "AS134475 HTS Solutions Private Limited"
}
```

```
$ RDAP rdap.nixiregistry.in/rdap/domain/samasolution.in
registration : 2020-06-21T08:59:21Z
expiration   : 2027-06-21T08:59:21Z
last changed : 2026-08-05T09:02:04Z
status       : client transfer prohibited
registrar    : Endurance International Group India Private Limited (IANA 801217)
nameservers  : ns1.htshosting.org, ns2.htshosting.org
DNSSEC       : unsigned
```

**TLS certificates** (crt.sh):

| Common name | Issuer | Valid from | Valid to |
|---|---|---|---|
| `samasolution.in`, `*.samasolution.in` | Let's Encrypt YR2 | 2026-09-18 | 2026-12-17 |
| `www.samasolution.in` | GoDaddy DV R1v1 | 2026-06-22 | 2027-01-06 |
| `adityainnovatives.com.samasolution.in` (+7 client names) | Let's Encrypt YR2 | 2026-09-07 | 2026-12-06 |
| `ashvah.in.samasolution.in`, `hpj.co.in.samasolution.in` | Let's Encrypt YR1 | 2026-08-10 | 2026-11-08 |

**Connection note:** a direct `curl`/OpenSSL connection from this sandbox was dropped during the TLS handshake (`SSL_ERROR_SYSCALL`, 0 bytes read). Three independent third-party fetchers succeeded, so this is most likely IP/geo filtering at the host rather than a certificate fault.

---

## 4. Lighthouse (mobile emulation)

Run through `api.microlink.io` (Lighthouse 13.5.0, HeadlessChrome 154, mobile throttling) against `https://www.samasolution.in/who-we-are.php`:

| Metric | Value |
|---|---|
| First Contentful Paint | 2,877 ms (2.9 s) |
| Largest Contentful Paint | 2,983 ms (3.0 s) |
| Speed Index | 4,303 ms (4.3 s) |
| HTTPS | Pass |
| HTTP→HTTPS redirect audit | Not applicable (page loaded over HTTPS directly) |

Wappalyzer (via the same call) detected only **PHP** and **Apache HTTP Server** — no analytics, tag manager or marketing pixels.

The home page could not be measured: it returns 500 before paint.

---

## 5. Sitemap and robots

```
$ GET https://www.samasolution.in/sitemap.xml
https://www.samasolution.in/            2020-07-07T02:36:55+00:00  1.00
https://www.samasolution.in/index.php   2020-07-07T02:36:55+00:00  0.80
https://www.samasolution.in/who-we-are.php 2020-07-07T02:36:55+00:00 0.80
https://www.samasolution.in/what-we-do.php 2020-07-07T02:36:55+00:00 0.80
https://www.samasolution.in/services.php   2020-07-07T02:36:55+00:00 0.80
https://www.samasolution.in/contacts.php   2020-07-07T02:36:55+00:00 0.80
```

```
$ GET https://www.samasolution.in/robots.txt   → 404 Not Found
$ GET https://www.samasolution.in/portfolio.php → 404 Not Found
```

---

## 6. Page content as extracted

### who-we-are.php (200)

```
H1  Sama Solution  Who We Are
H1  Sama Solution  Who We Are          ← duplicate
H2  Who We Are
H5  Be your own master with Sama!
H5  GET FREE TRAINING TO JOIN US
H5  Why We Choose Work From Home or Virtual Employment over Full-time employment?
```

Content marketed "virtual employment", "free training", "earn money sitting at home", and jobs for "Girls or Ladies" — alongside web design services.

### what-we-do.php (200)

```
H1  Sama Solution  What We Do
H1  Sama Solution  What We Do          ← duplicate
H2  What We Do
```

Opening line: *"As the world takes on a determined conflict against the pandemic… this lockdown gave us the opportunity…"*

### services.php (200)

```
H1  What I'm offering  My Services
H1  What I'm offering  My Services     ← duplicate
H6  Web Design
H6  Web Development
H6  Digital Marketing
H6  Branding
H6  Mobile App
H6  Software Development
H6  Video Productions
```

### contacts.php (200)

No `<form>` in the extracted content. Links present:

```
tel:+9193114 93072        ← contains a space
mailto:info@samasolution.in
https://www.facebook.com/samasolution
https://www.instagram.com/samasolutionpl/
https://twitter.com/samasolution
https://www.samasolution.in/contacts.php#   ← LinkedIn, dead
https://api.whatsapp.com/send?phone=+919311493072
```

---

## 7. Archive history

`web.archive.org/web/timemap/link/https://www.samasolution.in/`:

- First capture: **6 Dec 2021**
- Last capture: **13 Jul 2025**
- 31 captures total; no captures after July 2025

Findings:

- The **2021 capture is content-identical to the 2024 capture** — same headlines, same service blurbs, same "CloseZoom" / "ReturnBack" strings. The site has not been materially updated in five years.
- The **10 July 2025 capture redirects to `demospace.com/lander`**, a domain-parking lander (the pattern used by GoDaddy/Endurance properties). `demospace.com` was never archived, so no page body exists for that capture.
- The **14 June 2025 capture** shows only "One moment, please… Please wait while your request is being verified" — a bot challenge.
- In 2021 the WhatsApp number was **+91 85957 71171**; it is now **+91 93114 93072**.

---

## 8. Search visibility

`site:samasolution.in` surfaced four URLs (not five):

1. `https://www.samasolution.in/` — "Website Designing Company in Delhi, Website Development India"
2. `https://www.samasolution.in/what-we-do.php` — "What We Do - Sama Solution"
3. `https://www.samasolution.in/who-we-are.php` — "Who We Are - Sama Solution"
4. `https://www.samasolution.in/contacts.php` — "Contact Us - Sama Solution"

A second query surfaced `https://www.samasolution.in/index.php` as its own result, separate from `/`.

Snippet-level metadata (Microlink):

```json
{
  "title": "Our Services - Sama Solution",
  "description": "Sama Solution is Best Website Designing Company in Delhi, We Comes in Top 5 Website Designing Company in Delhi, India. Call us on +91-93114 93072 for Website Development in good Price with Website Development Companies in India also E commerce Website Design Services at the best price in Delhi.",
  "image": "https://www.samasolution.in/img/logo.png (843×375, 19 KB)"
}
```

The same description was returned for `who-we-are.php` — i.e. one description reused across pages.

---

## 9. Public listings and reputation

| Source | What it shows |
|---|---|
| Facebook `/samasolution` | "Sama Solution Pvt Ltd, Delhi"; category **Social Media Agency**; hours **Always open**; **0 reviews**, not rated; same phone/email |
| Trustpilot `samasolution.in` | **1 review**, 1 star, dated 30 Jun 2023; TrustScore 3.2/5. Reviewer alleges advance payment and an incomplete website |
| ZoomInfo | Two different "Sama Solution" profiles (HR & Staffing; Consumer Services/Repair) — neither clearly matches this business |
| LinkedIn | No company page found for Sama Solution Delhi; the site's LinkedIn icon links to `#` |
| Justdial / IndiaMART / Sulekha / Bing Places | No matching listing found in search |

Name collisions on page 1 of brand search: Sama (AI data company, `sama.com`), Sama Solutions Miami (`sama-solutions.com`), Sama Solutions France (`samasolutions.fr`), Sama Solution Mexico (`samasolution.com.mx`), SaM Solutions Germany (`sam-solutions.com`).

---

## 10. Staging subdomains

Live header checks:

```
$ GET https://adityainnovatives.com.samasolution.in/
HTTP/1.1 200 OK
Last-Modified: Sat, 25 Apr 2026 06:21:34 GMT
Content-Length: 106200
Content-Type: text/html

$ GET https://www.mkfiresafety.in.samasolution.in/
HTTP/1.1 200 OK
Last-Modified: Mon, 08 Jun 2026 08:46:15 GMT
Content-Length: 64353
Content-Type: text/html
```

Names appearing in Certificate Transparency for `*.samasolution.in`:

- `adityainnovatives.com`
- `mkfiresafety.in`
- `ashvah.in`
- `hpj.co.in`
- `mountainfacecottage.com`
- `suroliaenterprises.com`
- `10xrealty.co.in`
- `makaandekho.in`

All are publicly resolvable, and two returned full HTML on the audit date.

---

## 11. Checks attempted but not completed

| Check | Reason |
|---|---|
| Visual/screenshot review | Origin dropped this environment's TLS connection; no local browser render |
| SSL Labs grade | API returned `status: DNS` after starting the scan; no cached result available |
| Google PageSpeed API | Shared quota exhausted (`429`) |
| Google Business Profile lookup | No public profile surfaced; requires owner-side confirmation |
| MCA/CIN verification | Public aggregator search returned no exact match for "Sama Solutions Private Limited" |
| DKIM | Not queried; verify in cPanel |
| Field data (CrUX) | No public API access without a key |
| Analytics/ads accounts | No access by design |
