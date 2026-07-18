import { Router } from 'express';
import mongoose from 'mongoose';
import Stay from '../models/Stay.js';
import { serializeStay } from '../utils/stayPricing.js';

const router = Router();

// Public: list active stays for the marketing site.
router.get('/', async (_req, res) => {
  const stays = await Stay.find({ active: true }).sort({ createdAt: 1 });
  res.json(stays.map(serializeStay));
});

// Public: single stay by Mongo id or slug.
router.get('/:idOrSlug', async (req, res) => {
  const { idOrSlug } = req.params;
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }], active: true }
    : { slug: idOrSlug, active: true };

  const stay = await Stay.findOne(query);
  if (!stay) return res.status(404).json({ error: 'Stay not found' });
  res.json(serializeStay(stay));
});

export default router;
