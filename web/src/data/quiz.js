export const QUESTIONS = [
  {
    q: 'Do you mind a short walk to your homestay?',
    hint: 'Some of our best homes are 5–15 minutes on foot from the road.',
    opts: [
      { e: '🥾', t: 'Happy to walk', v: 'trek' },
      { e: '🚗', t: 'Prefer road access', v: 'accessible' },
      { e: '🤷', t: 'Depends on the stay', v: 'mixed' },
    ],
  },
  {
    q: 'What kind of food makes you happy on a trip?',
    hint: 'This shapes which host families we match you with most.',
    opts: [
      { e: '🍲', t: 'Local home food', v: 'culture' },
      { e: '🥗', t: 'Mixed — whatever\'s available', v: 'mixed' },
      { e: '🍽️', t: 'Restaurant-style preferred', v: 'accessible' },
    ],
  },
  {
    q: 'How do you feel about local conversations?',
    hint: 'Some homes are very social. Some offer more privacy. Both are fine.',
    opts: [
      { e: '🤝', t: 'Love meeting locals', v: 'culture' },
      { e: '☕', t: 'Sometimes, when I feel like it', v: 'mixed' },
      { e: '🔇', t: 'I need my privacy', v: 'quiet' },
    ],
  },
  {
    q: 'What comfort matters most to you?',
    hint: 'Honest question — helps us set the right expectations upfront.',
    opts: [
      { e: '📶', t: 'Good WiFi', v: 'workation' },
      { e: '🌿', t: 'Quiet and peace', v: 'quiet' },
      { e: '🚘', t: 'Easy road access', v: 'accessible' },
      { e: '🏡', t: 'Warm host family', v: 'culture' },
    ],
  },
  {
    q: 'What does the ideal mountain morning look like?',
    hint: 'Final question — this reveals the most about your travel personality.',
    opts: [
      { e: '🌄', t: 'Sunrise tea with the family', v: 'culture' },
      { e: '📖', t: 'Reading by a window in silence', v: 'quiet' },
      { e: '💻', t: 'Early work done by 9am', v: 'workation' },
      { e: '🥾', t: 'Already two hours into a trail', v: 'trek' },
    ],
  },
];

export const RESULTS = {
  culture: {
    e: '🪨',
    type: 'Your Vibe',
    t: 'The Cultural Explorer',
    d: 'You\'re here for the stories, food and people. We\'ll match you with hosts known for deep local interaction, traditional Kumaoni meals and genuine mountain hospitality.',
    tags: ['Kumaoni Family Home', 'Village Kitchen', 'Local Culture Evening'],
  },
  quiet: {
    e: '🌲',
    type: 'Your Vibe',
    t: 'The Silent Wanderer',
    d: 'You need silence, nature and space to breathe. The Quiet Pine Retreat and similar stays offer forest surroundings, minimal distraction and privacy fully respected.',
    tags: ['The Quiet Pine Retreat', 'Forest Walk', 'Sunrise Tea Spot'],
  },
  accessible: {
    e: '👨‍👩‍👧',
    type: 'Your Vibe',
    t: 'The Family Connector',
    d: 'You want comfort, safety and easy access. We\'ll match you with road-accessible, family-friendly homes with warm hosts and reliable amenities for all ages.',
    tags: ['Family Valley Stay', 'Farm-to-Table Meal', 'Road Access Stays'],
  },
  workation: {
    e: '💻',
    type: 'Your Vibe',
    t: 'The Workation Traveller',
    d: 'You need WiFi, quiet corners and a view that helps you think. Long-stay-friendly homes where work and mountains coexist without either suffering.',
    tags: ['Valley View Cottage', 'Workation Package', 'Long Stay Options'],
  },
  trek: {
    e: '🥾',
    type: 'Your Vibe',
    t: 'The Adventure Seeker',
    d: 'You want the trails not on Google Maps, the hidden waterfall, the home you had to earn. Trek-accessible homes in deeper locations with hosts who know the terrain.',
    tags: ['The Orchard Homestead', 'Hidden Waterfall Walk', 'Trek-Access Stays'],
  },
  mixed: {
    e: '✦',
    type: 'Your Vibe',
    t: 'The Open Traveller',
    d: 'You\'re adaptable and curious. You\'ll thrive in almost any of our homes. Let\'s get you talking to a trip curator who can narrow things down to your dates and region.',
    tags: ['Talk to a Trip Curator', 'Browse All Stays'],
  },
};

export function tallyAnswers(answers) {
  const sc = {};
  answers.forEach((v) => {
    sc[v] = (sc[v] || 0) + 1;
  });
  return Object.entries(sc).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mixed';
}
