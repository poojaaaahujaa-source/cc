# cPanel par deploy karne ka tarika (Hinglish)

Ye app **Node.js** par chalti hai (PHP par nahi). cPanel par tabhi chalegi jab aapke host ne
**“Setup Node.js App”** feature diya ho aur **Node.js 22.5 ya usse naya** version available ho.
Agar aapke cPanel me Node.js 22.x nahi hai, to neeche “Agar Node 22 nahi milta” section padhein.

Zip me sab kuch pehle se hai: website, admin panel, database (demo content ke saath) aur
`node_modules` — matlab upload ke baad `npm install` zaroori nahi, sirf Node app create karni hai.

---

## Step 1 — Zip upload karein

1. cPanel → **File Manager** kholein.
2. Home directory me jaayein (`/home/youruser`) — **`public_html` ke andar nahi**.
3. **Upload** → `samasolution-cpanel.zip` upload karein.
4. Upload hone ke baad file par right click → **Extract**.
5. `samasolution` folder ban jayega, jisme `app.js`, `server.js`, `public`, `src`, `views`,
   `data`, `node_modules` sab honge.

> Agar host forcefully `public_html` me hi extract karna chahe, to bhi chalega — `.htaccess`
> database aur source files ko direct download se rokta hai. Lekin recommended tarika
> `public_html` ke bahar rakhna hai.

## Step 2 — Node.js application banayein

cPanel → **Setup Node.js App** → **Create Application**:

| Field | Value |
| --- | --- |
| Node.js version | **22.x** (22.5+ hona chahiye) |
| Application mode | Production |
| Application root | `samasolution` (jo folder extract hua) |
| Application URL | `samasolution.in` ya `www.samasolution.in` (ya subdomain) |
| Application startup file | `app.js` |

**Create** dabayein. cPanel thodi der me virtual environment banata hai.

## Step 3 — Dependencies

Zip me `node_modules` already hai, isliye normally kuch nahi karna.
Agar app start pe `Cannot find module 'ejs'` aaye:

- cPanel ke Node.js App page par **Run NPM Install** dabayein, **ya**
- Terminal me:

```bash
source /home/YOUR_USER/nodevenv/samasolution/22/bin/activate
cd /home/YOUR_USER/samasolution
npm install --omit=dev
```

## Step 4 — Restart aur test

Node.js App page → **Restart**.

- Website: `https://samasolution.in`
- Admin: `https://samasolution.in/admin/login`
  - Email: `admin@samasolution.in`
  - Password: `Sama@2026`  ← **login ke baad Account → Password se turant badal dein**

Pehli baar admin login karke password change karna zaroori hai, kyunki ye demo password
zip me likha hua hai.

## Step 5 — Permissions (agar write error aaye)

File Manager me:

| Path | Permission |
| --- | --- |
| `samasolution` | 0755 |
| `samasolution/data` | 0755 (folder), `site.db` 0644 |
| `samasolution/public/uploads` | 0755 |

Error `attempt to write a readonly database` aaye to `data` folder ki permission fix karein
ya hosting support se ownership theek karwayein.

## Step 6 — SSL

cPanel → **SSL/TLS Status** → **Run AutoSSL**. `https://` ke baad admin cookie secure ho jati hai.

---

## Zip me kya-kya hai

```
samasolution/
├── app.js                    ← cPanel startup file
├── server.js                 ← main Express app
├── .htaccess                 ← sensitive files ko block karta hai
├── package.json              ← node engine: >=22.5
├── node_modules/             ← dependencies, pre-installed
├── data/site.db              ← ready database (44 services, 396 cities, 8 blogs, admin user)
├── public/                   ← CSS, JS, images, fonts, favicon, uploads folder
├── src/                      ← routes, db, seo, auth, seed, icons
├── views/                    ← 15 public + 20 admin EJS templates
├── tests/                    ← 24 automated tests
├── README.md                 ← full technical documentation
└── DEPLOY-CPANEL.md          ← ye file
```

`data/site.db` delete karne par agli baar server khud demo content dobara bana dega
(`src/seed.js`). Real content edit admin panel se karein.

## Agar Node 22 nahi milta

cPanel shared hosting par Node version host ki marzi ka hota hai. Teen options:

1. **Host se request karein** — “Please enable Node.js 22.x for my account” (sabse aasan).
2. **Node-capable host** — Hostinger, Namecheap, A2 jaise providers Node.js selector dete hain;
   wahan bhi yahi zip use hoti hai.
3. **Render / Railway / VPS** — isi zip ko wahan deploy karein (start command `node app.js`).
   cPanel ki zaroorat nahi padti.

> Node 20 ya 18 par ye app **nahi** chalegi, kyunki database ke liye Node ka built-in
> `node:sqlite` module chahiye (Node 22.5 me aaya).

## Common problems

| Symptom | Reason / fix |
| --- | --- |
| 503 Service Unavailable | Node app restart karein; cPanel ke error log me Node version check karein |
| `Cannot find module ...` | Step 3 — npm install ya `node_modules` folder check karein |
| Har page 404 | Application root galat hai; `app.js` root me hona chahiye |
| Directory listing dikh raha hai | Node app create nahi hui / startup file `app.js` set nahi hai |
| Admin login ke baad logout ho jata hai | HTTPS on karein (AutoSSL) aur cookies block na karein |
| Images upload nahi ho rahi | `public/uploads` ki permission 0755 karein, 4 MB se chhoti image |

## Backup

Do cheezein hi change hoti hain: `data/site.db` aur `public/uploads/`.
In dono ka time-to-time backup rakhein (cPanel → Backup ya File Manager se download).
