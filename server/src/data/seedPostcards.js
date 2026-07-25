import Postcard from '../models/Postcard.js';
import { styleForIndex } from './postcardStyles.js';

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
];

function mediaImage(url) {
  return { url, type: 'image' };
}

/** Seed a few approved postcards so the wall isn't empty on first boot. */
const SEED = [
  {
    name: 'Priya & Anand',
    from: 'Bengaluru',
    text: 'Three days of pine air, handwritten recipes, and evenings that ended only when the fire did. Our host remembered how we take our tea by day two.',
    media: [
      mediaImage('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80'),
      mediaImage(EXTRA_IMAGES[0]),
      mediaImage(EXTRA_IMAGES[1]),
    ],
    avatarMode: 'character',
    gender: 'female',
    characterId: 'f-pine',
    characterEmoji: '👩‍🦱',
    status: 'approved',
  },
  {
    name: 'Sara',
    from: 'Delhi',
    text: 'I needed Wi‑Fi and a view that didn’t feel like a stock photo. I got both — plus apricot jam at breakfast and a trail that starts behind the house.',
    media: [
      mediaImage('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'),
      mediaImage(EXTRA_IMAGES[2]),
      mediaImage(EXTRA_IMAGES[3]),
    ],
    avatarMode: 'character',
    gender: 'female',
    characterId: 'f-orchard',
    characterEmoji: '👩',
    status: 'approved',
  },
  {
    name: 'The Mehta Family',
    from: 'Mumbai',
    text: 'Kids learned dal. We learned to slow down. Road access, warm hosts, and a kitchen that didn’t mind little helpers.',
    media: [
      mediaImage('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80'),
      mediaImage(EXTRA_IMAGES[4]),
      mediaImage(EXTRA_IMAGES[0]),
    ],
    avatarMode: 'character',
    gender: 'male',
    characterId: 'm-family',
    characterEmoji: '👨‍👧',
    status: 'approved',
  },
  {
    name: 'Rohan',
    from: 'Pune',
    text: 'The waterfall wasn’t on Maps. The welcome was. A short walk, a host who knew the ridge by heart, and a meal that tasted like the valley.',
    media: [
      mediaImage('https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80'),
      mediaImage(EXTRA_IMAGES[5]),
      mediaImage(EXTRA_IMAGES[1]),
    ],
    avatarMode: 'character',
    gender: 'male',
    characterId: 'm-trek',
    characterEmoji: '🧔',
    status: 'approved',
  },
];

/** Assign a unique paper + handwriting to every card by creation order. */
export async function diversifyPostcardStyles() {
  const all = await Postcard.find().sort({ createdAt: 1 });
  for (let i = 0; i < all.length; i += 1) {
    const { layout, handFont } = styleForIndex(i);
    if (all[i].layout !== layout || all[i].handFont !== handFont) {
      await Postcard.updateOne({ _id: all[i]._id }, { $set: { layout, handFont } });
    }
  }
}

/** Ensure sample/legacy cards have 2+ images so carousel arrows show on the wall. */
export async function ensurePostcardGalleries() {
  const thin = await Postcard.find({ $expr: { $lt: [{ $size: { $ifNull: ['$media', []] } }, 2] } });
  for (let i = 0; i < thin.length; i += 1) {
    const doc = thin[i];
    const existing = Array.isArray(doc.media) ? [...doc.media] : [];
    const need = 3 - existing.length;
    for (let n = 0; n < need; n += 1) {
      const url = EXTRA_IMAGES[(i * 2 + n) % EXTRA_IMAGES.length];
      if (!existing.some((m) => m.url === url)) {
        existing.push(mediaImage(url));
      }
    }
    if (existing.length >= 2) {
      await Postcard.updateOne({ _id: doc._id }, { $set: { media: existing } });
    }
  }
}

export async function seedPostcardsIfEmpty() {
  const count = await Postcard.countDocuments();
  if (count === 0) {
    const docs = SEED.map((row, i) => ({ ...row, ...styleForIndex(i) }));
    await Postcard.insertMany(docs);
    console.log(`Seeded ${SEED.length} postcards`);
    return;
  }
  await diversifyPostcardStyles();
  await ensurePostcardGalleries();
}
