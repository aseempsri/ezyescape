import mongoose from 'mongoose';

const staySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, unique: true, sparse: true },
    location: { type: String, required: true, trim: true },
    // Space-separated tags used by the frontend filters (e.g. "quiet forest").
    cat: { type: String, default: '', trim: true },
    best: { type: String, default: '', trim: true },
    guests: { type: Number, default: 2, min: 1 },
    rooms: { type: Number, default: 1, min: 1 },
    // Base per-night fare charged at booking (Heartfelt Pricing).
    price: { type: Number, required: true, min: 0 },
    // Suggested optional experience tip — guests leave it if the stay moved them.
    experienceTip: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['none', 'percent', 'flat'], default: 'none' },
    discountValue: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '', trim: true },
    story: { type: String, default: '', trim: true },
    hosts: { type: String, default: '', trim: true },
    storyImage: { type: String, default: '', trim: true },
    hostImage: { type: String, default: '', trim: true },
    directions: { type: String, default: '', trim: true },
    // Google Maps search query or "lat,lng" — used for the property map embed.
    mapQuery: { type: String, default: '', trim: true },
    highlights: { type: [String], default: [] },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    active: { type: Boolean, default: true },
    // Short lock so two guests cannot confirm the same dates at the same moment.
    bookingLock: { type: String, default: null },
    bookingLockUntil: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Stay', staySchema);
