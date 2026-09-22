import { Router } from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Stay from '../models/Stay.js';
import { requireAuth } from '../middleware/auth.js';
import { computeFinalPrice } from '../utils/stayPricing.js';
import { creditBookingReward, redeemCoins, syncCoins } from '../services/wallet.js';
import { BOOKING_REWARD, MAX_REDEEM_PER_BOOKING } from '../config/wallet.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json(bookings);
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      stayId,
      nights,
      guests,
      adults,
      children,
      checkIn,
      coinsToRedeem = 0,
      bookingMode = 'entire',
      rooms: roomsRequested,
      extraMattress = false,
    } = req.body;

    const stay = await Stay.findById(stayId);
    if (!stay || !stay.active) {
      return res.status(400).json({ error: 'Invalid stay' });
    }
    const entirePerNight = computeFinalPrice(stay);
    const stayRooms = Math.max(1, Number(stay.rooms) || 1);
    const perRoomRate = Math.max(1, Math.round(entirePerNight / stayRooms));
    const mode = bookingMode === 'room' ? 'room' : 'entire';

    const numNights = Math.max(1, Number(nights) || 1);
    const numRooms =
      mode === 'room'
        ? Math.min(stayRooms, Math.max(1, Number(roomsRequested) || 1))
        : stayRooms;

    const maxAdults = 2 * numRooms;
    const maxChildren = 1 * numRooms;
    const numAdults = Math.min(maxAdults, Math.max(1, Number(adults) || Number(guests) || 1));
    const numChildren = Math.min(maxChildren, Math.max(0, Number(children) || 0));
    const numGuests = numAdults + numChildren;

    if (numAdults > maxAdults) {
      return res.status(400).json({ error: `Max ${maxAdults} adults for ${numRooms} room(s)` });
    }
    if (numChildren > maxChildren) {
      return res.status(400).json({ error: `Max ${maxChildren} child(ren) for ${numRooms} room(s)` });
    }

    const checkInDate = new Date(checkIn);
    if (Number.isNaN(checkInDate.getTime())) {
      return res.status(400).json({ error: 'Invalid check-in date' });
    }

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + numNights);

    const pricePerNight = mode === 'room' ? perRoomRate * numRooms : entirePerNight;
    const subtotal = pricePerNight * numNights;

    // Remove any expired coins before offering them for redemption.
    await syncCoins(req.user.sub);
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const maxRedeemable = Math.min(user.ezyCoins, subtotal, MAX_REDEEM_PER_BOOKING);
    const redeemAmount = Math.min(Math.max(0, Number(coinsToRedeem) || 0), maxRedeemable);
    const amountPayable = subtotal - redeemAmount;

    const booking = await Booking.create({
      userId: user._id,
      stayId: stay._id,
      stayTitle: stay.title,
      nights: numNights,
      guests: numGuests,
      adults: numAdults,
      children: numChildren,
      rooms: numRooms,
      bookingMode: mode,
      extraMattress: !!extraMattress,
      pricePerNight,
      pricePerRoom: perRoomRate,
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
