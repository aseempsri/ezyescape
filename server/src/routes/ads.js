import { Router } from 'express';
import Ad from '../models/Ad.js';
import { requireAdmin } from '../middleware/admin.js';
import { AD_SECTIONS, AD_SITE, allSlotIds, slotMeta } from '../data/adSlots.js';

const router = Router();

function serializeAd(doc) {
  const meta = slotMeta(doc.adId) || {};
  const mediaItems = Array.isArray(doc.mediaItems) ? doc.mediaItems : [];
  const first = mediaItems[0];
  return {
    id: String(doc._id),
    adId: doc.adId,
    site: doc.site,
    enabled: Boolean(doc.enabled),
    mediaItems,
    mediaType: first?.mediaType || doc.mediaType || '',
    mediaUrl: first?.mediaUrl || doc.mediaUrl || '',
    linkUrl: doc.linkUrl || '',
    altText: doc.altText || '',
    orientation: meta.orientation || 'horizontal',
    label: meta.label || doc.adId,
    hint: meta.hint || '',
    sectionId: meta.sectionId || '',
    sectionTitle: meta.sectionTitle || '',
    updatedAt: doc.updatedAt,
  };
}

async function ensureSlots(site = AD_SITE) {
  const ids = allSlotIds();
  const existing = await Ad.find({ site }).select('adId');
  const have = new Set(existing.map((d) => d.adId));
  const missing = ids.filter((id) => !have.has(id));
  if (missing.length) {
    await Ad.insertMany(
      missing.map((adId) => ({
        adId,
        site,
        enabled: false,
        mediaItems: [],
        mediaType: '',
        mediaUrl: '',
        linkUrl: '',
        altText: '',
      }))
    );
  }
}

function syncLegacyMedia(doc) {
  const first = doc.mediaItems?.[0];
  doc.mediaType = first?.mediaType || '';
  doc.mediaUrl = first?.mediaUrl || '';
}

function mediaKindFromUrl(url, mime) {
  if (mime?.startsWith('video/')) return 'video';
  if (mime?.startsWith('image/')) return 'image';
  if (/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url)) return 'video';
  return 'image';
}

function normalizeLink(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `https://${raw}`;
}

// ─── Public ───────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const site = String(req.query.site || AD_SITE).trim() || AD_SITE;
    await ensureSlots(site);
    const ads = await Ad.find({ site }).sort({ adId: 1 });
    res.json({
      site,
      sections: AD_SECTIONS,
      ads: ads.map(serializeAd),
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load ads' });
  }
});

router.get('/:adId', async (req, res) => {
  try {
    const site = String(req.query.site || AD_SITE).trim() || AD_SITE;
    await ensureSlots(site);
    const ad = await Ad.findOne({ adId: req.params.adId, site });
    if (!ad) return res.status(404).json({ error: 'Ad slot not found' });
    res.json(serializeAd(ad));
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load ad' });
  }
});

// ─── Admin (cookie auth) ──────────────────────────────────
router.use(requireAdmin);

router.put('/:adId', async (req, res) => {
  try {
    const site = String(req.query.site || req.body?.site || AD_SITE).trim() || AD_SITE;
    if (!allSlotIds().includes(req.params.adId)) {
      return res.status(400).json({ error: 'Unknown ad slot' });
    }
    await ensureSlots(site);
    const ad = await Ad.findOne({ adId: req.params.adId, site });
    if (!ad) return res.status(404).json({ error: 'Ad slot not found' });

    if (typeof req.body.enabled === 'boolean') ad.enabled = req.body.enabled;
    if (req.body.linkUrl !== undefined) ad.linkUrl = normalizeLink(req.body.linkUrl);
    if (req.body.altText !== undefined) ad.altText = String(req.body.altText || '').trim();

    // Optional append media via JSON { mediaUrl, mediaType }
    if (req.body.mediaUrl) {
      const mediaType = mediaKindFromUrl(req.body.mediaUrl, req.body.mediaType);
      ad.mediaItems.push({ mediaType, mediaUrl: String(req.body.mediaUrl).trim() });
    }

    syncLegacyMedia(ad);
    await ad.save();
    res.json(serializeAd(ad));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update ad' });
  }
});

router.post('/:adId/media', async (req, res) => {
  try {
    const site = String(req.query.site || req.body?.site || AD_SITE).trim() || AD_SITE;
    await ensureSlots(site);
    const ad = await Ad.findOne({ adId: req.params.adId, site });
    if (!ad) return res.status(404).json({ error: 'Ad slot not found' });

    const items = Array.isArray(req.body?.items) ? req.body.items : [req.body];
    for (const item of items) {
      const url = String(item?.mediaUrl || item?.url || '').trim();
      if (!url) continue;
      ad.mediaItems.push({
        mediaType: mediaKindFromUrl(url, item?.mediaType || item?.type),
        mediaUrl: url,
      });
    }
    syncLegacyMedia(ad);
    await ad.save();
    res.json(serializeAd(ad));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to add media' });
  }
});

router.delete('/:adId/media/:index', async (req, res) => {
  try {
    const site = String(req.query.site || AD_SITE).trim() || AD_SITE;
    const ad = await Ad.findOne({ adId: req.params.adId, site });
    if (!ad) return res.status(404).json({ error: 'Ad slot not found' });
    const idx = Number(req.params.index);
    if (!Number.isInteger(idx) || idx < 0 || idx >= ad.mediaItems.length) {
      return res.status(400).json({ error: 'Invalid media index' });
    }
    ad.mediaItems.splice(idx, 1);
    syncLegacyMedia(ad);
    await ad.save();
    res.json(serializeAd(ad));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to remove media' });
  }
});

router.delete('/:adId/media', async (req, res) => {
  try {
    const site = String(req.query.site || AD_SITE).trim() || AD_SITE;
    const ad = await Ad.findOne({ adId: req.params.adId, site });
    if (!ad) return res.status(404).json({ error: 'Ad slot not found' });
    ad.mediaItems = [];
    syncLegacyMedia(ad);
    await ad.save();
    res.json(serializeAd(ad));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to clear media' });
  }
});

/** Soft-reset a slot (disable + clear media) — used after delete password confirm. */
router.delete('/:adId', async (req, res) => {
  try {
    const site = String(req.query.site || AD_SITE).trim() || AD_SITE;
    const ad = await Ad.findOne({ adId: req.params.adId, site });
    if (!ad) return res.status(404).json({ error: 'Ad slot not found' });
    ad.enabled = false;
    ad.mediaItems = [];
    ad.linkUrl = '';
    ad.altText = '';
    syncLegacyMedia(ad);
    await ad.save();
    res.json(serializeAd(ad));
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to reset ad' });
  }
});

export default router;
