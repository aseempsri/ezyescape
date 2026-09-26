function allowedHosts() {
  const fromEnv = String(process.env.ALLOWED_HOSTS || 'ezyescape.com,www.ezyescape.com')
    .split(',')
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...fromEnv, 'localhost', '127.0.0.1']);
}

/** Public site origin. Host headers are ignored unless they are on the allow list. */
export function siteOrigin(req) {
  if (req) {
    const host = String(req.get('x-forwarded-host') || req.get('host') || '')
      .split(',')[0]
      .trim()
      .toLowerCase();
    const hostname = host.replace(/:\d+$/, '');
    if (host && allowedHosts().has(hostname)) {
      const local = hostname === 'localhost' || hostname === '127.0.0.1';
      const proto = local ? 'http' : 'https';
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
