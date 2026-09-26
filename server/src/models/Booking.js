import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    stayId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stay', required: true },
    stayTitle: { type: String, required: true },
    nights: { type: Number, required: true, min: 1 },
    guests: { type: Number, required: true, min: 1 },
    adults: { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0, min: 0 },
    rooms: { type: Number, default: 1, min: 1 },
    bookingMode: {
      type: String,
      enum: ['room', 'entire'],
      default: 'entire',
    },
    extraMattress: { type: Boolean, default: false },
    pricePerNight: { type: Number, required: true, min: 0 },
    pricePerRoom: { type: Number, default: 0, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    coinsRedeemed: { type: Number, default: 0, min: 0 },
    coinsEarned: { type: Number, default: 0, min: 0 },
    amountPayable: { type: Number, required: true, min: 0 },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'rejected', 'cancelled', 'completed'],
      default: 'requested',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    adminNote: { type: String, default: '', trim: true },
    statusNote: { type: String, default: '', trim: true },
    arrivedAt: { type: Date },
    coinsRefunded: { type: Boolean, default: false },
    rewardGranted: { type: Boolean, default: false },
    remindersSent: {
      h48: { type: Date },
      h24: { type: Date },
      h12: { type: Date },
    },
    lastManualReminderAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Booking', bookingSchema);
