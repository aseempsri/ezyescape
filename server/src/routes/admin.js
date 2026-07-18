import { Router } from 'express';
import Stay from '../models/Stay.js';
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

export default router;
