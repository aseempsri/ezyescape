/** Absolute site origin for share links (prod / preview / local). */
export function getSiteOrigin() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://ezyescape.com';
}

/** Pretty page where the postcard is viewed. */
export function postcardPageUrl(id) {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base === '/' ? '' : base.replace(/\/+$/, '');
  return `${getSiteOrigin()}${prefix}/postcards/${encodeURIComponent(id)}`;
}

/**
 * URL used for social crawlers / WhatsApp previews.
 * Served by the API with Open Graph tags + redirect to the pretty page.
 */
export function postcardShareUrl(id) {
  return `${getSiteOrigin()}/api/postcards/${encodeURIComponent(id)}/share`;
}

export function postcardShareText(postcard) {
  const name = postcard?.name || 'a traveller';
  const from = postcard?.from ? ` from ${postcard.from}` : '';
  return `Postcard from ${name}${from} — Ezy Escape`;
}
