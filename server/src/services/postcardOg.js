import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.resolve(__dirname, '../../assets/fonts');

/** OG canvas (WhatsApp / Facebook large preview). */
const W = 1200;
const H = 630;
const CARD = { x: 64, y: 40, w: 1072, h: 550, pad: 16 };

const KICKERS = {
  letter: 'A NOTE FROM THE HILLS',
  airmail: 'PAR AVION · FROM THE HILLS',
  polaroid: 'DEVELOPED IN THE MOUNTAINS',
  telegram: 'STOP · RIDGE TELEGRAM',
  kraft: 'PACKED WITH CARE',
  night: 'WRITTEN AFTER DARK',
  meadow: 'FROM THE ORCHARD PATH',
  ticket: 'ADMIT ONE · SLOW TRAVELLER',
};

const THEME = {
  letter: {
    wall: '#ebe2d4',
    paper: '#faf6ef',
    ink: '#2a241c',
    muted: '#8a6a3e',
    accent: '#8a6a3e',
    stamp: '#8c3030',
    mediaBg: '#d9d0c3',
  },
  airmail: {
    wall: '#e8eef5',
    paper: '#f4f7fb',
    ink: '#1c2a3a',
    muted: '#3d6fa8',
    accent: '#3d6fa8',
    stamp: '#324050',
    mediaBg: '#cfd8e2',
  },
  polaroid: {
    wall: '#ebe2d4',
    paper: '#f7f4ef',
    ink: '#2a241c',
    muted: '#8a6a3e',
    accent: '#8a6a3e',
    stamp: '#8a6a3e',
    mediaBg: '#e8e2d8',
  },
  telegram: {
    wall: '#12151c',
    paper: '#1f2430',
    ink: '#f7edd8',
    muted: '#f5c65c',
    accent: '#f5c65c',
    stamp: '#f5c65c',
    mediaBg: '#2c3344',
  },
  kraft: {
    wall: '#c4a574',
    paper: '#b08958',
    ink: '#2c1c0c',
    muted: '#5a3d1c',
    accent: '#4a3218',
    stamp: '#4a3218',
    mediaBg: '#a07848',
  },
  night: {
    wall: '#071018',
    paper: '#0b1524',
    ink: '#e8eef8',
    muted: '#9eb6d8',
    accent: '#9eb6d8',
    stamp: '#c8dcff',
    mediaBg: '#243556',
  },
  meadow: {
    wall: '#dde8d6',
    paper: '#eef6ea',
    ink: '#243528',
    muted: '#4f7340',
    accent: '#4f7340',
    stamp: '#46703c',
    mediaBg: '#c5d6bf',
  },
  ticket: {
    wall: '#f3ebe0',
    paper: '#fff8ee',
    ink: '#2a241c',
    muted: '#a0672e',
    accent: '#a0672e',
    stamp: '#2a241c',
    mediaBg: '#ddd2c4',
  },
};

const HAND_FONTS = {
  tangerine: { file: 'Caveat-Regular.ttf', family: 'EECaveat', size: 44 },
  caveat: { file: 'Caveat-Regular.ttf', family: 'EECaveat', size: 38 },
  kalam: { file: 'Kalam-Regular.ttf', family: 'EEKalam', size: 30 },
  patrick: { file: 'PatrickHand-Regular.ttf', family: 'EEPatrick', size: 32 },
  shadows: { file: 'PatrickHand-Regular.ttf', family: 'EEPatrick', size: 34 },
  satisfy: { file: 'Caveat-Regular.ttf', family: 'EECaveat', size: 36 },
  gloria: { file: 'Kalam-Regular.ttf', family: 'EEKalam', size: 28 },
  indie: { file: 'IndieFlower-Regular.ttf', family: 'EEIndie', size: 32 },
};

let fontsRegistered = false;

const UI_SANS = 'EEPoppins';

function registerFonts() {
  if (fontsRegistered) return;
  const uiRegular = path.join(FONTS_DIR, 'Poppins-Regular.ttf');
  const uiBold = path.join(FONTS_DIR, 'Poppins-Bold.ttf');
  if (fs.existsSync(uiRegular)) GlobalFonts.registerFromPath(uiRegular, UI_SANS);
  if (fs.existsSync(uiBold)) GlobalFonts.registerFromPath(uiBold, UI_SANS);

  const seen = new Set();
  for (const meta of Object.values(HAND_FONTS)) {
    if (seen.has(meta.family)) continue;
    const abs = path.join(FONTS_DIR, meta.file);
    if (fs.existsSync(abs)) {
      GlobalFonts.registerFromPath(abs, meta.family);
      seen.add(meta.family);
    }
  }
  fontsRegistered = true;
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

function firstImageUrl(postcard, origin) {
  const media = postcard.media || [];
  const image = media.find((m) => m.type === 'image' && m.url);
  return absolutize(image?.url || '', origin);
}

function wrapText(ctx, text, maxWidth, maxLines) {
  const words = String(text || '').trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const word of words) {
    const next = cur ? `${cur} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && cur) {
      lines.push(cur);
      cur = word;
      if (lines.length >= maxLines) break;
    } else {
      cur = next;
    }
  }
  if (lines.length < maxLines && cur) lines.push(cur);
  const full = words.join(' ');
  const shown = lines.join(' ');
  if (full.length > shown.length && lines.length) {
    let last = lines[lines.length - 1].replace(/[.,;:!?]?$/, '');
    while (last.length > 1 && ctx.measureText(`${last}…`).width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[lines.length - 1] = `${last}…`;
  }
  return lines.slice(0, maxLines);
}

function layoutBoxes(layout) {
  const { x, y, w, h, pad } = CARD;

  if (layout === 'polaroid') {
    const photoH = 318;
    return {
      photo: { x: x + pad, y: y + pad, w: w - pad * 2, h: photoH },
      copy: {
        x: x + pad + 10,
        y: y + pad + photoH + 22,
        w: w - pad * 2 - 20,
        maxLines: 3,
      },
      signerY: y + h - 38,
      stamp: { x: x + w - 150, y: y + h - 42 },
    };
  }

  if (layout === 'airmail') {
    const inset = 12;
    const mediaW = Math.round(w * 0.48);
    return {
      photo: { x: x + inset, y: y + inset, w: mediaW - inset, h: h - inset * 2 },
      copy: {
        x: x + mediaW + 28,
        y: y + 34,
        w: w - mediaW - 78,
        maxLines: 6,
      },
      signerY: y + h - 48,
      stamp: { x: x + w - 78, y: y + 56 },
    };
  }

  const mediaW = Math.round(w * 0.48);
  return {
    photo: { x: x + w - mediaW, y, w: mediaW, h },
    copy: {
      x: x + 36,
      y: y + 34,
      w: w - mediaW - 70,
      maxLines: 6,
    },
    signerY: y + h - 48,
    stamp: { x: x + w - 70, y: y + 56 },
  };
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawAirmailBorder(ctx, x, y, w, h) {
  const band = 9;
  const colors = ['#c45c4a', '#f7f9fc', '#3d6fa8', '#f7f9fc'];
  const inset = 12;
  ctx.save();
  roundRect(ctx, x, y, w, h, 6);
  ctx.clip();

  ctx.translate(x, y);
  ctx.rotate((-45 * Math.PI) / 180);
  for (let i = -h * 2; i < w + h * 2; i += band) {
    ctx.fillStyle = colors[Math.floor(Math.abs(i) / band) % colors.length];
    ctx.fillRect(i, -w, band, w + h * 3);
  }
  ctx.restore();

  ctx.fillStyle = '#f4f7fb';
  ctx.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
}

function drawStamp(ctx, layout, theme, box, handFamily) {
  const { x, y } = box;
  ctx.save();
  if (layout === 'airmail') {
    ctx.strokeStyle = theme.stamp;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = theme.stamp;
    ctx.font = '700 11px EEPoppins';
    ctx.textAlign = 'center';
    ctx.fillText('EZY', x, y - 4);
    ctx.fillText('ESCAPE', x, y + 12);
  } else if (layout === 'telegram') {
    ctx.strokeStyle = theme.stamp;
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 44, y - 16, 88, 36);
    ctx.fillStyle = theme.stamp;
    ctx.font = '700 15px EEPoppins';
    ctx.textAlign = 'center';
    ctx.fillText('RCVD', x, y + 6);
  } else if (layout === 'ticket') {
    ctx.fillStyle = '#2a241c';
    ctx.fillRect(x - 48, y - 18, 96, 40);
    ctx.fillStyle = '#f5d9a8';
    ctx.font = '700 12px EEPoppins';
    ctx.textAlign = 'center';
    ctx.fillText('EE · PASS', x, y + 6);
  } else if (layout === 'polaroid') {
    ctx.translate(x, y);
    ctx.rotate((-3 * Math.PI) / 180);
    ctx.fillStyle = theme.stamp;
    ctx.font = `400 24px "${handFamily}", Georgia, serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Ezy Escape', 0, 0);
  } else {
    ctx.fillStyle = theme.paper;
    ctx.strokeStyle = theme.stamp;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = theme.stamp;
    ctx.font = '700 11px EEPoppins';
    ctx.textAlign = 'center';
    ctx.fillText('EZY', x, y - 4);
    ctx.fillText('ESCAPE', x, y + 12);
  }
  ctx.restore();
}

/**
 * Render a 1200×630 Open Graph image matching website postcard layouts.
 */
export async function renderPostcardOgImage(postcard, opts = {}) {
  registerFonts();
  const origin = (opts.origin || process.env.SITE_URL || 'https://ezyescape.com').replace(/\/+$/, '');
  const layout = THEME[postcard.layout] ? postcard.layout : 'letter';
  const theme = THEME[layout];
  const hand = HAND_FONTS[postcard.handFont] || HAND_FONTS.caveat;
  const boxes = layoutBoxes(layout);
  const name = String(postcard.name || 'Guest').slice(0, 42);
  const from = String(postcard.from || '').slice(0, 42);
  const initial = (name[0] || 'G').toUpperCase();
  const kicker = KICKERS[layout] || KICKERS.letter;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Wall
  ctx.fillStyle = theme.wall;
  ctx.fillRect(0, 0, W, H);

  // Soft card shadow
  ctx.fillStyle = 'rgba(40, 28, 14, 0.14)';
  roundRect(ctx, CARD.x + 10, CARD.y + 14, CARD.w, CARD.h, 6);
  ctx.fill();

  // Paper
  if (layout === 'airmail') {
    drawAirmailBorder(ctx, CARD.x, CARD.y, CARD.w, CARD.h);
  } else {
    ctx.fillStyle = theme.paper;
    roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, layout === 'polaroid' ? 2 : 4);
    ctx.fill();
  }

  if (layout === 'ticket') {
    ctx.strokeStyle = '#c49a6c';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 7]);
    ctx.strokeRect(CARD.x + 8, CARD.y + 8, CARD.w - 16, CARD.h - 16);
    ctx.setLineDash([]);
  }

  // Photo
  const photoUrl = firstImageUrl(postcard, origin);
  ctx.fillStyle = theme.mediaBg;
  ctx.fillRect(boxes.photo.x, boxes.photo.y, boxes.photo.w, boxes.photo.h);
  if (photoUrl) {
    try {
      const img = await loadImage(photoUrl);
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxes.photo.x, boxes.photo.y, boxes.photo.w, boxes.photo.h);
      ctx.clip();
      const scale = Math.max(boxes.photo.w / img.width, boxes.photo.h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = boxes.photo.x + (boxes.photo.w - dw) / 2;
      const dy = boxes.photo.y + (boxes.photo.h - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
    } catch {
      /* keep placeholder */
    }
  }

  // Airmail ruled lines (copy side only)
  if (layout === 'airmail') {
    ctx.strokeStyle = 'rgba(61, 111, 168, 0.14)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i += 1) {
      const yy = boxes.copy.y + 44 + i * 28;
      ctx.beginPath();
      ctx.moveTo(boxes.copy.x, yy);
      ctx.lineTo(CARD.x + CARD.w - 28, yy);
      ctx.stroke();
    }
  }

  // Kicker
  ctx.fillStyle = theme.accent;
  ctx.font = '700 13px EEPoppins';
  ctx.textAlign = 'left';
  ctx.letterSpacing = '2px';
  try {
    ctx.letterSpacing = '0.18em';
  } catch {
    /* optional */
  }
  ctx.fillText(kicker, boxes.copy.x, boxes.copy.y + 4);
  ctx.letterSpacing = '0px';

  // Quote
  ctx.fillStyle = theme.ink;
  ctx.font = `400 ${hand.size}px "${hand.family}", Georgia, serif`;
  const quoteLines = wrapText(ctx, postcard.text, boxes.copy.w, boxes.copy.maxLines);
  const lineGap = layout === 'polaroid' ? 8 : 10;
  quoteLines.forEach((line, i) => {
    let shown = line;
    if (i === 0) shown = `“${shown}`;
    if (i === quoteLines.length - 1) shown = `${shown}”`;
    ctx.fillText(shown, boxes.copy.x, boxes.copy.y + 48 + i * (hand.size + lineGap));
  });

  // Avatar monogram
  const avatarCx = boxes.copy.x + 22;
  const avatarCy = boxes.signerY;
  const avatarUrl =
    postcard.avatarMode === 'photo' && postcard.avatarUrl
      ? absolutize(postcard.avatarUrl, origin)
      : '';
  if (avatarUrl) {
    try {
      const avatar = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCx, avatarCy, 22, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatar, avatarCx - 22, avatarCy - 22, 44, 44);
      ctx.restore();
    } catch {
      ctx.fillStyle = theme.accent;
      ctx.beginPath();
      ctx.arc(avatarCx, avatarCy, 22, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = theme.accent;
    ctx.beginPath();
    ctx.arc(avatarCx, avatarCy, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = layout === 'telegram' || layout === 'night' ? theme.paper : '#ffffff';
    ctx.font = '700 18px EEPoppins';
    ctx.textAlign = 'center';
    ctx.fillText(initial, avatarCx, avatarCy + 6);
    ctx.textAlign = 'left';
  }

  // Name / from
  ctx.fillStyle = theme.ink;
  ctx.font = '700 20px EEPoppins';
  ctx.textAlign = 'left';
  ctx.fillText(name, boxes.copy.x + 56, boxes.signerY - 2);
  if (from) {
    ctx.fillStyle = theme.muted;
    ctx.font = '400 15px EEPoppins';
    ctx.fillText(from, boxes.copy.x + 56, boxes.signerY + 18);
  }

  // Stamp
  drawStamp(ctx, layout, theme, boxes.stamp, hand.family);

  // Re-draw airmail stripe rim on top of photo edges
  if (layout === 'airmail') {
    const inset = 12;
    ctx.save();
    roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 6);
    ctx.clip();
    // mask out interior — draw only the rim by clearing? simpler: redraw stripes then fill inner hole with nothing by clipping difference
    const band = 9;
    const colors = ['#c45c4a', '#f7f9fc', '#3d6fa8', '#f7f9fc'];
    ctx.save();
    // outer clip already set; now exclude inner
    ctx.beginPath();
    ctx.rect(CARD.x, CARD.y, CARD.w, CARD.h);
    ctx.rect(CARD.x + inset, CARD.y + inset, CARD.w - inset * 2, CARD.h - inset * 2);
    ctx.clip('evenodd');
    ctx.translate(CARD.x, CARD.y);
    ctx.rotate((-45 * Math.PI) / 180);
    for (let i = -CARD.h * 2; i < CARD.w + CARD.h * 2; i += band) {
      ctx.fillStyle = colors[Math.floor(Math.abs(i) / band) % colors.length];
      ctx.fillRect(i, -CARD.w, band, CARD.w + CARD.h * 3);
    }
    ctx.restore();
    ctx.restore();
  }

  const png = canvas.toBuffer('image/png');
  return sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
}

export async function closePostcardOgBrowser() {
  // no-op (compatibility)
}
