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

function upcomingDate(month, day, year = 2025) {
  const mi = MONTHS[String(month || '').toUpperCase()];
  if (mi == null) return null;
  return new Date(Date.UTC(year, mi, Number(day) || 1));
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
    desc: 'Celebrate the festival of colours with host families — gulal, drums, and laughter echoing across the ridges.',
    details: 'A colour-soaked gathering with host families — gulal, drums, and laughter across the ridges.',
    instructions: '',
    guidelines: '',
    pricing: '',
    locationDetails: 'Kumaon partner homes',
    images: ['/images/experiences/holi-in-the-hills.png'],
  },
  {
    title: 'Diwali at the Homestay',
    status: 'past',
    emoji: '🪔',
    dateLabel: '31 Oct 2024',
    startDate: parseDateLabel('31 Oct 2024'),
    tag: 'Festival',
    place: 'Kumaon',
    desc: 'Diya-lit courtyards, sweets shared at one table, and mountain nights glowing softer than the city.',
    details: 'Diya-lit courtyards and sweets shared at one table with a host family.',
    images: ['/images/experiences/diwali-at-the-homestay.png'],
  },
  {
    title: 'Regional Festivals',
    status: 'past',
    emoji: '🛕',
    dateLabel: '18 Aug 2024',
    startDate: parseDateLabel('18 Aug 2024'),
    tag: 'Culture',
    place: 'Kumaon',
    desc: 'Join village fairs, temple processions and seasonal celebrations that locals mark on the calendar — not tourists.',
    details: 'Village fairs and temple processions marked on the local calendar.',
    images: ['/images/experiences/regional-festivals.png'],
  },
  {
    title: 'Group Therapy Sessions',
    status: 'past',
    emoji: '🌿',
    dateLabel: '8 Jun 2025',
    startDate: parseDateLabel('8 Jun 2025'),
    tag: 'Wellness',
    place: 'Kumaon',
    desc: 'Guided circles for stillness and honest conversation — held outdoors, with mountains as the quiet backdrop.',
    details: 'Guided outdoor circles for stillness and honest conversation.',
    images: ['/images/experiences/group-therapy-sessions.png'],
  },
  {
    title: 'Sunrise Yoga Circles',
    status: 'past',
    emoji: '🧘',
    dateLabel: '3 May 2025',
    startDate: parseDateLabel('3 May 2025'),
    tag: 'Wellness',
    place: 'Kumaon',
    desc: 'Slow stretches and breathwork on the lawn or ridge as the valley wakes — open to solo travellers and small groups.',
    details: 'Slow stretches and breathwork as the valley wakes.',
    images: ['/images/experiences/sunrise-yoga-circles.png'],
  },
  {
    title: 'Bonfire Story Nights',
    status: 'past',
    emoji: '🔥',
    dateLabel: '18 Jan 2025',
    startDate: parseDateLabel('18 Jan 2025'),
    tag: 'Evening',
    place: 'Kumaon',
    desc: 'Hosts and guests gather around the fire — folk tales, songs, and warm cups that stretch late into the cold.',
    details: 'Folk tales and warm cups around the fire.',
    images: ['/images/experiences/bonfire-story-nights.png'],
  },
  {
    title: 'Folk Music Evenings',
    status: 'past',
    emoji: '🎶',
    dateLabel: '7 Dec 2024',
    startDate: parseDateLabel('7 Dec 2024'),
    tag: 'Music',
    place: 'Kumaon',
    desc: 'Local musicians, mountain instruments and shared rhythms — evenings that feel like a village living room.',
    details: 'Local musicians and mountain instruments in a shared living-room mood.',
    images: ['/images/experiences/folk-music-evenings.png'],
  },
  {
    title: 'Harvest Celebrations',
    status: 'past',
    emoji: '🌾',
    dateLabel: '22 Sep 2024',
    startDate: parseDateLabel('22 Sep 2024'),
    tag: 'Seasonal',
    place: 'Kumaon',
    desc: 'Seasonal gatherings when the fields give back — communal meals, gratitude, and hands-on farm moments.',
    details: 'Communal meals and hands-on farm moments at harvest.',
    images: ['/images/experiences/harvest-celebrations.png'],
  },
];

export async function seedEventsIfEmpty() {
  const count = await Event.countDocuments();
  if (count > 0) return;

  const docs = SEED.map((ev, i) => ({
    ...ev,
    slug: slugify(ev.title) || `event-${i + 1}`,
    active: true,
  }));

  await Event.insertMany(docs);
  console.log(`Seeded ${docs.length} events`);
}
