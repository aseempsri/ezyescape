import { Router } from 'express';
import Event from '../models/Event.js';
import {
  effectiveEventStatus,
  formatPastDateLabel,
  promoteExpiredEvents,
  startOfTodayUtc,
} from '../utils/eventSchedule.js';

const router = Router();

export function serializeEvent(doc) {
  const images = Array.isArray(doc.images) ? doc.images.filter(Boolean) : [];
  const status = effectiveEventStatus(doc);
  const dateLabel =
    status === 'past' ? formatPastDateLabel(doc) : (doc.dateLabel || '');
  return {
    id: String(doc._id),
    title: doc.title,
    slug: doc.slug || '',
    status,
    tag: doc.tag || '',
    place: doc.place || '',
    spots: doc.spots || '',
    month: doc.month || '',
    day: doc.day || '',
    dateLabel,
    startDate: doc.startDate || null,
    desc: doc.desc || '',
    details: doc.details || '',
    instructions: doc.instructions || '',
    guidelines: doc.guidelines || '',
    pricing: doc.pricing || '',
    locationDetails: doc.locationDetails || '',
    images,
    img: images[0] || '',
    waMessage: doc.waMessage || '',
    emoji: doc.emoji || '',
    active: doc.active !== false,
    adEnabled: !!doc.adEnabled,
    adMediaUrl: doc.adMediaUrl || '',
    adMediaType: doc.adMediaType === 'video' ? 'video' : 'image',
    adLinkUrl: doc.adLinkUrl || '',
    adAltText: doc.adAltText || '',
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findActiveEvent(idOrSlug) {
  const raw = String(idOrSlug || '').trim();
  if (!raw) return null;
  if (/^[a-f\d]{24}$/i.test(raw)) {
    const byId = await Event.findOne({ _id: raw, active: true });
    if (byId) return byId;
  }
  return Event.findOne({ slug: raw, active: true });
}

/** Public list — date-aware: expired startDates leave Upcoming and join Past. */
router.get('/', async (req, res) => {
  const status = String(req.query.status || '').trim();
  const filter = { active: true };
  const today = startOfTodayUtc();

  await promoteExpiredEvents();

  if (status === 'upcoming') {
    const list = await Event.find({
      ...filter,
      status: { $in: ['live', 'upcoming'] },
      $or: [{ startDate: null }, { startDate: { $gte: today } }],
    }).sort({ createdAt: -1 });
    return res.json(list.map(serializeEvent));
  }

  if (status === 'past') {
    const list = await Event.find({
      ...filter,
      $or: [
        { status: 'past' },
        {
          status: { $in: ['live', 'upcoming'] },
          startDate: { $ne: null, $lt: today },
        },
      ],
    }).sort({ startDate: -1, createdAt: -1 });
    return res.json(list.map(serializeEvent));
  }

  const list = await Event.find(filter).sort({ createdAt: -1 });
  res.json(list.map(serializeEvent));
});

router.get('/:idOrSlug', async (req, res) => {
  await promoteExpiredEvents();
  const doc = await findActiveEvent(req.params.idOrSlug);
  if (!doc) return res.status(404).json({ error: 'Event not found' });
  res.json(serializeEvent(doc));
});

export default router;
