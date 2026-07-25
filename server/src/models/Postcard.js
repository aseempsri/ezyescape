import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
  },
  { _id: false }
);

const postcardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    from: { type: String, default: '', trim: true, maxlength: 80 },
    text: { type: String, required: true, trim: true, maxlength: 1200 },
    media: { type: [mediaSchema], default: [] },
    avatarMode: { type: String, enum: ['photo', 'character'], required: true },
    avatarUrl: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', ''], default: '' },
    characterId: { type: String, default: '' },
    characterEmoji: { type: String, default: '' },
    handFont: { type: String, default: '' },
    layout: {
      type: String,
      enum: ['letter', 'airmail', 'polaroid', 'telegram', 'kraft', 'night', 'meadow', 'ticket'],
      default: 'letter',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

postcardSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Postcard', postcardSchema);
