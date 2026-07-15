# Ezy Escape — VPS deployment guide

Deploy **directly** on **https://ezyescape.com** using **Hostinger only** (no Cloudflare): domain DNS in hPanel → Hostinger VPS (nginx + PM2), alongside `newsaddaindia.com` and `socialscreen.in`.

| | Value |
|---|---|
| **GitHub repo** | https://github.com/aseempsri/ezyescape |
| **Production URL** | https://ezyescape.com |
| **DNS** | Hostinger hPanel (not Cloudflare) |
| **VPS** | Ubuntu 24.04 · `srv1246615.hstgr.cloud` |
| **VPS IP** | Copy from hPanel → VPS Overview (e.g. `72.60.236.158`) |
| **Web server** | nginx |
| **API** | PM2 `ezyescape-api` on port **3001** |
| **newsadda API** | PM2 `news-adda-backend` on port **3000** (do not change) |
| **MongoDB** | Local `mongod`, database **`ezyescape`** |
| **Google Analytics** | `G-4XBZMK4BZV` |

---

## Safety rules

1. Do **not** edit nginx configs for `news-adda` or `socialscreen`.
2. Do **not** bind Ezy Escape to port `3000`.
3. Use Mongo DB name `ezyescape` only.
4. Never commit `.env` or tokens to git.

---

## Part A — Leave Cloudflare, manage DNS on Hostinger

Today `ezyescape.com` uses Cloudflare nameservers (`eugene.ns.cloudflare.com` / `laylah.ns.cloudflare.com`). While that stays true, **Hostinger DNS edits do nothing** for live traffic. Switch nameservers first.

### A1. Switch nameservers to Hostinger

In **hPanel** → **Domains** → **ezyescape.com** → **DNS / Nameservers**:

1. Change from Cloudflare NS to Hostinger:
   - `ns1.dns-parking.com`
   - `ns2.dns-parking.com`  
   (If hPanel shows different Hostinger NS under Plan Details / Connect domain, use **those** exact values.)
2. Save.

Propagation usually takes **minutes to a few hours** (up to ~24h). Check:

```bash
dig NS ezyescape.com +short
# expect Hostinger nameservers, not cloudflare.com
```

Optional: remove the domain from your Cloudflare dashboard after NS has switched, so you are not editing the wrong place by habit.

### A2. Point the domain at the VPS (Hostinger DNS zone)

In **hPanel** → **Domains** → **ezyescape.com** → **DNS Zone** (or DNS Records):

| Type | Name | Points to | TTL |
|---|---|---|---|
| **A** | `@` | `<VPS_IP>` | 300 or default |
| **A** | `www` | `<VPS_IP>` | 300 or default |

**Important**

- If there is an old **A `@`** pointing at shared hosting (`194.195.119.156` or similar), **edit/replace** it with the VPS IP — do not leave two conflicting A records for `@`.
- If there is an **AAAA** for `@` pointing at shared hosting IPv6, either update it to the VPS IPv6 or delete it so IPv6 visitors are not sent elsewhere.
- **Keep mail working:** do **not** delete Hostinger **MX** / SPF / DKIM records (`mx1.hostinger.com`, `mx2.hostinger.com`, `hostingermail-*.dkim`, etc.) unless you intentionally change email.
- `www` can be **A** → VPS IP, or **CNAME** → `ezyescape.com`. Prefer **A** if both apex and www should go to the same VPS.

Verify:

```bash
dig +short ezyescape.com A
dig +short www.ezyescape.com A
# both should show your VPS IP
```

Once this is true, traffic hits the VPS (nginx). Shared hosting `public_html` for ezyescape.com is no longer used until you point DNS back.

---

## Part B — Deploy the app on the VPS

### B0. GitHub on the VPS

```bash
ssh root@<VPS_IP>
mkdir -p /var/www
```

**First time** (folder does not exist yet):

```bash
git clone https://github.com/aseempsri/ezyescape.git /var/www/ezyescape-src
```

**If you see** `fatal: destination path '/var/www/ezyescape-src' already exists` — **do not clone again**. Update instead:

```bash
cd /var/www/ezyescape-src
git fetch origin
git checkout main
git pull origin main
```

(Repo is public — no PAT required for clone/pull.)

Optional clean re-clone only if the folder is broken:

```bash
rm -rf /var/www/ezyescape-src
git clone https://github.com/aseempsri/ezyescape.git /var/www/ezyescape-src
```

### B1. Directories

```bash
mkdir -p /var/www/ezyescape/{web,server,uploads}
```

### B2. Sync code

```bash
rsync -a --delete /var/www/ezyescape-src/web/ /var/www/ezyescape/web/
rsync -a --delete --exclude 'uploads' --exclude '.env' /var/www/ezyescape-src/server/ /var/www/ezyescape/server/
```

### B3. Environment

```bash
# First time only — do not overwrite an existing production .env
test -f /var/www/ezyescape/server/.env || cp /var/www/ezyescape/server/.env.example /var/www/ezyescape/server/.env
nano /var/www/ezyescape/server/.env
```

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ezyescape
PORT=3001
NODE_ENV=production
JWT_SECRET=<long-random-string>
FRONTEND_URL=https://ezyescape.com
GOOGLE_CLIENT_ID=<from Google Cloud>
GOOGLE_CLIENT_SECRET=<from Google Cloud>
GOOGLE_CALLBACK_URL=https://ezyescape.com/auth/google/callback
ADMIN_PASSWORD=<strong-admin-password>
```

Optional: `SMTP_*`, `WHATSAPP_*` (blank WhatsApp → OTPs in `pm2 logs`).

**Google OAuth** (Cloud Console → Credentials):

- Origins: `https://ezyescape.com`, `https://www.ezyescape.com`
- Redirect: `https://ezyescape.com/auth/google/callback`

### B4. Build + install

The web app uses same-origin API paths (no `VITE_API_URL` needed when nginx proxies `/api` and `/auth`).

```bash
cd /var/www/ezyescape/web && npm ci && npm run build
cd /var/www/ezyescape/server && npm ci && mkdir -p uploads
```

### B5. PM2

```bash
cd /var/www/ezyescape/server
pm2 start src/index.js --name ezyescape-api
pm2 save
curl -s http://127.0.0.1:3001/health
pm2 status   # news-adda-backend still online
```

### B6. Nginx + SSL

```bash
cp /var/www/ezyescape-src/deploy/nginx-ezyescape.conf /etc/nginx/sites-available/ezyescape
ln -sf /etc/nginx/sites-available/ezyescape /etc/nginx/sites-enabled/ezyescape
nginx -t && systemctl reload nginx

# Only after dig shows VPS IP for ezyescape.com:
certbot --nginx -d ezyescape.com -d www.ezyescape.com
```

### B7. Verify

```bash
curl -sI https://ezyescape.com | head -5
curl -s https://ezyescape.com/health
curl -sI https://newsaddaindia.com | head -3
```

- Site: https://ezyescape.com  
- Admin: https://ezyescape.com/admin  

---

## Updates later

```bash
cd /var/www/ezyescape-src && git pull origin main
rsync -a --delete /var/www/ezyescape-src/web/ /var/www/ezyescape/web/
rsync -a --delete --exclude 'uploads' --exclude '.env' /var/www/ezyescape-src/server/ /var/www/ezyescape/server/
cd /var/www/ezyescape/web && npm ci && npm run build
cd /var/www/ezyescape/server && npm ci
pm2 restart ezyescape-api
```

---

## Rollback (Ezy Escape only)

```bash
pm2 stop ezyescape-api
rm /etc/nginx/sites-enabled/ezyescape
nginx -t && systemctl reload nginx
```

In Hostinger DNS, point A `@` / `www` back to shared hosting if needed.

---

## Checklist

- [ ] Nameservers = Hostinger (not Cloudflare)  
- [ ] A `@` and `www` → VPS IP in Hostinger DNS  
- [ ] `dig` shows VPS IP  
- [ ] Code + `.env` + build + PM2 on 3001  
- [ ] nginx `ezyescape` site + certbot  
- [ ] Google OAuth production URLs  
- [ ] Site and `/health` OK; newsadda still up  
