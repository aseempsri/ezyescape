import { useEffect } from 'react';

const SITE_NAME = 'Ezy Escape';
const DEFAULT_DESCRIPTION =
  'Discover authentic mountain homes hosted by local families in Kumaon — matched to how you actually travel.';
const DEFAULT_IMAGE = 'https://ezyescape.com/images/og-share.jpg';

function absoluteUrl(path = '/') {
  if (typeof window === 'undefined') return `https://ezyescape.com${path}`;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = window.location.origin;
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  // Prefer production host for canonical/OG when developing on localhost.
  if (/localhost|127\.0\.0\.1/i.test(origin)) {
    return `https://ezyescape.com${clean === '/' ? '/' : clean}`;
  }
  return `${origin}${base && clean.startsWith(base) ? '' : base}${clean === '/' ? (base || '/') : clean}`;
}

function absoluteImage(src) {
  if (!src) return DEFAULT_IMAGE;
  if (/^https?:\/\//i.test(src)) return src;
  return absoluteUrl(src.startsWith('/') ? src : `/${src}`);
}

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null) el.removeAttribute(k);
    else el.setAttribute(k, v);
  });
  return el;
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return el;
}

function upsertJsonLd(id, data) {
  const existing = document.getElementById(id);
  if (!data) {
    existing?.remove();
    return;
  }
  let el = existing;
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

/**
 * Keep document head in sync for SPA routes (browsers + JS-capable crawlers).
 */
export default function SeoHead({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '/',
  image,
  noindex = false,
  jsonLd,
  jsonLdId = 'seo-jsonld',
}) {
  useEffect(() => {
    const fullTitle = title || `${SITE_NAME} — Curated Mountain Homestays`;
    const pageUrl = absoluteUrl(path);
    const ogImage = absoluteImage(image);
    const prevTitle = document.title;

    document.title = fullTitle;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    });
    upsertLink('canonical', pageUrl);

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: pageUrl });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });

    upsertJsonLd(jsonLdId, jsonLd || null);

    return () => {
      document.title = prevTitle;
      upsertJsonLd(jsonLdId, null);
    };
  }, [title, description, path, image, noindex, jsonLd, jsonLdId]);

  return null;
}

export function organizationJsonLd() {
  const origin = 'https://ezyescape.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: SITE_NAME,
    url: origin,
    description: DEFAULT_DESCRIPTION,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Kumaon, Uttarakhand, India',
    },
  };
}

export function lodgingJsonLd(stay) {
  if (!stay) return null;
  const origin = 'https://ezyescape.com';
  const slug = stay.slug || stay.id;
  const images = (stay.images?.length ? stay.images : stay.image ? [stay.image] : []).map((src) =>
    absoluteImage(src)
  );

  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: stay.title,
    description: stay.description || stay.story || '',
    url: `${origin}/stays/${encodeURIComponent(slug)}`,
    image: images.slice(0, 5),
    address: {
      '@type': 'PostalAddress',
      addressLocality: stay.location || 'Kumaon',
      addressRegion: 'Uttarakhand',
      addressCountry: 'IN',
    },
    numberOfRooms: stay.rooms || undefined,
    priceRange: stay.price ? `₹${stay.price}+ per night` : undefined,
  };
}

export { DEFAULT_DESCRIPTION, DEFAULT_IMAGE, SITE_NAME };
