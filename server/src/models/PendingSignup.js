import mongoose from 'mongoose';

// Holds a not-yet-confirmed email signup. The real User document is only created
// once the emailed OTP is verified — so unconfirmed details never land in `users`.
// Stale entries are auto-removed by the TTL index on `expiresAt`.
const pendingSignupSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    mobile: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    otpHash: { type: String, required: true },
    otpExpires: { type: Date, required: true },
    otpAttempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('PendingSignup', pendingSignupSchema);
