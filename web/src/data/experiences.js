import assetUrl from '../utils/assetUrl';

/** Local Immersion experiences — custom photography. */

export const EXPERIENCES = [
  {
    id: 'kitchen',
    emoji: '🍳',
    title: 'Village Kitchen Experience',
    desc: 'Learn local recipes with the host family. Kumaoni dal, bhatt ki churkani and rotis on a wood fire. Take the recipe home.',
    tag: 'Taste',
    size: 'hero',
    img: assetUrl('images/experiences/village-kitchen.jpg'),
  },
  {
    id: 'sunrise',
    emoji: '🌄',
    title: 'Sunrise Tea Spot',
    desc: 'Tea and mountain views before anyone else is awake.',
    tag: 'Morning',
    size: 'md',
    img: assetUrl('images/experiences/sunrise-tea.jpg'),
  },
  {
    id: 'forest',
    emoji: '🌿',
    title: 'Forest Walk',
    desc: 'Trails known only to locals. Oak forests, rhododendron slopes.',
    tag: 'Trail',
    size: 'md',
    img: assetUrl('images/experiences/forest-walk.jpg'),
  },
  {
    id: 'farm',
    emoji: '🥬',
    title: 'Farm-to-Table Meal',
    desc: 'Eat what grows around the home. Seasonal, local, cooked by the family who grew it. Zero food miles.',
    tag: 'Harvest',
    size: 'lg',
    img: assetUrl('images/experiences/farm-to-table.jpg'),
  },
  {
    id: 'culture',
    emoji: '🎶',
    title: 'Local Culture Evening',
    desc: 'Stories, music and mountain traditions around a fire.',
    tag: 'Evening',
    size: 'md',
    img: assetUrl('images/experiences/local-culture.jpg'),
  },
  {
    id: 'waterfall',
    emoji: '💧',
    title: 'Hidden Waterfall Walk',
    desc: 'Not on Google Maps. Found only through local knowledge.',
    tag: 'Secret',
    size: 'md',
    img: assetUrl('images/experiences/hidden-waterfall.jpg'),
  },
];

export const IMMERSION_MOMENTS = [
  { emoji: '🔥', label: 'Bonfire nights' },
  { emoji: '🫖', label: 'Host family tea' },
  { emoji: '🥾', label: 'Local trails' },
  { emoji: '🌌', label: 'Star skies' },
  { emoji: '🏡', label: 'Village homes' },
];
