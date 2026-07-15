import { Router } from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Stay from '../models/Stay.js';
import { requireAuth } from '../middleware/auth.js';
import { computeFinalPrice } from '../utils/stayPricing.js';
import { creditBookingReward, redeemCoins, syncCoins } from '../services/wallet.js';
import { BOOKING_REWARD } from '../config/wallet.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json(bookings);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { stayId, nights, guests, checkIn, coinsToRedeem = 0 } = req.body;

    const stay = await Stay.findById(stayId);
    if (!stay || !stay.active) {
      return res.status(400).json({ error: 'Invalid stay' });
    }
    const pricePerNight = computeFinalPrice(stay);

    const numNights = Math.max(1, Number(nights) || 1);
    const numGuests = Math.max(1, Number(guests) || 1);
    const checkInDate = new Date(checkIn);
    if (Number.isNaN(checkInDate.getTime())) {
      return res.status(400).json({ error: 'Invalid check-in date' });
    }

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + numNights);

    const subtotal = pricePerNight * numNights;

    // Remove any expired coins before offering them for redemption.
    await syncCoins(req.user.sub);
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const maxRedeemable = Math.min(user.ezyCoins, subtotal);
    const redeemAmount = Math.min(Math.max(0, Number(coinsToRedeem) || 0), maxRedeemable);
    const amountPayable = subtotal - redeemAmount;

    const booking = await Booking.create({
      userId: user._id,
      stayId: stay._id,
      stayTitle: stay.title,
      nights: numNights,
      guests: numGuests,
      pricePerNight,
      subtotal,
      coinsRedeemed: redeemAmount,
      coinsEarned: BOOKING_REWARD,
      amountPayable,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    if (redeemAmount > 0) {
      await redeemCoins(user._id, redeemAmount, booking._id);
    }

    const { balance } = await creditBookingReward(user._id, booking._id);
    const updatedUser = await User.findById(user._id).select('ezyCoins');

    res.status(201).json({
      booking,
      wallet: {
        ezyCoins: updatedUser.ezyCoins,
        coinsRedeemed: redeemAmount,
        coinsEarned: BOOKING_REWARD,
        amountPayable,
        balanceAfter: balance,
      },
    });
  } catch (err) {
    if (err.message === 'Insufficient ezy coins') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
