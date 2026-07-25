# Social Screen Ads — Complete Description (Reusable)

Use this as a product + technical writeup for another project. **Do not implement hover zoom / floating enlarge preview** — that exists only in Social Screen’s public ad renderer and is intentionally excluded below.

---

## 1. Core idea

Ads are **not created as free-form campaigns**. The system uses a fixed catalogue of **named slots**. Admins only fill those slots: enable/disable, upload creatives (image/video), set optional click URL and alt text.

Each site has its own slot list, isolated by a `site` field (Social Screen uses `site=socialscreen`). Documents live in MongoDB collection `ads`, unique on `(adId, site)`.

**Slot naming pattern:** `{section}-ad{N}`  
Examples: `home-ad1`, `article-ad2`, `national-ad3`.

---

## 2. Slot inventory (Social Screen = 40 slots)

| Section | Slots | IDs |
|---------|-------|-----|
| Home | 6 | `home-ad1` … `home-ad6` |
| Article (news detail) | 2 | `article-ad1`, `article-ad2` |
| National | 4 | `national-ad1` … `national-ad4` |
| International | 4 | `international-ad1` … `4` |
| Religious | 4 | … |
| Politics | 4 | … |
| Health | 4 | … |
| Entertainment | 4 | … |
| Sports | 4 | … |
| Business | 4 | … |

Missing slot documents are auto-created as **disabled + empty** when ads are fetched.

---

## 3. Data model

| Field | Type | Purpose |
|-------|------|---------|
| `adId` | string | Slot ID, e.g. `home-ad5` |
| `site` | string | Tenant, e.g. `socialscreen` |
| `enabled` | boolean | Whether the slot is on |
| `mediaItems` | `[{ mediaType, mediaUrl }]` | One or more creatives (rotation) |
| `mediaType` / `mediaUrl` | legacy | Mirrored from first `mediaItems` entry |
| `linkUrl` | string \| null | Optional click-through URL |
| `altText` | string | Accessibility / fallback label |
| `createdAt` / `updatedAt` | timestamps | |

**Multi-creative rotation:** If a slot has several media items, the public site picks **one creative per page load**, advancing via `sessionStorage` (key like `ss-ad-rot-{adId}`). Upload order = rotation order. There is no drag-reorder UI.

---

## 4. Admin section — how ads are managed

### Entry

- Route: `/admin/ads` (often also default after `/admin`)
- Requires admin login (`POST /api/auth/login` → Bearer token in `localStorage`)
- Loads: `GET /api/ads?site=socialscreen`

### UI layout

Admin shows a **grid of section cards** (Home, Article, National, … Business).

Per section:

1. **“All Ads” toggle** — turns every slot in that section on/off (client issues multiple `PUT`s; one per slot).
2. **Per-slot cards** (`AD1`, `AD2`, …):
   - Enable / disable toggle
   - Media gallery (thumbnails of uploaded creatives)
   - Multi-file upload (images and/or videos)
   - **Link URL** (saved on blur)
   - **Alt text** (saved on blur)
   - Delete one creative or clear all

There is **no** “create new ad” button — only fill existing slots.

### Admin workflow (end-to-end)

1. Open `/admin/ads` and log in if needed.
2. Open the section (e.g. Home).
3. Optionally enable all slots in the section.
4. For a slot: enable → upload image(s)/video(s) → set Link URL and Alt Text.
5. Multiple creatives → visitors see one rotated creative per visit/load.
6. Public site picks up changes via `GET /api/ads?site=…` (AdService).

### Upload rules

- Accept `image/*` and `video/*`
- Multi-select up to ~20 files per request
- Stored under backend `uploads/ads/` as `ad-{timestamp}-{random}.{ext}`
- Typical max size ~50MB
- Relative URLs like `/uploads/ads/...` are prefixed with API base URL on the frontend

### Admin APIs

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/ads?site=…` | List all slots for site |
| `GET` | `/api/ads/:adId?site=…` | One slot |
| `PUT` | `/api/ads/:adId?site=…` | Update enabled / link / alt; can append media via multipart |
| `POST` | `/api/ads/:adId/media?site=…` | Append media (fallback if PUT media fails) |
| `DELETE` | `/api/ads/:adId/media?site=…` | Clear all creatives |
| `DELETE` | `/api/ads/:adId/media/:index?site=…` | Remove one creative |

Auth: Bearer token on mutating routes.

---

## 5. How ads appear on the public site

### Architecture

```
AdService
  └── loads GET /api/ads?site=…
  └── applies per-slot rotation
  └── exposes helpers: enabled?, media URL, link, alt, shouldDisplay?

Wrappers (placement + visibility)
  ├── HomeInlineAdSlot   (home main column)
  ├── SidebarAdSlot      (home sidebar)
  └── SectionInlineAd    (category pages + article)

Renderer
  └── AdSlotDisplay
        - "Advertisement" label
        - image or muted looping video
        - optional click-through link
        - fixed frame sizing (landscape 16:10 / portrait height cap)
```

**Exclude from new project:** any floating hover preview / zoom-on-hover enlarge panel. Render ads **in place only** (static frame + click if link set).

### Visibility rules (important)

| Placement type | Show when | Empty enabled slot |
|----------------|-----------|--------------------|
| Home sidebar / home inline | `enabled === true` | Can still show shell + “Advertisement” label / placeholder |
| Category & article inline | `enabled` **and** at least one media item | **Hidden** entirely |

### Frame / media behavior (in-page only)

- Landscape / square: max width ~572px, aspect ~16:10, `object-contain`
- Portrait: fixed height ~413px, width from natural aspect
- Video: muted, autoplay, loop, playsinline
- Always show a small **“Advertisement”** label above the creative
- If `linkUrl` is set, media is wrapped as a link (add `https://` if protocol missing)

---

## 6. Exact page placements

### Home page

**Sidebar** (top → bottom):

1. `home-ad1` — above Weather
2. Weather widget
3. `home-ad2` — between Weather & Cricket
4. Cricket widget
5. `home-ad3` — between Cricket & Panchang
6. Panchang widget
7. `home-ad4` — below Panchang

**Main column:**

- Hero → Latest stories → Category rows
- `home-ad5` — injected **between Politics and Health** category rows
- `home-ad6` — **before footer** (end of main column)

### Article / news detail page

- `article-ad1` — above Share controls
- `article-ad2` — above footer (after article body)

### Category pages (`/category/:category`)

- Section ID = route slug (`national`, `politics`, …)
- Layout: rows of article cards; **after each of up to 4 rows**, insert `section-ad1` … `section-ad4`
- Example: Politics page → `politics-ad1` after row 1, `politics-ad2` after row 2, etc.
- Uses banner-style inline ad wrapper
- Slot renders only if enabled **and** has media

---

## 7. Frontend config (what to copy conceptually)

Central config should define:

- `AD_SECTIONS` — section id, title, slot numbers
- `sectionAdId(section, n)` → `{section}-ad{n}`
- `HOME_PAGE_AD_MAP` — maps UI positions → IDs
- `ARTICLE_PAGE_AD_MAP` — aboveShare / aboveFooter

Environment should include something like `adSite: 'socialscreen'` (or your new site key) so all API calls stay tenant-scoped.

---

## 8. Public load sequence

1. App starts → `AdService.loadAds()` → `GET /api/ads?site=…`
2. Merge API result with full slot ID list (fill missing as disabled empties)
3. For each enabled slot with media, pick rotated creative for this session/load
4. Page components bind wrappers to fixed IDs (`home-ad3`, etc.)
5. Wrapper checks enable / has-media rules
6. `AdSlotDisplay` renders label + media (+ link). **No hover zoom.**

Category and article pages typically re-subscribe to `ads$` so admin changes reflect after reload.

---

## 9. What to implement in another project

### Must have

- Fixed slot catalogue per site
- Admin UI: section cards → per-slot enable, media upload, link, alt
- Site-scoped API (`?site=…`)
- Public placements wired to fixed IDs
- Multi-creative rotation (optional but present in Social Screen)
- In-place image/video rendering + Advertisement label

### Skip (per request)

- Hover floating preview / zoom-on-hover enlarge
- Any CSS `scale` on ad media on hover

### Optional product choices

- Whether empty-but-enabled home slots show a placeholder shell (Social Screen home does; category/article hide)
- Exact frame max sizes
- Whether “All Ads” uses one backend `toggle-all` call or N individual updates

---

## 10. Key file map (Social Screen reference)

| Role | Path |
|------|------|
| Slot config | `Frontend-SocialScreen/src/app/config/ad-sections.ts` |
| AdService | `Frontend-SocialScreen/src/app/services/ad.service.ts` |
| Rotation util | `Frontend-SocialScreen/src/app/utils/ad-rotation.ts` |
| Frame sizes | `Frontend-SocialScreen/src/app/utils/ad-frame-sizes.ts` |
| Core renderer | `Frontend-SocialScreen/src/app/components/ad-slot-display/` |
| Home inline | `Frontend-SocialScreen/src/app/components/home-inline-ad-slot/` |
| Sidebar slot | `Frontend-SocialScreen/src/app/components/sidebar/sidebar-ad-slot.component.ts` |
| Category/article | `Frontend-SocialScreen/src/app/components/section-inline-ad/` |
| Admin UI | `Frontend-SocialScreen/src/app/pages/admin/admin-ads/` |
| Backend model | `backend/models/Ad.js` |
| Backend routes | `backend/routes/ads.js` |

---

## One-line summary

**Fixed named ad slots, managed in an admin section grid, stored per-site in MongoDB with multi-creative rotation, and rendered in fixed page positions as labeled image/video units with optional click-through — without any hover zoom.**
