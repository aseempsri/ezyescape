import { STAYS } from '../data/stays';

export const STAY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'quiet', label: 'Quiet' },
  { id: 'family', label: 'Family' },
  { id: 'forest', label: 'Forest' },
  { id: 'accessible', label: 'Road Access' },
  { id: 'workation', label: 'Remote Work' },
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
    hosts: s.hosts || '',
    storyImage: s.storyImage || '',
    hostImage: s.hostImage || '',
    directions: s.directions || '',
    mapQuery: s.mapQuery || '',
    highlights: s.highlights || [],
  };
}

export const FALLBACK_STAYS = STAYS.map((s) => ({ ...s, disPrice: s.disPrice ?? null }));

/** Tokenize category tags for reliable filter matching. */
export function stayCatTokens(cat) {
  return String(cat || '')
    .toLowerCase()
    .split(/[\s,|/·•]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function stayMatchesFilter(cat, filter, stay = null) {
  if (!filter || filter === 'all') return true;
  const needle = String(filter).toLowerCase().trim();
  const tokens = stayCatTokens(cat);
  if (tokens.includes(needle)) return true;
  // Remote work also matches best-for copy when cat tag is missing.
  if (needle === 'workation' && stay) {
    const hay = `${stay.best || ''} ${stay.description || ''}`.toLowerCase();
    return /remote|workation|wifi|work[- ]?friendly|laptop/.test(hay);
  }
  // Legacy substring fallback (e.g. "quiet forest" contains "quiet")
  return tokens.some((t) => t.includes(needle) || needle.includes(t));
}

/** Card chip — prefer Remote work over guest capacity. */
export function stayCardChip(stay) {
  const best = String(stay?.best || '').toLowerCase();
  const cat = stayCatTokens(stay?.cat);
  if (
    cat.includes('workation')
    || /remote|workation|writers?|wifi/.test(best)
  ) {
    return { label: 'Remote work', kind: 'remote' };
  }
  if (cat.includes('family') || /famil/.test(best)) {
    return { label: 'Family stay', kind: 'family' };
  }
  if (cat.includes('quiet') || /solo|silence|quiet|nature/.test(best)) {
    return { label: 'Quiet retreat', kind: 'quiet' };
  }
  if (cat.includes('forest')) {
    return { label: 'Forest stay', kind: 'forest' };
  }
  return { label: 'Mountain home', kind: 'default' };
}

export function uniqueStayLocations(stays) {
  const seen = new Set();
  const list = [];
  stays.forEach((s) => {
    const loc = String(s.location || '').trim();
    if (!loc) return;
    const key = loc.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    list.push(loc);
  });
  return list.sort((a, b) => a.localeCompare(b));
}
