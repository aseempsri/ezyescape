import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** OG canvas (WhatsApp / Facebook large preview). */
const W = 1200;
const H = 630;

const HAND_FONTS = {
  tangerine: { family: "'Tangerine', cursive", size: '2.55rem', weight: 700, line: 1.12 },
  caveat: { family: "'Caveat', cursive", size: '2rem', weight: 600, line: 1.28 },
  kalam: { family: "'Kalam', cursive", size: '1.55rem', weight: 400, line: 1.45 },
  patrick: { family: "'Patrick Hand', cursive", size: '1.7rem', weight: 400, line: 1.4 },
  shadows: { family: "'Shadows Into Light', cursive", size: '1.85rem', weight: 400, line: 1.35 },
  satisfy: { family: "'Satisfy', cursive", size: '1.9rem', weight: 400, line: 1.35 },
  gloria: { family: "'Gloria Hallelujah', cursive", size: '1.45rem', weight: 400, line: 1.5 },
  indie: { family: "'Indie Flower', cursive", size: '1.7rem', weight: 400, line: 1.4 },
};

const KICKERS = {
  letter: 'A note from the hills',
  airmail: 'Par avion · from the hills',
  polaroid: 'Developed in the mountains',
  telegram: 'STOP · ridge telegram',
  kraft: 'Packed with care',
  night: 'Written after dark',
  meadow: 'From the orchard path',
  ticket: 'Admit one · slow traveller',
};

const WALL = {
  letter: '#ebe2d4',
  airmail: '#e8eef5',
  polaroid: '#ebe2d4',
  telegram: '#12151c',
  kraft: '#c4a574',
  night: '#071018',
  meadow: '#dde8d6',
  ticket: '#f3ebe0',
};

const CSS_CANDIDATES = [
  path.resolve(__dirname, '../../../web/src/styles/postcards.css'),
  path.resolve(__dirname, '../../web/src/styles/postcards.css'),
  path.resolve('/var/www/ezyescape/web/src/styles/postcards.css'),
  path.resolve('/var/www/ezyescape-src/web/src/styles/postcards.css'),
];

const CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
  '/snap/bin/chromium',
].filter(Boolean);

let browserPromise = null;
let postcardCssCache = null;

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function loadPostcardCss() {
  if (postcardCssCache != null) return postcardCssCache;
  for (const candidate of CSS_CANDIDATES) {
    try {
      if (fs.existsSync(candidate)) {
        postcardCssCache = fs.readFileSync(candidate, 'utf8');
        return postcardCssCache;
      }
    } catch {
      /* try next */
    }
  }
  postcardCssCache = '';
  return postcardCssCache;
}

function findChrome() {
  for (const candidate of CHROME_CANDIDATES) {
    try {
      if (fs.existsSync(candidate)) return candidate;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function getBrowser() {
  if (!browserPromise) {
    // Prefer system Chrome when present; otherwise Puppeteer's bundled Chromium.
    const executablePath = findChrome() || undefined;
    browserPromise = puppeteer
      .launch({
        ...(executablePath ? { executablePath } : {}),
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none',
          '--hide-scrollbars',
        ],
      })
      .catch((err) => {
        browserPromise = null;
        throw err;
      });
  }
  return browserPromise;
}

function firstImageUrl(postcard, origin) {
  const media = postcard.media || [];
  const image = media.find((m) => m.type === 'image' && m.url);
  return absolutize(image?.url || '', origin);
}

function absolutize(url, baseOrigin) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (/localhost|127\.0\.0\.1/i.test(u.hostname) && baseOrigin) {
        return `${baseOrigin}${u.pathname}${u.search}`;
      }
    } catch {
      /* keep */
    }
    return url;
  }
  if (!baseOrigin) return url;
  return `${baseOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
}

function stampHtml(layout) {
  if (layout === 'airmail') {
    return `<span class="pc-postmark"><em>Ezy</em><span>Escape</span></span>`;
  }
  if (layout === 'ticket') {
    return `<span class="pc-ticket-stub">EE · PASS</span>`;
  }
  if (layout === 'telegram') {
    return `<span class="pc-telegram-stamp">RCVD</span>`;
  }
  if (layout === 'polaroid') {
    return `<span class="pc-polaroid-date">Ezy Escape</span>`;
  }
  return 'Ezy Escape';
}

function avatarHtml(postcard, origin) {
  if (postcard.avatarMode === 'photo' && postcard.avatarUrl) {
    const url = escapeHtml(absolutize(postcard.avatarUrl, origin));
    return `<span class="pc-avatar pc-avatar--photo" style="background-image:url('${url}')" aria-hidden="true"></span>`;
  }
  return `<span class="pc-avatar pc-avatar--char" aria-hidden="true">${escapeHtml(
    postcard.characterEmoji || '✉️'
  )}</span>`;
}

function buildOgHtml(postcard, origin) {
  const layout = KICKERS[postcard.layout] ? postcard.layout : 'letter';
  const font = HAND_FONTS[postcard.handFont] || HAND_FONTS.caveat;
  const kicker = KICKERS[layout];
  const wall = WALL[layout] || WALL.letter;
  const photoUrl = firstImageUrl(postcard, origin);
  const css = loadPostcardCss();
  const name = escapeHtml(postcard.name || 'Guest');
  const from = escapeHtml(postcard.from || '');
  const text = escapeHtml(postcard.text || '');

  const textStyle = [
    `font-family:${font.family}`,
    `font-size:${font.size}`,
    `font-weight:${font.weight}`,
    `line-height:${font.line}`,
  ].join(';');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Gloria+Hallelujah&family=Indie+Flower&family=Kalam:wght@300;400;700&family=Patrick+Hand&family=Poppins:wght@400;600;700&family=Satisfy&family=Shadows+Into+Light&family=Tangerine:wght@400;700&display=swap" rel="stylesheet" />
  <style>
    ${css}
    html, body {
      margin: 0;
      padding: 0;
      background: ${wall};
      font-family: 'Poppins', system-ui, sans-serif;
    }
    #og-frame {
      width: ${W}px;
      height: ${H}px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 36px 48px;
      box-sizing: border-box;
      background: ${wall};
    }
    #og-frame .pc-card {
      width: 100%;
      max-width: 1040px;
      transform: none !important;
    }
    #og-frame .pc-share,
    #og-frame .pc-media-nav,
    #og-frame .pc-media-dots {
      display: none !important;
    }
    #og-frame .pc-card-media {
      min-height: 420px;
    }
    #og-frame .pc-card-inner--polaroid .pc-card-media {
      min-height: 340px;
    }
    #og-frame .pc-card-media-el {
      width: 100%;
      height: 100%;
      min-height: inherit;
      background-size: cover;
      background-position: center;
    }
  </style>
</head>
<body>
  <div id="og-frame">
    <article class="pc-card pc-card--${escapeHtml(layout)} pc-card--font-${escapeHtml(postcard.handFont || 'caveat')}">
      <div class="pc-card-stamp" aria-hidden="true">${stampHtml(layout)}</div>
      <div class="pc-card-inner pc-card-inner--${escapeHtml(layout)}">
        <div class="pc-card-copy">
          <p class="pc-card-kicker">${escapeHtml(kicker)}</p>
          <p class="pc-card-text" style="${textStyle}">“${text}”</p>
          <div class="pc-card-signer">
            ${avatarHtml(postcard, origin)}
            <div class="pc-card-signer-meta">
              <div class="pc-card-name">${name}</div>
              ${from ? `<div class="pc-card-from">${from}</div>` : ''}
            </div>
          </div>
        </div>
        <div class="pc-card-media">
          ${
            photoUrl
              ? `<div class="pc-card-media-el" style="background-image:url('${escapeHtml(photoUrl)}')"></div>`
              : `<div class="pc-card-media-empty">No media yet</div>`
          }
        </div>
      </div>
    </article>
  </div>
</body>
</html>`;
}

async function renderWithChrome(postcard, origin) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
    await page.setContent(buildOgHtml(postcard, origin), {
      waitUntil: ['load', 'networkidle0'],
      timeout: 25000,
    });
    // Ensure webfonts + photo are ready
    await page.evaluate(async () => {
      if (document.fonts?.ready) await document.fonts.ready;
      const imgs = [...document.querySelectorAll('.pc-card-media-el, .pc-avatar--photo')];
      await Promise.all(
        imgs.map((el) => {
          const bg = getComputedStyle(el).backgroundImage;
          const m = bg && bg.match(/url\(["']?(.*?)["']?\)/);
          if (!m?.[1] || m[1] === 'none') return null;
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = m[1];
          });
        })
      );
    });
    const frame = await page.$('#og-frame');
    const png = await frame.screenshot({ type: 'png' });
    return sharp(png)
      .resize(W, H, { fit: 'fill' })
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
  } finally {
    await page.close().catch(() => {});
  }
}

/** Sharp fallback when Chrome is unavailable — approximate layout only. */
async function renderWithSharp(postcard, origin) {
  const layout = KICKERS[postcard.layout] ? postcard.layout : 'letter';
  const wall = WALL[layout] || WALL.letter;
  const ink = layout === 'telegram' || layout === 'night' ? '#f7edd8' : '#2a241c';
  const accent = layout === 'airmail' ? '#3d6fa8' : '#8a6a3e';
  const photoUrl = firstImageUrl(postcard, origin);
  const name = String(postcard.name || 'Guest').slice(0, 40);
  const from = String(postcard.from || '').slice(0, 40);
  const words = String(postcard.text || '').trim().split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > 28 && cur) {
      lines.push(cur);
      cur = w;
      if (lines.length >= 5) break;
    } else cur = next;
  }
  if (lines.length < 5 && cur) lines.push(cur);
  if (words.join(' ').length > lines.join(' ').length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?]?$/, '')}…`;
  }

  const mediaW = 480;
  const mediaH = 480;
  const mediaX = layout === 'airmail' || layout === 'polaroid' ? 90 : 620;
  const mediaY = 75;
  let photoBuf = null;
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl, { redirect: 'follow' });
      if (res.ok) {
        photoBuf = await sharp(Buffer.from(await res.arrayBuffer()))
          .rotate()
          .resize(mediaW, mediaH, { fit: 'cover' })
          .png()
          .toBuffer();
      }
    } catch {
      /* placeholder */
    }
  }

  const quote = lines
    .map((line, i) => {
      const y = 150 + i * 36;
      let shown = line;
      if (i === 0) shown = `“${shown}`;
      if (i === lines.length - 1) shown = `${shown}”`;
      return `<text x="${layout === 'airmail' ? 610 : 100}" y="${y}" font-size="26" font-family="Georgia, serif" font-style="italic" fill="${ink}">${escapeHtml(shown)}</text>`;
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${wall}"/>
  <rect x="70" y="48" width="1060" height="534" rx="6" fill="${layout === 'telegram' ? '#1f2430' : layout === 'night' ? '#0b1524' : '#faf6ef'}"/>
  <text x="${layout === 'airmail' ? 610 : 100}" y="100" font-size="13" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2" fill="${accent}">${escapeHtml((KICKERS[layout] || '').toUpperCase())}</text>
  ${quote}
  <text x="${layout === 'airmail' ? 610 : 100}" y="520" font-size="20" font-family="Arial, sans-serif" font-weight="700" fill="${ink}">${escapeHtml(name)}</text>
  ${from ? `<text x="${layout === 'airmail' ? 610 : 100}" y="545" font-size="15" font-family="Arial, sans-serif" fill="${accent}">${escapeHtml(from)}</text>` : ''}
</svg>`;

  const layers = [{ input: Buffer.from(svg), top: 0, left: 0 }];
  if (photoBuf) layers.push({ input: photoBuf, top: mediaY, left: mediaX });

  return sharp({
    create: { width: W, height: H, channels: 3, background: wall },
  })
    .composite(layers)
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}

/**
 * Render a 1200×630 Open Graph image that matches the website PostcardCard.
 * Prefers a Chromium screenshot of the real card CSS; falls back to Sharp.
 */
export async function renderPostcardOgImage(postcard, opts = {}) {
  const origin = (opts.origin || process.env.SITE_URL || 'https://ezyescape.com').replace(/\/+$/, '');
  try {
    return await renderWithChrome(postcard, origin);
  } catch (err) {
    console.error('[postcardOg] Chrome render failed, using Sharp fallback:', err.message);
    return renderWithSharp(postcard, origin);
  }
}

export async function closePostcardOgBrowser() {
  if (!browserPromise) return;
  try {
    const browser = await browserPromise;
    await browser.close();
  } catch {
    /* ignore */
  } finally {
    browserPromise = null;
  }
}
