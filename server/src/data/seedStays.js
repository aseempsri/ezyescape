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

/** Split a combined story blob into story + hosts when possible. */
export function splitStoryHosts(text) {
  const paras = String(text || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!paras.length) return { story: '', hosts: '' };

  const hostIdx = paras.findIndex((p) =>
    /\b(your|the|our)\s+hosts?\b|\bhost family\b|welcomed by/i.test(p)
  );

  if (hostIdx > 0) {
    return {
      story: paras.slice(0, hostIdx).join('\n\n'),
      hosts: paras.slice(hostIdx).join('\n\n'),
    };
  }
  if (hostIdx === 0 && paras.length > 1) {
    return {
      story: paras.slice(1).join('\n\n'),
      hosts: paras[0],
    };
  }
  if (paras.length >= 2) {
    return {
      story: paras.slice(0, -1).join('\n\n'),
      hosts: paras.slice(-1).join('\n\n'),
    };
  }
  return { story: paras[0], hosts: '' };
}

const img = (folder, file) => `/images/stays/${folder}/${file}`;

const SEED = [
  {
    title: 'Aipan',
    slug: 'aipan',
    location: 'Almora, Kumaon',
    cat: 'quiet culture accessible',
    best: 'Couples · Culture lovers · Slow evenings',
    guests: 3,
    rooms: 1,
    price: 1999,
    experienceTip: 1299,
    discountType: 'none',
    discountValue: 0,
    description:
      'Aipan is a mountain home with neon nights, forest windows, and a terrace that faces the hills — named for the folk art that still marks Kumaoni doorways.',
    story:
      'Evenings here often end around the grill under the Aipan Homestay light. Days open onto green ridges through the bedroom window. The house is simple, warm, and made for travellers who want a real Almora stay — not a hotel lobby.',
    hosts:
      'Your hosts keep the home ready with local care: chai when you arrive, tips for quiet walks, and the kind of welcome that turns a booking into belonging.',
    directions:
      'Reach Kathgodam by train or Pantnagar by air, then drive toward Almora. Private transfers can be arranged — ask us on WhatsApp when you book.',
    highlights: [
      'Neon courtyard evenings & BBQ nights',
      'Forest-facing bedroom windows',
      'Terrace seating with hill views',
      'Heartfelt Pricing — Heart Price if the stay was good',
    ],
    images: [
      img('aipan', '01-cover.jpg'),
      img('aipan', '02-bedroom.jpg'),
      img('aipan', '03-exterior.jpg'),
      img('aipan', '04-terrace.jpg'),
      img('aipan', '05-view.jpg'),
      img('aipan', '06-room.jpg'),
    ],
    storyImage: img('aipan', '04-terrace.jpg'),
    hostImage: img('aipan', '02-bedroom.jpg'),
    videos: [],
    mapQuery: 'Aipan Homestay, Almora, Uttarakhand',
  },
  {
    title: 'Gulmohar',
    slug: 'gulmohar',
    location: 'Almora, Kumaon',
    cat: 'family quiet accessible',
    best: 'Couples · Small families · Quiet weekends',
    guests: 4,
    rooms: 1,
    price: 2199,
    experienceTip: 1499,
    discountType: 'none',
    discountValue: 0,
    description:
      'Gulmohar is a bright hillside cottage with a loft, flower-edged porch, and a living room that feels like a mountain home — not a showroom.',
    story:
      'White walls, a red trim, mudha seats outside, and a loft upstairs for extra sleep space. Inside, wood floors and large windows pull the hillside into the room. Gulmohar is built for unhurried mornings and early nights.',
    hosts:
      'Hosts are a short call away — fresh recommendations for viewpoints, local food, and when the light is softest on the ridge.',
    directions:
      'Road-accessible from Almora. Share your arrival time and we will help with the last stretch and parking.',
    highlights: [
      'Hillside cottage with garden porch',
      'Loft sleeping for flexible groups',
      'Bright living room with valley light',
      'Heartfelt Pricing — Heart Price if the stay was good',
    ],
    images: [
      img('gulmohar', '01-cover.jpg'),
      img('gulmohar', '02-living.jpg'),
      img('gulmohar', '03-interior.jpg'),
      img('gulmohar', '04-loft.jpg'),
      img('gulmohar', '05-detail.jpg'),
      img('gulmohar', '06-exterior.jpg'),
    ],
    storyImage: img('gulmohar', '02-living.jpg'),
    hostImage: img('gulmohar', '04-loft.jpg'),
    videos: [],
    mapQuery: 'Gulmohar Homestay, Almora, Uttarakhand',
  },
  {
    title: 'Sanjh',
    slug: 'sanjh',
    location: 'Almora, Kumaon',
    cat: 'quiet accessible',
    best: 'Couples · Friends · Calm getaways',
    guests: 4,
    rooms: 2,
    price: 2499,
    experienceTip: 1499,
    discountType: 'none',
    discountValue: 0,
    description:
      'Sanjh — evening in Hindi — is a calm two-room stay with soft light, modern baths, and spaces made for winding down after a day in the hills.',
    story:
      'Named for dusk, Sanjh is where the day slows. Clean rooms, a quiet lounge corner, and thoughtful finishes. Ideal when you want comfort without leaving the mountain mood behind.',
    hosts:
      'Your hosts help you plan golden-hour walks and simple dinners nearby — or stay in and let the evening do the work.',
    directions:
      'Easy road access from Almora town. We share exact pin and parking notes after confirmation.',
    highlights: [
      'Two comfortable guest rooms',
      'Modern bathroom finishes',
      'Quiet lounge corner for evenings',
      'Heartfelt Pricing — Heart Price if the stay was good',
    ],
    images: [
      img('sanjh', '01-cover.jpg'),
      img('sanjh', '02-lounge.jpg'),
      img('sanjh', '03-bath.jpg'),
      img('sanjh', '04-room.jpg'),
      img('sanjh', '05-room2.jpg'),
      img('sanjh', '06-detail.jpg'),
    ],
    storyImage: img('sanjh', '02-lounge.jpg'),
    hostImage: img('sanjh', '01-cover.jpg'),
    videos: [],
    mapQuery: 'Sanjh Homestay, Almora, Uttarakhand',
  },
  {
    title: 'Virasat',
    slug: 'virasat',
    location: 'Almora, Kumaon',
    cat: 'quiet culture accessible',
    best: 'Budget travellers · Friends · First hill trips',
    guests: 4,
    rooms: 2,
    price: 1499,
    experienceTip: 999,
    discountType: 'none',
    discountValue: 0,
    description:
      'Virasat is our bold yellow-and-blue hillside home — two rooms, honest comfort, and the easiest Heartfelt Pricing entry into the mountains.',
    story:
      'Heritage in colour, not in fuss. Bright exterior stairs lead to simple, clean rooms with teal accents and wooden beds. Virasat is for travellers who want a real Almora base without overpaying for the night.',
    hosts:
      'Hosts greet you with practical hill tips — where to eat, which ridge for sunrise, and how to settle in without a checklist.',
    directions:
      'Motorable approach near Almora. We send the location pin and arrival notes on WhatsApp after you book.',
    highlights: [
      'Striking yellow & blue hillside home',
      'Two private rooms',
      'Best-value Heartfelt Pricing',
      'Ideal first stay in Kumaon',
    ],
    images: [
      img('virasat', '01-cover.jpg'),
      img('virasat', '02-bedroom.jpg'),
      img('virasat', '03-bedroom.jpg'),
      img('virasat', '04-room2.jpg'),
      img('virasat', '05-room2.jpg'),
      img('virasat', '06-exterior.jpg'),
    ],
    storyImage: img('virasat', '06-exterior.jpg'),
    hostImage: img('virasat', '02-bedroom.jpg'),
    videos: [],
    mapQuery: 'Virasat Homestay, Almora, Uttarakhand',
  },
  {
    title: 'Virasat Suite',
    slug: 'virasat-suite',
    location: 'Almora, Kumaon',
    cat: 'family quiet accessible',
    best: 'Families · Longer stays · Extra space',
    guests: 5,
    rooms: 1,
    price: 1999,
    experienceTip: 1299,
    discountType: 'none',
    discountValue: 0,
    description:
      'Virasat Suite is the family wing of Virasat — more room to spread out, bold colour, and space for parents and kids to stay together comfortably.',
    story:
      'Drawn from the Family Suite at Virasat, this stay gives you a larger footprint: room to sleep, move, and settle in as a small family or a longer-stay couple who wants breathing room.',
    hosts:
      'Same warm Virasat hosts — extra help with family timing, early breakfasts, and quiet evenings after kids sleep.',
    directions:
      'Same hillside as Virasat. We confirm suite access and parking when your dates are locked.',
    highlights: [
      'Family-suite layout with more space',
      'Bold Virasat colour story',
      'Comfortable for small families',
      'Heartfelt Pricing — Heart Price if the stay was good',
    ],
    images: [
      img('virasat-suite', '01-cover.jpg'),
      img('virasat-suite', '02-bedroom.jpg'),
      img('virasat-suite', '03-space.jpg'),
      img('virasat-suite', '04-detail.jpg'),
      img('virasat-suite', '05-room.jpg'),
      img('virasat-suite', '06-view.jpg'),
    ],
    storyImage: img('virasat-suite', '03-space.jpg'),
    hostImage: img('virasat-suite', '02-bedroom.jpg'),
    videos: [],
    mapQuery: 'Virasat Suite Homestay, Almora, Uttarakhand',
  },
];

const LEGACY_PLACEHOLDER_SLUGS = [
  'kumaoni-family-home',
  'quiet-pine-retreat',
  'family-valley-stay',
  'valley-view-cottage',
];

export async function seedStaysIfEmpty() {
  const count = await Stay.countDocuments();
  if (count === 0) {
    await Stay.insertMany(SEED);
    console.log(`Seeded ${SEED.length} stays`);
  }
  await syncCanonicalHomestays();
  await backfillStayDetails();
}

/** Upsert the real Almora catalogue and retire old Unsplash placeholders. */
export async function syncCanonicalHomestays() {
  for (const seed of SEED) {
    await Stay.findOneAndUpdate(
      { slug: seed.slug },
      { $set: { ...seed, active: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const deactivated = await Stay.updateMany(
    {
      $or: [
        { slug: { $in: LEGACY_PLACEHOLDER_SLUGS } },
        {
          title: {
            $in: [
              'The Kumaoni Family Home',
              'The Quiet Pine Retreat',
              'The Family Valley Stay',
              'The Valley View Cottage',
            ],
          },
        },
      ],
    },
    { $set: { active: false } }
  );

  if (deactivated.modifiedCount) {
    console.log(`Deactivated ${deactivated.modifiedCount} legacy placeholder stay(s)`);
  }
  console.log(`Synced ${SEED.length} canonical homestays`);
}

/** Fill slug / story / hosts / directions on existing listings that are missing them. */
export async function backfillStayDetails() {
  for (const seed of SEED) {
    const stay = await Stay.findOne({ slug: seed.slug });
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

    if (seed.story && seed.hosts) {
      const missingHosts = !stay.hosts;
      if (missingHosts) {
        stay.story = seed.story;
        stay.hosts = seed.hosts;
        changed = true;
      }
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
    if (stay.experienceTip == null && seed.experienceTip != null) {
      stay.experienceTip = seed.experienceTip;
      changed = true;
    }
    if (changed) await stay.save();
  }

  const missingSlug = await Stay.find({ $or: [{ slug: { $exists: false } }, { slug: '' }] });
  for (const stay of missingSlug) {
    stay.slug = slugify(stay.title) || String(stay._id);
    await stay.save();
  }

  const needsHosts = await Stay.find({
    $or: [{ hosts: { $exists: false } }, { hosts: '' }],
    story: { $ne: '' },
  });
  for (const stay of needsHosts) {
    const split = splitStoryHosts(stay.story);
    if (!split.hosts) continue;
    stay.story = split.story;
    stay.hosts = split.hosts;
    await stay.save();
  }
}
