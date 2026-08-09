import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, unique: true, sparse: true },
    /** live + upcoming appear in “Upcoming”; past in past list */
    status: {
      type: String,
      enum: ['live', 'upcoming', 'past'],
      default: 'upcoming',
      index: true,
    },
    tag: { type: String, default: '', trim: true },
    place: { type: String, default: '', trim: true },
    spots: { type: String, default: '', trim: true },
    /** Badge month/day for upcoming cards (e.g. SEP / 14) */
    month: { type: String, default: '', trim: true },
    day: { type: String, default: '', trim: true },
    /** Human label e.g. "14 Mar 2025" or "Sep 14" */
    dateLabel: { type: String, default: '', trim: true },
    /** Used for past-event sorting (latest first) */
    startDate: { type: Date, default: null, index: true },
    desc: { type: String, default: '', trim: true },
    details: { type: String, default: '', trim: true },
    instructions: { type: String, default: '', trim: true },
    guidelines: { type: String, default: '', trim: true },
    pricing: { type: String, default: '', trim: true },
    locationDetails: { type: String, default: '', trim: true },
    images: { type: [String], default: [] },
    waMessage: { type: String, default: '', trim: true },
    emoji: { type: String, default: '', trim: true },
    active: { type: Boolean, default: true },
    /** Per-event sidebar ad under “Reserve your spot” */
    adEnabled: { type: Boolean, default: false },
    adMediaUrl: { type: String, default: '', trim: true },
    adMediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    adLinkUrl: { type: String, default: '', trim: true },
    adAltText: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('Event', eventSchema);
