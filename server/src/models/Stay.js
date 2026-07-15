import mongoose from 'mongoose';

const staySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    // Space-separated tags used by the frontend filters (e.g. "quiet forest").
    cat: { type: String, default: '', trim: true },
    best: { type: String, default: '', trim: true },
    guests: { type: Number, default: 2, min: 1 },
    rooms: { type: Number, default: 1, min: 1 },
    // Original per-night price (shown struck-through when discounted).
    price: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ['none', 'percent', 'flat'], default: 'none' },
    discountValue: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Stay', staySchema);
