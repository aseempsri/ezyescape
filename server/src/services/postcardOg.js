import sharp from 'sharp';

const W = 1200;
const H = 630;

const LAYOUT_THEME = {
  letter: { paper: '#f4efe6', ink: '#2a241c', muted: '#6b5e4e', accent: '#c45c3a', mediaBg: '#d9d0c3' },
  airmail: { paper: '#f7f3ec', ink: '#1c2a3a', muted: '#4a5d72', accent: '#2f6fad', mediaBg: '#cfd8e2' },
  polaroid: { paper: '#f8f6f2', ink: '#2a241c', muted: '#6b5e4e', accent: '#c47d0a', mediaBg: '#e8e2d8' },
  telegram: { paper: '#1f2430', ink: '#f0e6d4', muted: '#b8a88c', accent: '#d4a84b', mediaBg: '#2c3344' },
  kraft: { paper: '#c4a574', ink: '#2c1c0c', muted: '#5a3d1c', accent: '#6b3f18', mediaBg: '#a88858' },
  night: { paper: '#1a2744', ink: '#e8eef8', muted: '#9eb6d8', accent: '#f5c65c', mediaBg: '#243556' },
  meadow: { paper: '#e8f0e4', ink: '#243528', muted: '#4f6a55', accent: '#5a8f4a', mediaBg: '#c5d6bf' },
  ticket: { paper: '#f3ebe0', ink: '#2a241c', muted: '#6b5e4e', accent: '#b45309', mediaBg: '#ddd2c4' },
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

function escapeXml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text, maxChars, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (next.length > maxChars && cur) {
      lines.push(cur);
      cur = word;
      if (lines.length >= maxLines) break;
    } else {
      cur = next;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  const joined = words.join(' ');
  const shown = lines.join(' ');
  if (joined.length > shown.length && lines.length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:!?]?$/, '')}…`;
  }
  return lines.slice(0, maxLines);
}

async function loadPhotoBuffer(url, width, height) {
  if (!url) return null;
  try {
    const res = await fetch(url, { redirect: 'follow' });
    if (!res.ok) return null;
    const ctype = res.headers.get('content-type') || '';
    if (ctype.includes('video')) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return sharp(buf)
      .rotate()
      .resize(width, height, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    return null;
  }
}

function firstImageUrl(postcard) {
  const media = postcard.media || [];
  const image = media.find((m) => m.type === 'image' && m.url);
  if (image) return image.url;
  return '';
}

function mediaGeometry(layout) {
  if (layout === 'polaroid') {
    return { x: 80, y: 40, w: 1040, h: 360, rx: 4 };
  }
  if (layout === 'airmail') {
    return { x: 48, y: 48, w: 560, h: 534, rx: 10 };
  }
  return { x: 560, y: 48, w: 592, h: 534, rx: 10 };
}

function copyGeometry(layout) {
  if (layout === 'polaroid') {
    return { x: 80, y: 430, maxChars: 52, maxLines: 3, fontSize: 28 };
  }
  if (layout === 'airmail') {
    return { x: 650, y: 70, maxChars: 26, maxLines: 5, fontSize: 32 };
  }
  return { x: 56, y: 70, maxChars: 26, maxLines: 5, fontSize: 34 };
}

/**
 * Render a 1200×630 Open Graph image that mirrors the site postcard (copy + photo).
 */
export async function renderPostcardOgImage(postcard) {
  const layout = LAYOUT_THEME[postcard.layout] ? postcard.layout : 'letter';
  const theme = LAYOUT_THEME[layout];
  const kicker = KICKERS[layout] || KICKERS.letter;
  const media = mediaGeometry(layout);
  const copy = copyGeometry(layout);
  const quoteLines = wrapText(postcard.text, copy.maxChars, copy.maxLines);
  const name = String(postcard.name || 'Guest').slice(0, 40);
  const from = String(postcard.from || '').slice(0, 40);
  const emoji = postcard.avatarMode === 'character' ? postcard.characterEmoji || '✉️' : '';

  const photoBuf = await loadPhotoBuffer(firstImageUrl(postcard), media.w, media.h);

  const quoteSvg = quoteLines
    .map((line, i) => {
      const y = copy.y + 52 + i * (copy.fontSize + 10);
      let shown = line;
      if (i === 0) shown = `“${shown}`;
      if (i === quoteLines.length - 1) shown = `${shown}”`;
      return `<text x="${copy.x}" y="${y}" font-size="${copy.fontSize}" font-family="Georgia, 'Times New Roman', serif" font-style="italic" fill="${theme.ink}">${escapeXml(shown)}</text>`;
    })
    .join('');

  const signerY = Math.min(
    layout === 'polaroid' ? 590 : 530,
    copy.y + 52 + quoteLines.length * (copy.fontSize + 10) + 40
  );

  const avatarSvg = emoji
    ? `<text x="${copy.x + 20}" y="${signerY + 10}" font-size="30" text-anchor="middle">${escapeXml(emoji)}</text>`
    : `<circle cx="${copy.x + 20}" cy="${signerY}" r="20" fill="${theme.accent}" opacity="0.9"/>`;

  const border =
    layout === 'airmail'
      ? `<rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="none" stroke="#c45c3a" stroke-width="6"/>
         <rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="none" stroke="#2f6fad" stroke-width="3"/>`
      : layout === 'ticket'
        ? `<rect x="24" y="24" width="${W - 48}" height="${H - 48}" fill="none" stroke="${theme.ink}" stroke-width="2" stroke-dasharray="10 8" rx="8"/>`
        : '';

  const stamp =
    layout === 'telegram'
      ? `<rect x="${W - 150}" y="40" width="100" height="44" rx="4" fill="none" stroke="${theme.accent}" stroke-width="2"/>
         <text x="${W - 100}" y="68" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" font-weight="700" fill="${theme.accent}">RCVD</text>`
      : `<circle cx="${W - 90}" cy="78" r="42" fill="${theme.paper}" stroke="${theme.accent}" stroke-width="3" stroke-dasharray="4 5"/>
         <text x="${W - 90}" y="74" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="${theme.accent}" letter-spacing="1">EZY</text>
         <text x="${W - 90}" y="90" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="${theme.accent}" letter-spacing="1">ESCAPE</text>`;

  // Transparent SVG overlay (no full-bleed fill) so the photo shows through.
  const overlaySvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  ${border}
  <text x="${copy.x}" y="${copy.y}" font-size="13" font-family="Arial, sans-serif" font-weight="700" letter-spacing="2" fill="${theme.accent}">${escapeXml(kicker.toUpperCase())}</text>
  ${quoteSvg}
  ${avatarSvg}
  <text x="${copy.x + 52}" y="${signerY - 2}" font-size="22" font-family="Arial, sans-serif" font-weight="700" fill="${theme.ink}">${escapeXml(name)}</text>
  ${from ? `<text x="${copy.x + 52}" y="${signerY + 24}" font-size="16" font-family="Arial, sans-serif" fill="${theme.muted}">${escapeXml(from)}</text>` : ''}
  ${stamp}
</svg>`;

  const layers = [];

  if (photoBuf) {
    const rounded = await sharp(photoBuf)
      .resize(media.w, media.h, { fit: 'cover' })
      .composite([
        {
          input: Buffer.from(
            `<svg width="${media.w}" height="${media.h}"><rect width="${media.w}" height="${media.h}" rx="${media.rx}" ry="${media.rx}" fill="#fff"/></svg>`
          ),
          blend: 'dest-in',
        },
      ])
      .png()
      .toBuffer();
    layers.push({ input: rounded, top: media.y, left: media.x });
  } else {
    const placeholder = await sharp({
      create: {
        width: media.w,
        height: media.h,
        channels: 3,
        background: theme.mediaBg,
      },
    })
      .png()
      .toBuffer();
    layers.push({ input: placeholder, top: media.y, left: media.x });
  }

  layers.push({ input: Buffer.from(overlaySvg), top: 0, left: 0 });

  // WhatsApp rejects / skips large previews — keep JPEG under ~300KB.
  return sharp({
    create: {
      width: W,
      height: H,
      channels: 3,
      background: theme.paper,
    },
  })
    .composite(layers)
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();
}
