import Event from '../models/Event.js';
import { slugify } from './seedStays.js';

const MONTHS = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function parseDateLabel(label) {
  // "14 Mar 2025"
  const m = String(label || '').match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!m) return null;
  const months = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const mi = months[m[2].toLowerCase()];
  if (mi == null) return null;
  return new Date(Date.UTC(Number(m[3]), mi, Number(m[1])));
}

/** Next occurrence of month/day on or after today (UTC calendar). */
function upcomingDate(month, day) {
  const mi = MONTHS[String(month || '').toUpperCase()];
  if (mi == null) return null;
  const d = Number(day) || 1;
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  let year = now.getUTCFullYear();
  let stamp = Date.UTC(year, mi, d);
  if (stamp < today) {
    year += 1;
    stamp = Date.UTC(year, mi, d);
  }
  return new Date(stamp);
}

const SEED = [
  {
    title: 'Sunrise Yoga Circle',
    status: 'upcoming',
    month: 'SEP',
    day: '14',
    dateLabel: 'Sep 14',
    startDate: upcomingDate('SEP', 14),
    tag: 'Wellness',
    place: 'Ranikhet',
    spots: '8 spots left',
    desc: 'A gentle morning practice on a Ranikhet ridge — mats, chai, and valley light.',
    details:
      'Join a small circle on a Ranikhet ridge as the valley wakes. Mats and chai are provided; wear layers and soft-soled shoes. The session lasts about 75 minutes, followed by quiet tea with views.',
    instructions:
      'Arrive 15 minutes early. Carry water and a light jacket. Leave valuables at your stay — the ridge path is short but uneven.',
    guidelines:
      'Open to all levels. Please keep phones silent. Photography is welcome after the practice, not during.',
    pricing: '₹1,200 per person · includes mat, chai, and host guidance',
    locationDetails: 'Ranikhet ridge meetup point shared on WhatsApp after booking. ~20 min from partner homestays.',
    images: ['/images/experiences/upcoming-sunrise-yoga.png'],
    waMessage:
      "Hi Ezy Escape! I'd like to book a seat for Sunrise Yoga Circle (14 Sep, Ranikhet). Could you share availability and how to join?",
  },
  {
    title: 'Folk Music Evening',
    status: 'upcoming',
    month: 'OCT',
    day: '05',
    dateLabel: 'Oct 5',
    startDate: upcomingDate('OCT', 5),
    tag: 'Music',
    place: 'Almora',
    spots: '12 spots left',
    desc: 'Local musicians, shared dinner, and songs that belong to the hills.',
    details:
      'An intimate evening with local musicians in Almora — mountain instruments, shared dinner, and songs that feel like a village living room.',
    instructions: 'Doors open at 5:30 pm. Dinner is vegetarian. Let us know allergies when you book.',
    guidelines: 'Seating is limited. Children welcome with a supervising adult.',
    pricing: '₹1,800 per person · includes dinner and performance',
    locationDetails: 'Almora courtyard venue — pin shared after confirmation.',
    images: ['/images/experiences/upcoming-folk-music.png'],
    waMessage:
      "Hi Ezy Escape! I'm interested in booking the Folk Music Evening (5 Oct, Almora). Can you tell me more and reserve a spot?",
  },
  {
    title: 'Diwali Homestay Gathering',
    status: 'upcoming',
    month: 'OCT',
    day: '20',
    dateLabel: 'Oct 20',
    startDate: upcomingDate('OCT', 20),
    tag: 'Festival',
    place: 'Kausani',
    spots: '6 spots left',
    desc: 'Diya lighting, sweets, and courtyard stories with a host family.',
    details:
      'Celebrate Diwali with a host family in Kausani — diya lighting, sweets, and courtyard stories under mountain dark.',
    instructions: 'Wear festive but warm clothes. Fireworks are limited and family-safe.',
    guidelines: 'This is a home gathering, not a tourist show — follow your hosts’ lead.',
    pricing: '₹2,200 per person · includes sweets, diyas, and evening meal',
    locationDetails: 'Kausani partner homestay — directions after booking.',
    images: ['/images/experiences/upcoming-diwali.png'],
    waMessage:
      "Hi Ezy Escape! I'd love to join the Diwali Homestay Gathering (20 Oct, Kausani). Please share details and how I can book.",
  },
  {
    title: 'Bonfire Story Night',
    status: 'upcoming',
    month: 'NOV',
    day: '09',
    dateLabel: 'Nov 9',
    startDate: upcomingDate('NOV', 9),
    tag: 'Evening',
    place: 'Nainital Hills',
    spots: '10 spots left',
    desc: 'Firelight, folk tales, and warm cups under a clear mountain sky.',
    details:
      'Gather around the fire for folk tales and warm cups under a clear hill sky. Blankets provided; nights run cold.',
    instructions: 'Wear closed shoes and a warm layer. Marshmallows optional — ask when booking.',
    guidelines: 'Stay within the fire circle. No open flames beyond the designated pit.',
    pricing: '₹900 per person · includes blankets and hot drinks',
    locationDetails: 'Nainital Hills lawn — pickup from partner stays available.',
    images: ['/images/experiences/upcoming-bonfire.png'],
    waMessage:
      "Hi Ezy Escape! I'd like to book Bonfire Story Night (9 Nov, Nainital Hills). Could you help me reserve a seat?",
  },
  {
    title: 'Holi in the Hills',
    status: 'past',
    emoji: '🎨',
    dateLabel: '14 Mar 2025',
    startDate: parseDateLabel('14 Mar 2025'),
    tag: 'Festival',
    place: 'Kumaon',
    spots: 'Was a full-colour gathering',
    desc: 'Celebrate the festival of colours with host families — gulal, drums, and laughter echoing across the ridges.',
    details:
      'A colour-soaked day with host families across the ridges — gulal, drums, shared lunch, and laughter that carries over the terraces. Guests are welcomed into the rhythm of a real Kumaoni Holi, not a staged show.',
    instructions:
      'Wear clothes you do not mind staining. Carry a change of clothes and a towel. Water and snacks are provided; arrive with energy and an open heart.',
    guidelines:
      'Colours are natural where possible. Be gentle with elders and children. Ask before photographing faces up close.',
    pricing: '₹1,500 per person · includes gulal, lunch, and host welcome',
    locationDetails: 'Kumaon partner homes — exact pin shared with confirmed guests before the day.',
    images: ['/images/experiences/holi-in-the-hills.png'],
    waMessage:
      "Hi Ezy Escape! I'd love to join Holi in the Hills next season. Please tell me when dates open.",
  },
  {
    title: 'Diwali at the Homestay',
    status: 'past',
    emoji: '🪔',
    dateLabel: '31 Oct 2024',
    startDate: parseDateLabel('31 Oct 2024'),
    tag: 'Festival',
    place: 'Kumaon',
    spots: 'Intimate courtyard night',
    desc: 'Diya-lit courtyards, sweets shared at one table, and mountain nights glowing softer than the city.',
    details:
      'Diya lighting with a host family, mithai on one shared table, and courtyard stories under a quiet mountain sky. This is a home celebration — warm, simple, and meant for travellers who want to belong for an evening.',
    instructions:
      'Wear festive but warm layers. Slip-on shoes help for the courtyard. Let us know dietary needs when you reserve.',
    guidelines:
      'Follow your hosts’ lead for rituals and fireworks (kept family-safe). Phones down during the diya lighting if the family asks.',
    pricing: '₹2,000 per person · includes sweets, diyas, and evening meal',
    locationDetails: 'Partner homestay in Kumaon — directions after booking confirmation.',
    images: ['/images/experiences/diwali-at-the-homestay.png'],
    waMessage:
      "Hi Ezy Escape! I'm interested in Diwali at the Homestay when you next host it. Could you share details?",
  },
  {
    title: 'Regional Festivals',
    status: 'past',
    emoji: '🛕',
    dateLabel: '18 Aug 2024',
    startDate: parseDateLabel('18 Aug 2024'),
    tag: 'Culture',
    place: 'Kumaon',
    spots: 'Small curated groups',
    desc: 'Join village fairs, temple processions and seasonal celebrations that locals mark on the calendar — not tourists.',
    details:
      'A day woven into the local calendar — village fairs, temple processions, and seasonal rites that belong to Kumaon. Your host walks with you, introduces customs, and keeps the pace respectful and unhurried.',
    instructions:
      'Comfortable walking shoes and a light scarf or shawl help. Carry water. We share timing and dress notes a day before.',
    guidelines:
      'Ask before entering sacred spaces with shoes or cameras. Stay with the group in crowded processions.',
    pricing: '₹1,400 per person · includes host guide and light refreshments',
    locationDetails: 'Meetup at a partner homestay; village venues vary by festival date.',
    images: ['/images/experiences/regional-festivals.png'],
    waMessage:
      "Hi Ezy Escape! I'd like to join a regional festival gathering in Kumaon. Which dates are open?",
  },
  {
    title: 'Group Therapy Sessions',
    status: 'past',
    emoji: '🌿',
    dateLabel: '8 Jun 2025',
    startDate: parseDateLabel('8 Jun 2025'),
    tag: 'Wellness',
    place: 'Kumaon',
    spots: 'Closed circle · limited seats',
    desc: 'Guided circles for stillness and honest conversation — held outdoors, with mountains as the quiet backdrop.',
    details:
      'A facilitated outdoor circle for stillness, breath, and honest conversation. Sessions last about 90 minutes, with time to arrive, settle, and close gently. No prior therapy experience needed — only willingness to listen.',
    instructions:
      'Arrive 10 minutes early. Bring a warm layer and a notebook if you like. Phones stay on silent outside the circle.',
    guidelines:
      'Confidentiality stays in the circle. Share only what feels right. Facilitators may pause the group if needed for care.',
    pricing: '₹1,100 per person · includes facilitation and tea',
    locationDetails: 'Quiet lawn or covered verandah near partner stays — pin shared after booking.',
    images: ['/images/experiences/group-therapy-sessions.png'],
    waMessage:
      "Hi Ezy Escape! I'm interested in a Group Therapy Session in the hills. Could you share the next dates?",
  },
  {
    title: 'Sunrise Yoga Circles',
    status: 'past',
    emoji: '🧘',
    dateLabel: '3 May 2025',
    startDate: parseDateLabel('3 May 2025'),
    tag: 'Wellness',
    place: 'Kumaon',
    spots: 'Open to all levels',
    desc: 'Slow stretches and breathwork on the lawn or ridge as the valley wakes — open to solo travellers and small groups.',
    details:
      'Slow stretches, breathwork, and quiet sitting as first light fills the valley. Mats are provided; the practice lasts about 75 minutes, followed by chai. Suitable for beginners and returning practitioners alike.',
    instructions:
      'Wear soft layers you can move in. Arrive a little early to settle. Leave valuables at your stay if the path is uneven.',
    guidelines:
      'Keep phones silent. Photography after practice only. Move at your own pace — nothing is forced.',
    pricing: '₹1,200 per person · includes mat, chai, and guidance',
    locationDetails: 'Lawn or ridge near partner homestays — exact spot confirmed on WhatsApp.',
    images: ['/images/experiences/sunrise-yoga-circles.png'],
    waMessage:
      "Hi Ezy Escape! I'd like to join a Sunrise Yoga Circle. Please share upcoming dates and how to book.",
  },
  {
    title: 'Bonfire Story Nights',
    status: 'past',
    emoji: '🔥',
    dateLabel: '18 Jan 2025',
    startDate: parseDateLabel('18 Jan 2025'),
    tag: 'Evening',
    place: 'Kumaon',
    spots: '10 seats around the fire',
    desc: 'Hosts and guests gather around the fire — folk tales, songs, and warm cups that stretch late into the cold.',
    details:
      'Gather with hosts and fellow travellers around a designated fire pit — folk tales, soft songs, and warm cups under a clear hill sky. Blankets are provided; nights run cold and the circle usually lasts 90–120 minutes.',
    instructions:
      'Wear closed shoes and a warm layer. Arrive as dusk settles. Marshmallows or light snacks may be offered — ask when you book about dietary needs.',
    guidelines:
      'Stay within the fire circle. No open flames beyond the designated pit. Children welcome with a supervising adult.',
    pricing: '₹900 per person · includes blankets and hot drinks',
    locationDetails: 'Partner homestay lawn in Kumaon — pickup from nearby stays available on request.',
    images: ['/images/experiences/bonfire-story-nights.png'],
    waMessage:
      "Hi Ezy Escape! I'd like to book a seat for Bonfire Story Nights. Could you share the next date and how to join?",
  },
  {
    title: 'Folk Music Evenings',
    status: 'past',
    emoji: '🎶',
    dateLabel: '7 Dec 2024',
    startDate: parseDateLabel('7 Dec 2024'),
    tag: 'Music',
    place: 'Kumaon',
    spots: 'Courtyard seating',
    desc: 'Local musicians, mountain instruments and shared rhythms — evenings that feel like a village living room.',
    details:
      'An intimate courtyard evening with local musicians — mountain instruments, shared dinner, and songs that feel like a village living room. Expect about two hours of music with a vegetarian meal woven through the night.',
    instructions:
      'Doors open at 5:30 pm. Dinner is vegetarian; share allergies when you book. Warm layers for after sunset.',
    guidelines:
      'Seating is limited. Children welcome with a supervising adult. Quiet between pieces helps the music land.',
    pricing: '₹1,800 per person · includes dinner and performance',
    locationDetails: 'Courtyard venue near Almora / partner homes — pin shared after confirmation.',
    images: ['/images/experiences/folk-music-evenings.png'],
    waMessage:
      "Hi Ezy Escape! I'm interested in Folk Music Evenings. Can you tell me the next date and reserve a spot?",
  },
  {
    title: 'Harvest Celebrations',
    status: 'past',
    emoji: '🌾',
    dateLabel: '22 Sep 2024',
    startDate: parseDateLabel('22 Sep 2024'),
    tag: 'Seasonal',
    place: 'Kumaon',
    spots: 'Hands-on farm day',
    desc: 'Seasonal gatherings when the fields give back — communal meals, gratitude, and hands-on farm moments.',
    details:
      'A seasonal day when the fields give back — short farm tasks with hosts, a communal meal, and quiet gratitude for the harvest. Expect soil on your hands, shared stories, and a slow afternoon that belongs to the land.',
    instructions:
      'Wear clothes that can get dusty and closed shoes. Sun protection helps. We share the meetup time the day before.',
    guidelines:
      'Follow host guidance around tools and animals. Leave no litter. Ask before taking close photos of family members.',
    pricing: '₹1,600 per person · includes farm session and communal meal',
    locationDetails: 'Partner farm / homestay fields in Kumaon — directions after booking.',
    images: ['/images/experiences/harvest-celebrations.png'],
    waMessage:
      "Hi Ezy Escape! I'd love to join a Harvest Celebration. When is the next one and how do I book?",
  },
];

const COPY_FIELDS = [
  'desc',
  'details',
  'instructions',
  'guidelines',
  'pricing',
  'locationDetails',
  'waMessage',
  'spots',
  'place',
  'tag',
  'emoji',
];

function isThin(value) {
  return !String(value || '').trim() || String(value).trim().length < 60;
}

function needsEnrichment(doc) {
  return (
    isThin(doc.details)
    || isThin(doc.instructions)
    || isThin(doc.pricing)
    || isThin(doc.locationDetails)
  );
}

/**
 * Fill empty / one-line copy on existing events (past seeds were thin by design).
 * Does not overwrite rich admin-edited fields that already look complete.
 */
export async function enrichThinEventCopy() {
  let patched = 0;
  for (const seed of SEED) {
    const doc = await Event.findOne({ title: seed.title });
    if (!doc || !needsEnrichment(doc)) continue;

    const $set = {};
    for (const key of COPY_FIELDS) {
      if (seed[key] == null || seed[key] === '') continue;
      if (isThin(doc[key])) $set[key] = seed[key];
    }
    if (!Object.keys($set).length) continue;
    await Event.updateOne({ _id: doc._id }, { $set });
    patched += 1;
  }
  if (patched) console.log(`Enriched copy on ${patched} event(s)`);
}

export async function seedEventsIfEmpty() {
  const count = await Event.countDocuments();
  if (count === 0) {
    const docs = SEED.map((ev, i) => ({
      ...ev,
      slug: slugify(ev.title) || `event-${i + 1}`,
      active: true,
    }));
    await Event.insertMany(docs);
    console.log(`Seeded ${docs.length} events`);
    return;
  }

  await enrichThinEventCopy();
}
