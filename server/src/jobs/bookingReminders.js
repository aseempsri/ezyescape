import cron from 'node-cron';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Stay from '../models/Stay.js';
import { sendBookingReminder } from '../services/bookingMail.js';

const SLOTS = [
  { key: 'h48', label: 'in 2 days', maxHours: 48, minHours: 24 },
  { key: 'h24', label: 'tomorrow', maxHours: 24, minHours: 12 },
  { key: 'h12', label: 'in about 12 hours', maxHours: 12, minHours: 0 },
];

function arrivalAt(checkIn) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(checkIn));
  return new Date(`${parts}T14:00:00+05:30`);
}

function dueSlot(hoursUntil, sent = {}) {
  if (hoursUntil <= 0 || hoursUntil > 48) return null;
  const slot = SLOTS.find((s) => hoursUntil <= s.maxHours && hoursUntil > s.minHours);
  if (!slot || sent[slot.key]) return null;
  return slot;
}

export async function runBookingReminders() {
  const now = Date.now();
  const horizon = new Date(now + 50 * 60 * 60 * 1000);
  const bookings = await Booking.find({
    status: 'confirmed',
    checkIn: { $gte: new Date(now - 24 * 60 * 60 * 1000), $lte: horizon },
  });

  let sent = 0;
  for (const booking of bookings) {
    const hoursUntil = (arrivalAt(booking.checkIn).getTime() - now) / 36e5;
    const slot = dueSlot(hoursUntil, booking.remindersSent || {});
    if (!slot) continue;
    const user = await User.findById(booking.userId).select('name email');
    const stay = await Stay.findById(booking.stayId);
    try {
      await sendBookingReminder({ user, stay, booking, whenLabel: slot.label });
      booking.remindersSent = { ...(booking.remindersSent || {}), [slot.key]: new Date() };
      booking.markModified('remindersSent');
      await booking.save();
      sent += 1;
    } catch (err) {
      console.error(`Booking reminder failed for ${booking._id}:`, err.message);
    }
  }
  return { sent };
}

export function scheduleBookingReminders() {
  cron.schedule('15 * * * *', async () => {
    try {
      const summary = await runBookingReminders();
      if (summary.sent > 0) console.log(`Stay reminders sent: ${summary.sent}`);
    } catch (err) {
      console.error('Booking reminder job failed:', err.message);
    }
  });
  console.log('Stay reminder job scheduled (hourly, 2 days / 1 day / 12 hours before check-in)');
}
