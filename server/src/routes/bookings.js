import { Router } from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Stay from '../models/Stay.js';
import { requireAuth } from '../middleware/auth.js';
import { computeFinalPrice } from '../utils/stayPricing.js';
import { redeemCoins, syncCoins } from '../services/wallet.js';
import { BOOKING_REWARD, MAX_REDEEM_PER_BOOKING } from '../config/wallet.js';
import { sendBookingRequest } from '../services/bookingMail.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { assertStayAvailable, withStayLock } from '../services/availability.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.sub })
    .sort({ createdAt: -1 })
    .select('-__v');
  res.json(bookings);
});

router.post('/', requireAuth, rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  key: (req) => `book:${req.user.sub}`,
}), async (req, res) => {
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

    const numNights = Math.min(30, Math.max(1, Number(nights) || 1));
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
    const todayParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    const earliest = new Date(`${todayParts}T00:00:00+05:30`);
    const latest = new Date(earliest);
    latest.setMonth(latest.getMonth() + 18);
    if (checkInDate < earliest || checkInDate > latest) {
      return res.status(400).json({ error: 'Choose a check-in date from today through the next 18 months.' });
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
    let booking;
    const amountPayable = subtotal - redeemAmount;

    await withStayLock(stay._id, async () => {
      await assertStayAvailable({
        stay,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        mode,
        roomsNeeded: numRooms,
      });

      booking = await Booking.create({
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
        coinsEarned: 0,
        amountPayable,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'requested',
        paymentStatus: 'unpaid',
      });

      if (redeemAmount > 0) {
        try {
          await redeemCoins(user._id, redeemAmount, booking._id);
        } catch (err) {
          await Booking.deleteOne({ _id: booking._id });
          booking = undefined;
          throw err;
        }
      }
    });

    const updatedUser = await User.findById(user._id).select('ezyCoins');

    try {
      await sendBookingRequest({ user, stay, booking });
    } catch (mailErr) {
      console.error('booking request email failed', mailErr.message);
    }

    res.status(201).json({
      booking,
      wallet: {
        ezyCoins: updatedUser.ezyCoins,
        coinsRedeemed: redeemAmount,
        coinsEarned: 0,
        amountPayable,
        balanceAfter: updatedUser.ezyCoins,
      },
    });
  } catch (err) {
    if (err.status === 409 || err.message === 'Insufficient ezy coins') {
      return res.status(err.status || 400).json({ error: err.message });
    }
    console.error('booking create failed', err);
    res.status(500).json({ error: 'Could not complete the booking.' });
  }
});

export default router;
