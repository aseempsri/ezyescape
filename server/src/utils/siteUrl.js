/** Public site origin for absolute share / OG URLs. */
export function siteOrigin(req) {
  // Prefer the public Host on the incoming request (WhatsApp crawler → ezyescape.com).
  if (req) {
    const host = String(req.get('x-forwarded-host') || req.get('host') || '')
      .split(',')[0]
      .trim();
    if (host && !/localhost|127\.0\.0\.1/i.test(host)) {
      const proto = String(req.get('x-forwarded-proto') || req.protocol || 'https')
        .split(',')[0]
        .trim();
      return `${proto}://${host}`.replace(/\/+$/, '');
    }
  }

  const site = (process.env.SITE_URL || '').replace(/\/+$/, '');
  if (site) return site;

  const frontend = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');
  if (frontend && !/localhost|127\.0\.0\.1/i.test(frontend)) return frontend;

  // Prefer the public production host for sitemap / robots when developing locally.
  return 'https://ezyescape.com';
}

export function absoluteUrl(req, path = '/') {
  const origin = siteOrigin(req);
  const clean = String(path || '/').startsWith('/') ? path : `/${path}`;
  return `${origin}${clean}`;
}
