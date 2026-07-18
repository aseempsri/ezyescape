/** Mountain Matchmaker — questions, visuals, and vibe results. */

export const QUESTIONS = [
  {
    id: 'access',
    q: 'Do you mind a short walk to your homestay?',
    hint: 'Some of our best homes are 5–15 minutes on foot from the road.',
    scene:
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1600&q=80',
    sceneLabel: 'Mountain trails',
    opts: [
      {
        e: '🥾',
        t: 'Happy to walk',
        v: 'trek',
        img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🚗',
        t: 'Prefer road access',
        v: 'accessible',
        img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🤷',
        t: 'Depends on the stay',
        v: 'mixed',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'food',
    q: 'What kind of food makes you happy on a trip?',
    hint: 'This shapes which host families we match you with most.',
    scene:
      'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1600&q=80',
    sceneLabel: 'Home kitchen',
    opts: [
      {
        e: '🍲',
        t: 'Local home food',
        v: 'culture',
        img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🥗',
        t: "Mixed — whatever's available",
        v: 'mixed',
        img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🍽️',
        t: 'Restaurant-style preferred',
        v: 'accessible',
        img: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'social',
    q: 'How do you feel about local conversations?',
    hint: 'Some homes are very social. Some offer more privacy. Both are fine.',
    scene:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80',
    sceneLabel: 'Shared evenings',
    opts: [
      {
        e: '🤝',
        t: 'Love meeting locals',
        v: 'culture',
        img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '☕',
        t: 'Sometimes, when I feel like it',
        v: 'mixed',
        img: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🔇',
        t: 'I need my privacy',
        v: 'quiet',
        img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'comfort',
    q: 'What comfort matters most to you?',
    hint: 'Honest question — helps us set the right expectations upfront.',
    scene:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80',
    sceneLabel: 'Mountain comfort',
    opts: [
      {
        e: '📶',
        t: 'Good WiFi',
        v: 'workation',
        img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🌿',
        t: 'Quiet and peace',
        v: 'quiet',
        img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🚘',
        t: 'Easy road access',
        v: 'accessible',
        img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🏡',
        t: 'Warm host family',
        v: 'culture',
        img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'morning',
    q: 'What does the ideal mountain morning look like?',
    hint: 'Final question — this reveals the most about your travel personality.',
    scene:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    sceneLabel: 'Sunrise ridge',
    opts: [
      {
        e: '🌄',
        t: 'Sunrise tea with the family',
        v: 'culture',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '📖',
        t: 'Reading by a window in silence',
        v: 'quiet',
        img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '💻',
        t: 'Early work done by 9am',
        v: 'workation',
        img: 'https://images.unsplash.com/photo-1497215728101-856a8c0e7e9e?auto=format&fit=crop&w=600&q=80',
      },
      {
        e: '🥾',
        t: 'Already two hours into a trail',
        v: 'trek',
        img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export const RESULTS = {
  culture: {
    e: '🪨',
    type: 'Your Vibe',
    t: 'The Cultural Explorer',
    d: "You're here for the stories, food and people. We'll match you with hosts known for deep local interaction, traditional Kumaoni meals and genuine mountain hospitality.",
    tags: ['Kumaoni Family Home', 'Village Kitchen', 'Local Culture Evening'],
    img: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1200&q=80',
  },
  quiet: {
    e: '🌲',
    type: 'Your Vibe',
    t: 'The Silent Wanderer',
    d: 'You need silence, nature and space to breathe. Quiet pine retreats offer forest surroundings, minimal distraction and privacy fully respected.',
    tags: ['The Quiet Pine Retreat', 'Forest Walk', 'Sunrise Tea Spot'],
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
  },
  accessible: {
    e: '👨‍👩‍👧',
    type: 'Your Vibe',
    t: 'The Family Connector',
    d: "You want comfort, safety and easy access. We'll match you with road-accessible, family-friendly homes with warm hosts and reliable amenities for all ages.",
    tags: ['Family Valley Stay', 'Farm-to-Table Meal', 'Road Access Stays'],
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  workation: {
    e: '💻',
    type: 'Your Vibe',
    t: 'The Workation Traveller',
    d: 'You need WiFi, quiet corners and a view that helps you think. Long-stay-friendly homes where work and mountains coexist without either suffering.',
    tags: ['Valley View Cottage', 'Workation Package', 'Long Stay Options'],
    img: 'https://images.unsplash.com/photo-1497215728101-856a8c0e7e9e?auto=format&fit=crop&w=1200&q=80',
  },
  trek: {
    e: '🥾',
    type: 'Your Vibe',
    t: 'The Adventure Seeker',
    d: 'You want the trails not on Google Maps, the hidden waterfall, the home you had to earn. Trek-accessible homes with hosts who know the terrain.',
    tags: ['The Orchard Homestead', 'Hidden Waterfall Walk', 'Trek-Access Stays'],
    img: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
  },
  mixed: {
    e: '✦',
    type: 'Your Vibe',
    t: 'The Open Traveller',
    d: "You're adaptable and curious. You'll thrive in almost any of our homes. Talk to a trip curator who can narrow things down to your dates and region.",
    tags: ['Talk to a Trip Curator', 'Browse All Stays'],
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
  },
};

export function tallyAnswers(answers) {
  const sc = {};
  answers.forEach((v) => {
    sc[v] = (sc[v] || 0) + 1;
  });
  return Object.entries(sc).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
}
