import mongoose from 'mongoose';

// A CoinLot is a batch of ezy coins earned at a point in time, with its own
// expiry date. Redemptions consume lots in expiry order (FIFO), and any lot
// past its expiry date is swept and removed from the user's balance.
const coinLotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    remaining: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: ['welcome_bonus', 'booking_reward'],
      required: true,
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    expiresAt: { type: Date, required: true, index: true },
    expired: { type: Boolean, default: false },
    // Tracks which expiry reminder emails have already gone out for this lot,
    // keyed by days-before-expiry (3, 2, and 0 = day of expiration).
    remindersSent: {
      threeDay: { type: Boolean, default: false },
      twoDay: { type: Boolean, default: false },
      dayOf: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model('CoinLot', coinLotSchema);
