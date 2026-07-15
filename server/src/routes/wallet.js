import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getWalletSummary } from '../services/wallet.js';
import { BOOKING_REWARD, WELCOME_BONUS } from '../config/wallet.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const wallet = await getWalletSummary(req.user.sub);
    res.json({
      ...wallet,
      rules: {
        coinValueInr: 1,
        welcomeBonus: WELCOME_BONUS,
        bookingReward: BOOKING_REWARD,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
