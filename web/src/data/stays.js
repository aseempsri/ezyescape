const img = (folder, file) => `images/stays/${folder}/${file}`;

export const STAYS = [
  {
    id: 1,
    slug: 'aipan',
    cat: 'quiet culture accessible',
    location: 'Almora, Kumaon',
    title: 'Aipan',
    price: 1999,
    experienceTip: 1299,
    guest: 3,
    rooms: 1,
    image: img('aipan', '01-cover.jpg'),
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
    best: 'Couples · Culture lovers · Slow evenings',
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
  },
  {
    id: 2,
    slug: 'gulmohar',
    cat: 'family quiet accessible',
    location: 'Almora, Kumaon',
    title: 'Gulmohar',
    price: 2199,
    experienceTip: 1499,
    guest: 4,
    rooms: 1,
    image: img('gulmohar', '01-cover.jpg'),
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
    best: 'Couples · Small families · Quiet weekends',
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
  },
  {
    id: 3,
    slug: 'sanjh',
    cat: 'quiet accessible',
    location: 'Almora, Kumaon',
    title: 'Sanjh',
    price: 2499,
    experienceTip: 1499,
    guest: 4,
    rooms: 2,
    image: img('sanjh', '01-cover.jpg'),
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
    best: 'Couples · Friends · Calm getaways',
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
  },
  {
    id: 4,
    slug: 'virasat',
    cat: 'quiet culture accessible',
    location: 'Almora, Kumaon',
    title: 'Virasat',
    price: 1499,
    experienceTip: 999,
    guest: 4,
    rooms: 2,
    image: img('virasat', '01-cover.jpg'),
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
    best: 'Budget travellers · Friends · First hill trips',
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
  },
  {
    id: 5,
    slug: 'virasat-suite',
    cat: 'family quiet accessible',
    location: 'Almora, Kumaon',
    title: 'Virasat Suite',
    price: 1999,
    experienceTip: 1299,
    guest: 5,
    rooms: 1,
    image: img('virasat-suite', '01-cover.jpg'),
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
    best: 'Families · Longer stays · Extra space',
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
  },
];

export const MARQUEE_ITEMS = [
  'Home-Cooked Meals', 'Family Hosts', 'Village Walks',
  'Hidden Trails', 'Slow Travel', 'Digital Detox',
  'Sunrise Tea', 'Forest Stays', 'Local Stories',
  'Responsible Tourism', 'Community Impact', 'Mountain Silence',
  'Heartfelt Pricing', 'Book the home', 'Thank the experience',
];
