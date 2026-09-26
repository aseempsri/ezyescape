import { randomBytes } from 'crypto';
import Stay from '../models/Stay.js';
import Booking from '../models/Booking.js';

const HOLDING = ['requested', 'confirmed', 'completed'];

function istDayUtc(date) {
  const [year, month, day] = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(date)).split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function roomsHeldOnNight(bookings, stayRooms, nightUtc) {
  let used = 0;
  for (const booking of bookings) {
    const start = istDayUtc(booking.checkIn);
    const end = istDayUtc(booking.checkOut);
    if (nightUtc < start || nightUtc >= end) continue;
    used += booking.bookingMode === 'entire'
      ? stayRooms
      : Math.max(1, Number(booking.rooms) || 1);
  }
  return used;
}

/** Reject when the home, or the rooms inside it, are already taken on any night. */
export async function assertStayAvailable({ stay, checkIn, checkOut, mode, roomsNeeded }) {
  const stayRooms = Math.max(1, Number(stay.rooms) || 1);
  const need = mode === 'entire' ? stayRooms : Math.max(1, Number(roomsNeeded) || 1);
  const holding = await Booking.find({
    stayId: stay._id,
    status: { $in: HOLDING },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  }).select('checkIn checkOut rooms bookingMode');

  const start = istDayUtc(checkIn);
  const end = istDayUtc(checkOut);
  for (let night = start; night < end; night += 86400000) {
    if (roomsHeldOnNight(holding, stayRooms, night) + need > stayRooms) {
      const err = new Error('Those dates are already booked for this home. Please choose different dates.');
      err.status = 409;
      throw err;
    }
  }
}

/** One booking at a time per home, so two guests cannot take the same night together. */
export async function withStayLock(stayId, fn) {
  const token = randomBytes(8).toString('hex');
  const deadline = Date.now() + 8000;
  let claimed = false;

  while (Date.now() < deadline) {
    const got = await Stay.findOneAndUpdate(
      {
        _id: stayId,
        $or: [
          { bookingLockUntil: null },
          { bookingLockUntil: { $lte: new Date() } },
        ],
      },
      { $set: { bookingLock: token, bookingLockUntil: new Date(Date.now() + 20000) } },
      { new: true }
    );
    if (got?.bookingLock === token) {
      claimed = true;
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  if (!claimed) {
    const err = new Error('This home is being booked right now. Please try again in a moment.');
    err.status = 409;
    throw err;
  }

  try {
    return await fn();
  } finally {
    await Stay.updateOne(
      { _id: stayId, bookingLock: token },
      { $set: { bookingLock: null, bookingLockUntil: null } }
    );
  }
}
