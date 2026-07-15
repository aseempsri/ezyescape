import mongoose from 'mongoose';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    amount: { type: Number, required: true, min: 1 },
    reason: {
      type: String,
      enum: ['welcome_bonus', 'booking_reward', 'booking_redemption', 'expiry'],
      required: true,
    },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    balanceAfter: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('WalletTransaction', walletTransactionSchema);
