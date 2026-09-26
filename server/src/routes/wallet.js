import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getWalletSummary } from '../services/wallet.js';
import { BOOKING_REWARD, MAX_REDEEM_PER_BOOKING, WELCOME_BONUS } from '../config/wallet.js';

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
        maxRedeemPerBooking: MAX_REDEEM_PER_BOOKING,
      },
    });
  } catch (err) {
    console.error('wallet read failed', err);
    res.status(500).json({ error: 'Could not load the wallet.' });
  }
});

export default router;
