import { STAYS } from '../data/stays';

export const STAY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'quiet', label: 'Quiet' },
  { id: 'family', label: 'Family' },
  { id: 'forest', label: 'Forest' },
  { id: 'accessible', label: 'Road Access' },
];

export function normalizeApiStay(s) {
  return {
    id: s.id,
    slug: s.slug || s.id,
    cat: s.cat || '',
    location: s.location,
    title: s.title,
    disPrice: s.hasDiscount ? s.price : null,
    price: s.finalPrice,
    guest: s.guests,
    rooms: s.rooms,
    image: s.image,
    images: s.images || [],
    videos: s.videos || [],
    best: s.best || '',
    description: s.description || '',
    story: s.story || '',
    directions: s.directions || '',
    highlights: s.highlights || [],
  };
}

export const FALLBACK_STAYS = STAYS.map((s) => ({ ...s, disPrice: s.disPrice ?? null }));

export function stayMatchesFilter(cat, filter) {
  return filter === 'all' || String(cat || '').includes(filter);
}
