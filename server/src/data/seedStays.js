import Stay from '../models/Stay.js';

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const SEED = [
  {
    title: 'The Kumaoni Family Home',
    slug: 'kumaoni-family-home',
    location: 'Almora, Kumaon',
    cat: 'quiet culture',
    best: 'Couples · Writers · Slow Travellers',
    guests: 4,
    rooms: 3,
    price: 4500,
    discountType: 'flat',
    discountValue: 1300,
    description:
      'A lived-in Kumaoni home perched above Almora, where mornings begin with mountain light and evenings settle into slow conversation around the hearth.',
    story:
      'This house has belonged to the same family for three generations. The wooden floors remember wedding songs; the courtyard still hosts village festivals. When you stay here, you are not checking into a room — you are welcomed into a way of living that measures days by sunrise tea, forest walks, and home-cooked thalis shared at one long table.\n\nYour hosts, Meera and Harish, know every trail above town and every story behind the temples in the valley. Ask them about the rhododendron season, or simply sit on the balcony and watch the clouds pour over the ridges.',
    directions:
      'Fly or train into Kathgodam, then drive ~3.5 hours via Bhowali–Almora. The last 4 km is a quiet hill road; a private transfer can be arranged from Kathgodam or Almora bus stand. Parking is available at the house.',
    highlights: [
      'Sunrise balcony with Himalayan views',
      'Home-cooked Kumaoni meals',
      'Village walks with your hosts',
      'Quiet workspace for writers',
    ],
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
    ],
    videos: [],
  },
  {
    title: 'The Quiet Pine Retreat',
    slug: 'quiet-pine-retreat',
    location: 'Ranikhet, Kumaon',
    cat: 'quiet forest',
    best: 'Solo · Nature Lovers',
    guests: 2,
    rooms: 2,
    price: 5200,
    discountType: 'flat',
    discountValue: 1400,
    description:
      'A secluded pine-forest cottage for travellers who want silence, soft light through the trees, and nights that belong to the stars.',
    story:
      'Built for two, this retreat sits deep enough in the pines that the only soundtrack is wind and birds. It was designed as a place to disconnect — no lobby chatter, no schedule, just a wood stove, a reading nook, and trails that start at the gate.\n\nIdeal if you are travelling solo or as a couple who wants the forest more than the town. Your host lives a short walk away and checks in gently: fresh bread in the morning, a thermos of chai for your hike, and advice on which ridge catches the best sunset.',
    directions:
      'Reach Ranikhet by road from Kathgodam (~3 hours) or Almora (~1.5 hours). From Ranikhet bazaar, follow signs toward Chaubatia; the cottage is 20 minutes up a forest lane. Shared taxis run to the junction; last-mile pickup can be arranged.',
    highlights: [
      'Deep pine forest setting',
      'Ideal for digital detox',
      'Private cottage for two',
      'Guided forest walks on request',
    ],
    images: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
    ],
    videos: [],
  },
  {
    title: 'The Family Valley Stay',
    slug: 'family-valley-stay',
    location: 'Nainital Hills',
    cat: 'family accessible',
    best: 'Families · Easy Access',
    guests: 6,
    rooms: 4,
    price: 4800,
    discountType: 'flat',
    discountValue: 1300,
    description:
      'A spacious valley home with easy road access — built for families who want mountain air without a difficult last mile.',
    story:
      'Wide rooms, a lawn for kids to run, and a kitchen that never seems empty — this is the stay parents recommend to each other. The hosts have raised their own children here and know how to pace a family holiday: a gentle morning hike, lunch at home, an afternoon at the lake, and early nights under warm blankets.\n\nYou are close enough to Nainital for day trips, far enough that evenings feel like the hills again. Grandparents settle into the veranda chairs; teenagers claim the attic room with the best view.',
    directions:
      'From Kathgodam, drive ~1.5 hours toward Nainital; the home is 25 minutes before the main lake road, on a paved village approach. Suitable for sedan and SUV. Private transfers available from the railway station.',
    highlights: [
      'Road-accessible for families',
      'Lawn and outdoor play space',
      'Four rooms for groups',
      'Day trips to Nainital lake',
    ],
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
    ],
    videos: [],
  },
  {
    title: 'The Valley View Cottage',
    slug: 'valley-view-cottage',
    location: 'Kausani, Kumaon',
    cat: 'quiet accessible',
    best: 'Remote Workers · Couples',
    guests: 3,
    rooms: 2,
    price: 5500,
    discountType: 'flat',
    discountValue: 1300,
    description:
      'A bright cottage overlooking long Kausani valleys — quiet enough to work, beautiful enough to forget the laptop.',
    story:
      'Kausani is famous for its horizon of snow peaks, and this cottage faces that stretch of sky. Mornings are for coffee and email if you must; afternoons for the ridge walk; evenings for watching the mountains turn pink.\n\nReliable enough connectivity for focused remote work, soft enough evenings that you will still feel like you escaped. The hosts keep the cottage stocked simply — fresh eggs, local honey, and a bookshelf that rewards slow reading.',
    directions:
      'From Kathgodam, drive ~5–6 hours via Almora–Kausani. The cottage is 10 minutes from Kausani bazaar on a motorable road. Bus services reach Kausani; ask hosts for a pickup from the stand.',
    highlights: [
      'Panoramic valley & peak views',
      'Work-friendly quiet corners',
      'Walkable to Kausani viewpoints',
      'Local honey & farm produce',
    ],
    images: [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
    ],
    videos: [],
  },
];

export async function seedStaysIfEmpty() {
  const count = await Stay.countDocuments();
  if (count === 0) {
    await Stay.insertMany(SEED);
    console.log(`Seeded ${SEED.length} stays`);
  }
  await backfillStayDetails();
}

/** Fill slug / story / directions on existing listings that are missing them. */
export async function backfillStayDetails() {
  for (const seed of SEED) {
    const stay = await Stay.findOne({ title: seed.title });
    if (!stay) continue;

    let changed = false;
    if (!stay.slug) {
      stay.slug = seed.slug;
      changed = true;
    }
    if (!stay.description) {
      stay.description = seed.description;
      changed = true;
    }
    if (!stay.story) {
      stay.story = seed.story;
      changed = true;
    }
    if (!stay.directions) {
      stay.directions = seed.directions;
      changed = true;
    }
    if (!stay.highlights?.length) {
      stay.highlights = seed.highlights;
      changed = true;
    }
    if ((!stay.images || stay.images.length < 2) && seed.images?.length) {
      stay.images = seed.images;
      changed = true;
    }
    if (changed) await stay.save();
  }

  // Any other stays without a slug get one from their title.
  const missingSlug = await Stay.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] });
  for (const stay of missingSlug) {
    stay.slug = slugify(stay.title) || String(stay._id);
    await stay.save();
  }
}
