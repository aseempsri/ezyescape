import assetUrl from '../utils/assetUrl';

/** Experiences page — festivals & gatherings around mountain stays. */

export const PROPERTY_EXPERIENCES = [
  {
    id: 'holi',
    emoji: '🎨',
    title: 'Holi in the Hills',
    desc: 'Celebrate the festival of colours with host families — gulal, drums, and laughter echoing across the ridges.',
    tag: 'Festival',
    img: assetUrl('images/experiences/holi-in-the-hills.png'),
  },
  {
    id: 'diwali',
    emoji: '🪔',
    title: 'Diwali at the Homestay',
    desc: 'Diya-lit courtyards, sweets shared at one table, and mountain nights glowing softer than the city.',
    tag: 'Festival',
    img: assetUrl('images/experiences/diwali-at-the-homestay.png'),
  },
  {
    id: 'regional',
    emoji: '🛕',
    title: 'Regional Festivals',
    desc: 'Join village fairs, temple processions and seasonal celebrations that locals mark on the calendar — not tourists.',
    tag: 'Culture',
    img: assetUrl('images/experiences/regional-festivals.png'),
  },
  {
    id: 'therapy',
    emoji: '🌿',
    title: 'Group Therapy Sessions',
    desc: 'Guided circles for stillness and honest conversation — held outdoors, with mountains as the quiet backdrop.',
    tag: 'Wellness',
    img: assetUrl('images/experiences/group-therapy-sessions.png'),
  },
  {
    id: 'yoga',
    emoji: '🧘',
    title: 'Sunrise Yoga Circles',
    desc: 'Slow stretches and breathwork on the lawn or ridge as the valley wakes — open to solo travellers and small groups.',
    tag: 'Wellness',
    img: assetUrl('images/experiences/sunrise-yoga-circles.png'),
  },
  {
    id: 'bonfire',
    emoji: '🔥',
    title: 'Bonfire Story Nights',
    desc: 'Hosts and guests gather around the fire — folk tales, songs, and warm cups that stretch late into the cold.',
    tag: 'Evening',
    img: assetUrl('images/experiences/bonfire-story-nights.png'),
  },
  {
    id: 'folk',
    emoji: '🎶',
    title: 'Folk Music Evenings',
    desc: 'Local musicians, mountain instruments and shared rhythms — evenings that feel like a village living room.',
    tag: 'Music',
    img: assetUrl('images/experiences/folk-music-evenings.png'),
  },
  {
    id: 'harvest',
    emoji: '🌾',
    title: 'Harvest Celebrations',
    desc: 'Seasonal gatherings when the fields give back — communal meals, gratitude, and hands-on farm moments.',
    tag: 'Seasonal',
    img: assetUrl('images/experiences/harvest-celebrations.png'),
  },
];

/** Bookable upcoming gatherings (Experiences page). */
export const UPCOMING_EVENTS = [
  {
    id: 'up-yoga',
    month: 'SEP',
    day: '14',
    title: 'Sunrise Yoga Circle',
    desc: 'A gentle morning practice on a Ranikhet ridge — mats, chai, and valley light.',
    tag: 'Wellness',
    place: 'Ranikhet',
    spots: '8 spots left',
    img: assetUrl('images/experiences/upcoming-sunrise-yoga.png'),
    waMessage:
      "Hi Ezy Escape! I'd like to book a seat for Sunrise Yoga Circle (14 Sep, Ranikhet). Could you share availability and how to join?",
  },
  {
    id: 'up-folk',
    month: 'OCT',
    day: '05',
    title: 'Folk Music Evening',
    desc: 'Local musicians, shared dinner, and songs that belong to the hills.',
    tag: 'Music',
    place: 'Almora',
    spots: '12 spots left',
    img: assetUrl('images/experiences/upcoming-folk-music.png'),
    waMessage:
      "Hi Ezy Escape! I'm interested in booking the Folk Music Evening (5 Oct, Almora). Can you tell me more and reserve a spot?",
  },
  {
    id: 'up-diwali',
    month: 'OCT',
    day: '20',
    title: 'Diwali Homestay Gathering',
    desc: 'Diya lighting, sweets, and courtyard stories with a host family.',
    tag: 'Festival',
    place: 'Kausani',
    spots: '6 spots left',
    img: assetUrl('images/experiences/upcoming-diwali.png'),
    waMessage:
      "Hi Ezy Escape! I'd love to join the Diwali Homestay Gathering (20 Oct, Kausani). Please share details and how I can book.",
  },
  {
    id: 'up-bonfire',
    month: 'NOV',
    day: '09',
    title: 'Bonfire Story Night',
    desc: 'Firelight, folk tales, and warm cups under a clear mountain sky.',
    tag: 'Evening',
    place: 'Nainital Hills',
    spots: '10 spots left',
    img: assetUrl('images/experiences/upcoming-bonfire.png'),
    waMessage:
      "Hi Ezy Escape! I'd like to book Bonfire Story Night (9 Nov, Nainital Hills). Could you help me reserve a seat?",
  },
];
