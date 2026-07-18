import assetUrl from '../utils/assetUrl';

/** Content for Stories + Shop With Us pages. */

export const GUEST_STORIES = [
  {
    id: 'priya-anand',
    name: 'Priya & Anand',
    from: 'Bengaluru',
    stay: 'The Quiet Pine Retreat',
    place: 'Ranikhet',
    emoji: '🌲',
    title: 'We came for silence. We left with a family.',
    excerpt:
      'Three days of pine air, handwritten recipes, and evenings that ended only when the fire did. Our host remembered how we take our tea by day two.',
    img: assetUrl('images/stories/priya-anand.jpg'),
    tags: ['Quiet', 'Forest', 'Long stay'],
  },
  {
    id: 'sara',
    name: 'Sara',
    from: 'Delhi',
    stay: 'The Orchard Homestead',
    place: 'Mukteshwar',
    emoji: '🍎',
    title: 'Workation without the loneliness.',
    excerpt:
      'I needed Wi‑Fi and a view that didn’t feel like a stock photo. I got both — plus apricot jam at breakfast and a trail that starts behind the house.',
    img: assetUrl('images/stories/sara-delhi.jpg'),
    tags: ['Workation', 'Orchard'],
  },
  {
    id: 'mehta',
    name: 'The Mehta Family',
    from: 'Mumbai',
    stay: 'Family Valley Stay',
    place: 'Almora',
    emoji: '👨‍👩‍👧',
    title: 'Kids learned dal. We learned to slow down.',
    excerpt:
      'Road access, warm hosts, and a kitchen that didn’t mind little helpers. It felt less like a booking and more like visiting relatives we hadn’t met yet.',
    img: assetUrl('images/stories/mehta-family.jpg'),
    tags: ['Family', 'Culture'],
  },
  {
    id: 'rohan',
    name: 'Rohan',
    from: 'Pune',
    stay: 'Trek-access cottage',
    place: 'Kumaon',
    emoji: '🥾',
    title: 'The waterfall wasn’t on Maps. The welcome was.',
    excerpt:
      'A short walk, a host who knew the ridge by heart, and a meal that tasted like the valley. Exactly the kind of stay Ezy Escape promised.',
    img: assetUrl('images/stories/rohan-pune.jpg'),
    tags: ['Trek', 'Hidden trail'],
  },
];

export const NGO_STORIES = [
  {
    id: 'wool-collective',
    ngo: 'Kumaon Wool Collective',
    title: 'Keeping handloom warm in the hills',
    excerpt:
      'Women artisans spin and weave wool from local flocks. Every purchase funds training for the next generation of weavers.',
    img: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1000&q=80',
    focus: 'Livelihoods',
  },
  {
    id: 'forest-school',
    ngo: 'Oak & Fern Forest School',
    title: 'Nature classrooms for village kids',
    excerpt:
      'Weekend forest walks and craft workshops teach ecology through play. Shop proceeds help keep the program free for local children.',
    img: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1000&q=80',
    focus: 'Education',
  },
  {
    id: 'seed-bank',
    ngo: 'Himalayan Seed Keepers',
    title: 'Saving heritage grains, one jar at a time',
    excerpt:
      'A community seed bank preserving millets and pulses that almost disappeared. Your order supports cataloguing and farmer exchanges.',
    img: 'https://images.unsplash.com/photo-1464226184886-fa4b0a6c5b8e?auto=format&fit=crop&w=1000&q=80',
    focus: 'Biodiversity',
  },
];

export const SHOP_PRODUCTS = [
  {
    id: 'wool-scarf',
    name: 'Handwoven Wool Scarf',
    ngo: 'Kumaon Wool Collective',
    price: 1800,
    desc: 'Soft hill wool, dyed with local plants. Each piece is slightly unique.',
    img: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=800&q=80',
    tag: 'Textile',
  },
  {
    id: 'apricot-oil',
    name: 'Cold-pressed Apricot Oil',
    ngo: 'Orchard Women Co-op',
    price: 650,
    desc: 'Pressed from Mukteshwar apricots. Small-batch bottles for skin and hair.',
    img: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80',
    tag: 'Wellness',
  },
  {
    id: 'millet-mix',
    name: 'Heritage Millet Mix',
    ngo: 'Himalayan Seed Keepers',
    price: 420,
    desc: 'A rotating mix of local millets with a simple recipe card from the keepers.',
    img: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    tag: 'Pantry',
  },
  {
    id: 'pine-notebook',
    name: 'Pine-pressed Journal',
    ngo: 'Oak & Fern Forest School',
    price: 550,
    desc: 'Handmade paper notebook. Proceeds fund forest classrooms.',
    img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    tag: 'Craft',
  },
  {
    id: 'copper-tumbler',
    name: 'Beaten Copper Tumbler',
    ngo: 'Almora Metals Guild',
    price: 1200,
    desc: 'Traditional copper work from a family workshop in Almora.',
    img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80',
    tag: 'Home',
  },
  {
    id: 'rhododendron-tea',
    name: 'Rhododendron Flower Tea',
    ngo: 'Village Kitchen Trust',
    price: 380,
    desc: 'Seasonal buransh petals, sun-dried. A cup that tastes like spring trails.',
    img: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=800&q=80',
    tag: 'Pantry',
  },
];
