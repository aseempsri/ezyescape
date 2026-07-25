/** Shared marketing-page SEO copy for crawler HTML + client meta. */

export const SITE_NAME = 'Ezy Escape';
export const DEFAULT_OG_IMAGE = '/images/og-share.jpg';

export const SEO_PAGES = {
  '/': {
    title: 'Ezy Escape — Curated Mountain Homestays in Kumaon',
    description:
      'Discover authentic mountain homestays in Almora, Ranikhet, Nainital and Kausani — matched to how you travel, hosted by local families.',
    priority: 1,
    changefreq: 'weekly',
    body: `
      <h1>Ezy Escape — Curated mountain homestays in Kumaon</h1>
      <p>Authentic mountain homes hosted by local families across Almora, Ranikhet, Nainital Hills and Kausani. Slow travel, village kitchens, forest walks, and stays matched to how you actually travel.</p>
      <ul>
        <li><a href="/stays">Browse mountain homestays</a></li>
        <li><a href="/experiences">Experiences &amp; festivals</a></li>
        <li><a href="/postcards">Guest postcards</a></li>
        <li><a href="/partner">Partner with us</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    `,
  },
  '/stays': {
    title: 'Mountain Homestays in Kumaon &amp; Uttarakhand | Ezy Escape',
    description:
      'Browse curated Kumaon homestays — quiet forest cottages, family valley homes, and Almora stays with hosts who know the hills.',
    priority: 0.95,
    changefreq: 'weekly',
    body: `
      <h1>Mountain homestays in Kumaon</h1>
      <p>Every listing is a lived-in home — not a hotel grid. Filter quiet forest stays, family-friendly homes, and road-accessible cottages across Uttarakhand.</p>
    `,
  },
  '/experiences': {
    title: 'Village Kitchen, Forest Walks &amp; Hill Festivals | Ezy Escape',
    description:
      'Immersive experiences with your homestay — village kitchen cooking, sunrise tea, forest walks, Holi in the hills, bonfire nights and more.',
    priority: 0.85,
    changefreq: 'monthly',
    body: `
      <h1>Experiences in the hills</h1>
      <p>From village kitchen evenings and farm-to-table meals to forest walks, sunrise yoga, folk music and regional festivals — your stay can be more than a room.</p>
    `,
  },
  '/postcards': {
    title: 'Guest Postcards from the Ridge | Ezy Escape',
    description:
      'Notes and photos from travellers who stayed in Kumaon mountain homes — real stories from Almora, Ranikhet and beyond.',
    priority: 0.8,
    changefreq: 'daily',
    body: `
      <h1>Postcards from the ridge</h1>
      <p>Guest stories and photos from mountain homestays across Kumaon — quiet mornings, host families, and trails that start behind the house.</p>
    `,
  },
  '/shop': {
    title: 'Shop Local Crafts &amp; Support Hill Communities | Ezy Escape',
    description:
      'Shop with us — handloom, nature classrooms and heritage grains that fund livelihoods across Kumaon.',
    priority: 0.7,
    changefreq: 'monthly',
    body: `
      <h1>Shop with us</h1>
      <p>Bring a piece of the hills home while supporting handloom weavers, nature classrooms and seed banks across Kumaon.</p>
    `,
  },
  '/partner': {
    title: 'List Your Mountain Homestay | Partner With Ezy Escape',
    description:
      'Host families: list your Kumaon home on Ezy Escape — story-led property pages, booking flow, and travellers matched to your place.',
    priority: 0.75,
    changefreq: 'monthly',
    body: `
      <h1>Partner with Ezy Escape</h1>
      <p>List a mountain home with a cinematic, story-led page — gallery, moments, directions and booking that matches the rest of Ezy Escape.</p>
    `,
  },
  '/contact': {
    title: 'Contact Ezy Escape | Plan a Mountain Homestay',
    description:
      'Talk to a human about Kumaon homestays, availability, transfers from Kathgodam, or partnering your home with Ezy Escape.',
    priority: 0.7,
    changefreq: 'yearly',
    body: `
      <h1>Contact Ezy Escape</h1>
      <p>Questions about mountain homestays, availability, or listing your home? Reach the Ezy Escape team — we reply like hosts, not a ticket queue.</p>
    `,
  },
};

export function organizationJsonLd(origin) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    url: origin,
    description:
      'Curated mountain homestays in Kumaon, matched to how travellers actually travel.',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Kumaon, Uttarakhand, India',
    },
    sameAs: [],
  };
}

export function lodgingJsonLd(origin, stay) {
  const url = `${origin}/stays/${encodeURIComponent(stay.slug || stay.id)}`;
  const images = (stay.images?.length ? stay.images : stay.image ? [stay.image] : [])
    .map((src) => (String(src).startsWith('http') ? src : `${origin}${src.startsWith('/') ? '' : '/'}${src}`));

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: stay.title,
    description: stay.description || stay.story || '',
    url,
    image: images.slice(0, 5),
    address: {
      '@type': 'PostalAddress',
      addressLocality: stay.location || 'Kumaon',
      addressRegion: 'Uttarakhand',
      addressCountry: 'IN',
    },
    numberOfRooms: stay.rooms || undefined,
    petsAllowed: false,
    priceRange: stay.finalPrice || stay.price
      ? `₹${stay.finalPrice || stay.price}+ per night`
      : undefined,
  };
}

export function breadcrumbJsonLd(origin, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}
