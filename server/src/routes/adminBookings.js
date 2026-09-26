import { Router } from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Stay from '../models/Stay.js';
import { BOOKING_REWARD } from '../config/wallet.js';
import { creditBookingReward, refundRedeemedCoins } from '../services/wallet.js';
import {
  sendBookingAdminMessage,
  sendBookingReminder,
  sendBookingStatusMail,
  sendStayThankYou,
} from '../services/bookingMail.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

function refOf(id) {
  return String(id || '').slice(-6).toUpperCase();
}

function serialize(booking, user) {
  return {
    id: booking._id,
    ref: refOf(booking._id),
    stayId: booking.stayId,
    stayTitle: booking.stayTitle,
    nights: booking.nights,
    guests: booking.guests,
    adults: booking.adults,
    children: booking.children,
    rooms: booking.rooms,
    bookingMode: booking.bookingMode,
    extraMattress: booking.extraMattress,
    pricePerNight: booking.pricePerNight,
    subtotal: booking.subtotal,
    coinsRedeemed: booking.coinsRedeemed,
    coinsEarned: booking.coinsEarned,
    amountPayable: booking.amountPayable,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    status: booking.status || 'confirmed',
    paymentStatus: booking.paymentStatus || 'unpaid',
    adminNote: booking.adminNote || '',
    statusNote: booking.statusNote || '',
    arrivedAt: booking.arrivedAt || null,
    rewardGranted: Boolean(booking.rewardGranted),
    remindersSent: booking.remindersSent || {},
    lastManualReminderAt: booking.lastManualReminderAt || null,
    createdAt: booking.createdAt,
    guest: {
      id: user?._id || booking.userId,
      name: user?.name || '',
      email: user?.email || '',
      mobile: user?.mobile || '',
    },
  };
}

async function loadBooking(id) {
  const booking = await Booking.findById(id);
  if (!booking) return null;
  const user = await User.findById(booking.userId).select('name email mobile');
  const stay = await Stay.findById(booking.stayId);
  return { booking, user, stay };
}

router.get('/', async (req, res) => {
  const status = String(req.query.status || 'all');
  const q = String(req.query.q || '').trim().toLowerCase();
  const bookings = await Booking.find({}).sort({ checkIn: 1, createdAt: -1 }).limit(400);
  const userIds = [...new Set(bookings.map((b) => String(b.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).select('name email mobile');
  const byId = new Map(users.map((u) => [String(u._id), u]));

  const all = bookings.map((b) => serialize(b, byId.get(String(b.userId))));
  let rows = status === 'all' ? all : all.filter((b) => b.status === status);
  if (q) {
    rows = rows.filter((row) => {
      const hay = [
        row.ref,
        row.stayTitle,
        row.guest.name,
        row.guest.email,
        row.guest.mobile,
      ].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }

  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const week = new Date(start);
  week.setDate(week.getDate() + 7);

  const active = all.filter((b) => b.status === 'confirmed' || b.status === 'requested');
  const inHouse = all.filter((b) => b.status === 'confirmed' && new Date(b.checkIn) <= now && new Date(b.checkOut) > now);

  res.json({
    bookings: rows,
    summary: {
      requested: all.filter((b) => b.status === 'requested').length,
      confirmed: all.filter((b) => b.status === 'confirmed').length,
      arrivingToday: all.filter((b) => b.status === 'confirmed' && new Date(b.checkIn) >= start && new Date(b.checkIn) < end).length,
      inHouseGuests: inHouse.reduce((n, b) => n + (b.guests || 0), 0),
      upcomingGuests: active
        .filter((b) => new Date(b.checkIn) >= start && new Date(b.checkIn) < week)
        .reduce((n, b) => n + (b.guests || 0), 0),
      unpaid: all.filter((b) => (b.status === 'confirmed' || b.status === 'requested') && b.paymentStatus !== 'paid').length,
    },
  });
});

router.patch('/:id', async (req, res) => {
  try {
    const loaded = await loadBooking(req.params.id);
    if (!loaded) return res.status(404).json({ error: 'Booking not found' });
    const { booking, user, stay } = loaded;
    const next = String(req.body.status || '').trim();
    const note = String(req.body.statusNote || req.body.note || '').trim();

    if (req.body.adminNote !== undefined) {
      booking.adminNote = String(req.body.adminNote || '').slice(0, 2000);
    }
    if (req.body.paymentStatus === 'paid' || req.body.paymentStatus === 'unpaid') {
      booking.paymentStatus = req.body.paymentStatus;
    }
    if (req.body.arrived === true && !booking.arrivedAt) {
      booking.arrivedAt = new Date();
    }
    if (req.body.arrived === false) {
      booking.arrivedAt = undefined;
    }

    let thankYou = null;
    if (next && next !== booking.status) {
      const from = booking.status;
      const allowed = {
        requested: ['confirmed', 'rejected', 'cancelled'],
        confirmed: ['cancelled', 'completed'],
        rejected: [],
        cancelled: [],
        completed: [],
      };
      if (!(allowed[from] || []).includes(next)) {
        return res.status(400).json({ error: `Cannot move a ${from} booking to ${next}.` });
      }

      const grantReward = next === 'confirmed' && !booking.rewardGranted;
      const refundCoins = (next === 'rejected' || next === 'cancelled') && booking.coinsRedeemed > 0 && !booking.coinsRefunded;
      if (grantReward) {
        booking.rewardGranted = true;
        booking.coinsEarned = BOOKING_REWARD;
      }
      if (refundCoins) booking.coinsRefunded = true;

      booking.status = next;
      if (note) booking.statusNote = note;
      await booking.save();

      if (grantReward) {
        try {
          await creditBookingReward(booking.userId, booking._id);
        } catch (err) {
          booking.rewardGranted = false;
          booking.coinsEarned = 0;
          await booking.save();
          throw err;
        }
      }
      if (refundCoins) {
        try {
          await refundRedeemedCoins(booking.userId, booking.coinsRedeemed, booking._id);
        } catch (err) {
          booking.coinsRefunded = false;
          await booking.save();
          throw err;
        }
      }

      try {
        if (next === 'confirmed' || next === 'rejected' || next === 'cancelled') {
          await sendBookingStatusMail({ user, stay, booking, status: next, note });
        }
        if (next === 'completed') {
          const result = await sendStayThankYou({ user, stay, booking });
          thankYou = result.sent ? 'sent' : 'no-email';
        }
      } catch (mailErr) {
        console.error('status email failed', mailErr.message);
        if (next === 'completed') thankYou = 'failed';
      }
    } else {
      await booking.save();
    }

    const freshUser = await User.findById(booking.userId).select('name email mobile');
    res.json({ ...serialize(booking, freshUser), thankYou });
  } catch (err) {
    console.error('admin booking update failed', err);
    res.status(400).json({ error: 'Could not update this booking.' });
  }
});

router.post('/:id/remind', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  key: (req) => `remind:${req.params.id}`,
}), async (req, res) => {
  try {
    const loaded = await loadBooking(req.params.id);
    if (!loaded) return res.status(404).json({ error: 'Booking not found' });
    const { booking, user, stay } = loaded;
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: 'Reminders go out only for confirmed stays.' });
    }
    await sendBookingReminder({ user, stay, booking, whenLabel: 'coming up' });
    booking.lastManualReminderAt = new Date();
    await booking.save();
    res.json(serialize(booking, user));
  } catch (err) {
    const known = err.message === 'This guest has no email address.' || err.message === 'Reminders go out only for confirmed stays.';
    res.status(400).json({ error: known ? err.message : 'Could not send the reminder.' });
  }
});

router.post('/:id/email', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  key: (req) => `admin-mail:${req.ip}`,
}), async (req, res) => {
  try {
    const loaded = await loadBooking(req.params.id);
    if (!loaded) return res.status(404).json({ error: 'Booking not found' });
    const subject = String(req.body.subject || '').replace(/[\r\n]/g, ' ').trim().slice(0, 150);
    const message = String(req.body.message || '').trim().slice(0, 5000);
    if (!subject || !message) return res.status(400).json({ error: 'Subject and message are required.' });
    await sendBookingAdminMessage({
      user: loaded.user,
      booking: loaded.booking,
      subject,
      message,
    });
    res.json({ ok: true });
  } catch (err) {
    const known = err.message === 'This guest has no email address.';
    res.status(400).json({ error: known ? err.message : 'Could not send the email.' });
  }
});

export default router;
