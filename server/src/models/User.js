import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Optional now — only present for Google accounts. Sparse so many password
    // users (no googleId) don't collide on the unique index.
    googleId: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    avatar: { type: String },
    // Mobile number — collected during sign up, editable any time from the profile.
    mobile: { type: String, trim: true, default: '' },
    // Hashed password for email/password accounts (absent for Google accounts).
    passwordHash: { type: String },
    authProvider: { type: String, enum: ['password', 'google'], default: 'password' },
    // Non-Gmail sign ups confirm ownership via an emailed OTP before the User is
    // created (see PendingSignup), so every persisted account is already verified.
    emailVerified: { type: Boolean, default: false },
    ezyCoins: { type: Number, default: 0, min: 0 },
    welcomeBonusGranted: { type: Boolean, default: false },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
