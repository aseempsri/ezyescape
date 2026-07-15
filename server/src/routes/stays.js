import { Router } from 'express';
import Stay from '../models/Stay.js';
import { serializeStay } from '../utils/stayPricing.js';

const router = Router();

// Public: list active stays for the marketing site.
router.get('/', async (_req, res) => {
  const stays = await Stay.find({ active: true }).sort({ createdAt: 1 });
  res.json(stays.map(serializeStay));
});

export default router;
