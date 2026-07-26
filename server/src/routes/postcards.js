import { Router } from 'express';
import mongoose from 'mongoose';
import Postcard from '../models/Postcard.js';
import { upload } from '../config/upload.js';
import { styleForIndex } from '../data/postcardStyles.js';
import { renderPostcardOgImage } from '../services/postcardOg.js';
import { absoluteUrl } from '../utils/siteUrl.js';

const router = Router();

function publicUrl(req, filename) {
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('x-forwarded-host') || req.get('host');
  return `${proto}://${host}/uploads/${filename}`;
}

function serialize(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    from: doc.from || '',
    text: doc.text,
    media: doc.media || [],
    avatarMode: doc.avatarMode,
    avatarUrl: doc.avatarUrl || '',
    gender: doc.gender || '',
    characterId: doc.characterId || '',
    characterEmoji: doc.characterEmoji || '',
    handFont: doc.handFont || '',
    layout: doc.layout || 'letter',
    status: doc.status,
    createdAt: doc.createdAt,
  };
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function findApprovedPostcard(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Postcard.findOne({ _id: id, status: 'approved' });
}

export function shareHtmlForPostcard(req, postcard) {
  const id = String(postcard._id);
  const pageUrl = absoluteUrl(req, `/postcards/${id}`);
  // v=2 busts crawler caches after OG renderer switched to live-card screenshots
  const ogImage = absoluteUrl(req, `/api/postcards/${id}/og.jpg?v=2`);
  const title = `${postcard.name}'s postcard — Ezy Escape`;
  const description = String(postcard.text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const fromBit = postcard.from ? ` from ${postcard.from}` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Ezy Escape" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${escapeHtml(`Postcard by ${postcard.name}${fromBit}`)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
</head>
<body style="font-family: system-ui, sans-serif; background:#f7f3ed; color:#1c2a3a; padding:48px 24px; text-align:center;">
  <p>Opening ${escapeHtml(postcard.name)}'s postcard…</p>
  <p><a href="${escapeHtml(pageUrl)}">Continue to Ezy Escape</a></p>
  <script>location.replace(${JSON.stringify(pageUrl)});</script>
</body>
</html>`;
}

async function findApproved(id) {
  return findApprovedPostcard(id);
}

function shareHtml(req, postcard) {
  return shareHtmlForPostcard(req, postcard);
}

/** Approved postcards only — latest first. */
router.get('/', async (_req, res) => {
  try {
    const list = await Postcard.find({ status: 'approved' }).sort({ createdAt: -1 }).limit(60);
    res.json(list.map(serialize));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load postcards' });
  }
});

/** Open Graph HTML — used by social crawlers (and as a redirect for humans). */
router.get('/:id/share', async (req, res) => {
  try {
    const doc = await findApproved(req.params.id);
    if (!doc) return res.status(404).type('html').send('<!doctype html><title>Not found</title><p>Postcard not found.</p>');
    res
      .status(200)
      .type('html')
      .set('Cache-Control', 'public, max-age=300')
      .send(shareHtml(req, doc));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load share page' });
  }
});

/** 1200×630 postcard preview image for WhatsApp / Facebook / X. */
async function sendOgImage(req, res) {
  try {
    const doc = await findApproved(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Postcard not found' });
    const jpg = await renderPostcardOgImage(serialize(doc), {
      origin: absoluteUrl(req, '/').replace(/\/$/, ''),
    });
    res
      .status(200)
      .type('jpeg')
      .set('Cache-Control', 'public, max-age=3600')
      .send(jpg);
  } catch (err) {
    console.error('postcard og image failed:', err);
    res.status(500).json({ error: err.message || 'Failed to render preview' });
  }
}

router.get('/:id/og.jpg', sendOgImage);
router.get('/:id/og.png', sendOgImage);

/** Single approved postcard. */
router.get('/:id', async (req, res) => {
  try {
    const doc = await findApproved(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Postcard not found' });
    res.json(serialize(doc));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load postcard' });
  }
});

/**
 * Guest submission — multipart.
 * Style (layout + font) is auto-assigned uniquely per new story.
 */
router.post(
  '/',
  upload.fields([
    { name: 'media', maxCount: 8 },
    { name: 'avatar', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const name = String(req.body.name || '').trim();
      const from = String(req.body.from || '').trim();
      const text = String(req.body.text || '').trim();
      const avatarMode = String(req.body.avatarMode || '').trim();
      const gender = String(req.body.gender || '').trim();
      const characterId = String(req.body.characterId || '').trim();
      const characterEmoji = String(req.body.characterEmoji || '').trim();

      if (!name || name.length < 2) {
        return res.status(400).json({ error: 'Please share your name' });
      }
      if (!text || text.length < 20) {
        return res.status(400).json({ error: 'Write a little more — at least a short postcard note' });
      }
      if (avatarMode !== 'photo' && avatarMode !== 'character') {
        return res.status(400).json({ error: 'Choose a face photo or a character' });
      }

      const mediaFiles = req.files?.media || [];
      if (!mediaFiles.length) {
        return res.status(400).json({ error: 'Add at least one photo or video for your postcard' });
      }

      const media = mediaFiles.map((f) => ({
        url: publicUrl(req, f.filename),
        type: f.mimetype.startsWith('video/') ? 'video' : 'image',
      }));

      let avatarUrl = '';
      if (avatarMode === 'photo') {
        const avatarFile = req.files?.avatar?.[0];
        if (!avatarFile || !avatarFile.mimetype.startsWith('image/')) {
          return res.status(400).json({ error: 'Upload a clear photo of yourself, or pick a character' });
        }
        avatarUrl = publicUrl(req, avatarFile.filename);
      } else {
        if (!gender || !['male', 'female'].includes(gender)) {
          return res.status(400).json({ error: 'Select male or female characters' });
        }
        if (!characterId || !characterEmoji) {
          return res.status(400).json({ error: 'Pick a character for your postcard stamp' });
        }
      }

      const seq = await Postcard.countDocuments();
      const { layout, handFont } = styleForIndex(seq);

      const doc = await Postcard.create({
        name,
        from,
        text,
        media,
        avatarMode,
        avatarUrl,
        gender: avatarMode === 'character' ? gender : '',
        characterId: avatarMode === 'character' ? characterId : '',
        characterEmoji: avatarMode === 'character' ? characterEmoji : '',
        handFont,
        layout,
        status: 'pending',
      });

      res.status(201).json({
        ok: true,
        message:
          'Your postcard is on its way to the hills. Our curators will stamp it soon — once approved, it will appear on this wall.',
        id: String(doc._id),
      });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Could not submit postcard' });
    }
  }
);

export default router;
