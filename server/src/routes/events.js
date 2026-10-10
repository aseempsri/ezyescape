import { Router } from 'express';
import Event from '../models/Event.js';
import {
  effectiveEventStatus,
  formatPastDateLabel,
  startOfTodayUtc,
  syncEventStatusesFromDates,
} from '../utils/eventSchedule.js';

const router = Router();

export function serializeEvent(doc) {
  const images = Array.isArray(doc.images) ? doc.images.filter(Boolean) : [];
  const status = effectiveEventStatus(doc);
  const dateLabel =
    status === 'past' ? formatPastDateLabel(doc) : (doc.dateLabel || formatPastDateLabel(doc) || '');
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

/** Public list — startDate drives Upcoming vs Past (status is synced to match). */
router.get('/', async (req, res) => {
  const status = String(req.query.status || '').trim();
  const filter = { active: true };
  const today = startOfTodayUtc();

  await syncEventStatusesFromDates();

  if (status === 'upcoming') {
    const list = await Event.find({
      ...filter,
      $or: [
        { startDate: { $gte: today } },
        { startDate: null, status: { $in: ['live', 'upcoming'] } },
      ],
    }).sort({ startDate: 1, createdAt: -1 });
    return res.json(list.map(serializeEvent));
  }

  if (status === 'past') {
    const list = await Event.find({
      ...filter,
      $or: [
        { startDate: { $ne: null, $lt: today } },
        { startDate: null, status: 'past' },
      ],
    }).sort({ startDate: -1, createdAt: -1 });
    return res.json(list.map(serializeEvent));
  }

  const list = await Event.find(filter).sort({ startDate: -1, createdAt: -1 });
  res.json(list.map(serializeEvent));
});

router.get('/:idOrSlug', async (req, res) => {
  await syncEventStatusesFromDates();
  const doc = await findActiveEvent(req.params.idOrSlug);
  if (!doc) return res.status(404).json({ error: 'Event not found' });
  res.json(serializeEvent(doc));
});

export default router;
