import mongoose from 'mongoose';

const mediaItemSchema = new mongoose.Schema(
  {
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    mediaUrl: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const adSchema = new mongoose.Schema(
  {
    adId: { type: String, required: true, trim: true },
    site: { type: String, required: true, trim: true, default: 'ezyescape' },
    enabled: { type: Boolean, default: false },
    mediaItems: { type: [mediaItemSchema], default: [] },
    // Legacy mirrors of first media item (kept for compatibility with Social Screen shape).
    mediaType: { type: String, enum: ['image', 'video', ''], default: '' },
    mediaUrl: { type: String, default: '', trim: true },
    linkUrl: { type: String, default: '', trim: true },
    altText: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

adSchema.index({ adId: 1, site: 1 }, { unique: true });

export default mongoose.model('Ad', adSchema);
