import { Router } from 'express';
import Stay from '../models/Stay.js';
import Postcard from '../models/Postcard.js';
import { serializeStay } from '../utils/stayPricing.js';
import { adminCookieOptions, requireAdmin, signAdminToken } from '../middleware/admin.js';
import { upload } from '../config/upload.js';

const router = Router();

router.post('/login', (req, res) => {
  const { password } = req.body || {};
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD is not configured on the server' });
  }
  if (!password || password !== expected) {
    return res.status(401).json({ error: 'Incorrect password' });
  }

  const token = signAdminToken(process.env.JWT_SECRET);
  res.cookie('ezyescape_admin', token, adminCookieOptions());
  res.json({ ok: true });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('ezyescape_admin', adminCookieOptions());
  res.json({ ok: true });
});

router.get('/session', requireAdmin, (_req, res) => {
  res.json({ admin: true });
});

// All routes below require admin auth.
router.use(requireAdmin);

// Upload an image or video from the admin's desktop. Returns a public URL.
router.post('/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url, type: req.file.mimetype });
  });
});

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseStayBody(body) {
  const toArray = (v) =>
    (Array.isArray(v) ? v : String(v || '').split('\n'))
      .map((s) => String(s).trim())
      .filter(Boolean);

  const title = body.title?.trim();
  const slugInput = body.slug?.trim();

  return {
    title,
    slug: slugify(slugInput || title),
    location: body.location?.trim(),
    cat: body.cat?.trim() || '',
    best: body.best?.trim() || '',
    guests: Math.max(1, Number(body.guests) || 1),
    rooms: Math.max(1, Number(body.rooms) || 1),
    price: Math.max(0, Number(body.price) || 0),
    discountType: ['none', 'percent', 'flat'].includes(body.discountType) ? body.discountType : 'none',
    discountValue: Math.max(0, Number(body.discountValue) || 0),
    description: body.description?.trim() || '',
    story: body.story?.trim() || '',
    hosts: body.hosts?.trim() || '',
    storyImage: body.storyImage?.trim() || '',
    hostImage: body.hostImage?.trim() || '',
    directions: body.directions?.trim() || '',
    highlights: toArray(body.highlights),
    images: toArray(body.images),
    videos: toArray(body.videos),
    active: body.active !== false,
  };
}

router.get('/stays', async (_req, res) => {
  const stays = await Stay.find().sort({ createdAt: 1 });
  res.json(stays.map(serializeStay));
});

router.post('/stays', async (req, res) => {
  try {
    const data = parseStayBody(req.body);
    if (!data.title || !data.location) {
      return res.status(400).json({ error: 'Title and location are required' });
    }
    const stay = await Stay.create(data);
    res.status(201).json(serializeStay(stay));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/stays/:id', async (req, res) => {
  try {
    const data = parseStayBody(req.body);
    if (!data.title || !data.location) {
      return res.status(400).json({ error: 'Title and location are required' });
    }
    const stay = await Stay.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!stay) return res.status(404).json({ error: 'Listing not found' });
    res.json(serializeStay(stay));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/stays/:id', async (req, res) => {
  const stay = await Stay.findByIdAndDelete(req.params.id);
  if (!stay) return res.status(404).json({ error: 'Listing not found' });
  res.json({ ok: true });
});

function serializePostcard(doc) {
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

router.get('/postcards/pending-count', async (_req, res) => {
  const count = await Postcard.countDocuments({ status: 'pending' });
  res.json({ count });
});

router.get('/postcards', async (req, res) => {
  const status = String(req.query.status || '').trim();
  const filter = status && ['pending', 'approved', 'rejected'].includes(status)
    ? { status }
    : {};
  const list = await Postcard.find(filter).sort({ createdAt: -1 });
  const pending = list.filter((p) => p.status === 'pending');
  const rest = list.filter((p) => p.status !== 'pending');
  const ordered = status ? list : [...pending, ...rest];
  res.json(ordered.map(serializePostcard));
});

router.post('/postcards/:id/approve', async (req, res) => {
  const doc = await Postcard.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Postcard not found' });
  res.json(serializePostcard(doc));
});

router.post('/postcards/:id/reject', async (req, res) => {
  const doc = await Postcard.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );
  if (!doc) return res.status(404).json({ error: 'Postcard not found' });
  res.json(serializePostcard(doc));
});

router.put('/postcards/:id', async (req, res) => {
  try {
    const doc = await Postcard.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Postcard not found' });

    const name = String(req.body.name ?? doc.name).trim();
    const from = String(req.body.from ?? doc.from ?? '').trim();
    const text = String(req.body.text ?? doc.text).trim();

    if (!name || name.length < 2) {
      return res.status(400).json({ error: 'Name is required' });
    }
    if (!text || text.length < 10) {
      return res.status(400).json({ error: 'Review text is too short' });
    }

    let media = doc.media || [];
    if (Array.isArray(req.body.media)) {
      media = req.body.media
        .map((m) => {
          if (!m || typeof m !== 'object') return null;
          const url = String(m.url || '').trim();
          if (!url) return null;
          const type = m.type === 'video' || /\.(mp4|webm|mov)(\?|$)/i.test(url) ? 'video' : 'image';
          return { url, type };
        })
        .filter(Boolean);
    }

    if (!media.length) {
      return res.status(400).json({ error: 'Add at least one image or video' });
    }

    doc.name = name;
    doc.from = from;
    doc.text = text;
    doc.media = media;
    await doc.save();
    res.json(serializePostcard(doc));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Update failed' });
  }
});

router.delete('/postcards/:id', async (req, res) => {
  const doc = await Postcard.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Postcard not found' });
  res.json({ ok: true });
});

export default router;
