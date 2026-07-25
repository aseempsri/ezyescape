import { absoluteUrl } from './siteUrl.js';
import {
  DEFAULT_OG_IMAGE,
  SEO_PAGES,
  SITE_NAME,
  breadcrumbJsonLd,
  lodgingJsonLd,
  organizationJsonLd,
} from './seoPages.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteAsset(req, pathOrUrl) {
  if (!pathOrUrl) return absoluteUrl(req, DEFAULT_OG_IMAGE);
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return absoluteUrl(req, pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`);
}

/** Full HTML document for search / social crawlers. */
export function seoDocument(req, {
  path = '/',
  title,
  description,
  image,
  jsonLd = [],
  bodyHtml = '',
  noindex = false,
}) {
  const pageUrl = absoluteUrl(req, path);
  const ogImage = absoluteAsset(req, image || DEFAULT_OG_IMAGE);
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const ldBlocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    .filter(Boolean)
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block)}</script>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${robots}" />
  <link rel="canonical" href="${escapeHtml(pageUrl)}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
  <meta property="og:url" content="${escapeHtml(pageUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(ogImage)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  ${ldBlocks}
</head>
<body style="font-family:Georgia,serif;background:#f7f3ed;color:#1c2a3a;line-height:1.6;max-width:42rem;margin:0 auto;padding:2rem 1.25rem;">
  <header>
    <p><a href="${escapeHtml(absoluteUrl(req, '/'))}">${escapeHtml(SITE_NAME)}</a> — curated mountain homestays in Kumaon</p>
  </header>
  <main>
    ${bodyHtml}
  </main>
  <footer style="margin-top:2.5rem;font-size:0.9rem;opacity:0.8;">
    <p><a href="${escapeHtml(pageUrl)}">View the full page on Ezy Escape</a></p>
  </footer>
</body>
</html>`;
}

export function staticPageSeoHtml(req, pathname) {
  const key = pathname === '' ? '/' : pathname;
  const page = SEO_PAGES[key];
  if (!page) return null;

  const origin = absoluteUrl(req, '/').replace(/\/$/, '');
  const jsonLd = [organizationJsonLd(origin)];
  if (key !== '/') {
    jsonLd.push(
      breadcrumbJsonLd(origin, [
        { name: 'Home', path: '/' },
        { name: page.title.split('|')[0].split('—')[0].trim(), path: key },
      ])
    );
  }

  return seoDocument(req, {
    path: key,
    title: page.title.replace(/&amp;/g, '&'),
    description: page.description,
    jsonLd,
    bodyHtml: page.body,
  });
}

export function staySeoHtml(req, stay) {
  const slug = stay.slug || String(stay.id || stay._id);
  const path = `/stays/${encodeURIComponent(slug)}`;
  const origin = absoluteUrl(req, '/').replace(/\/$/, '');
  const title = `${stay.title} | ${stay.location || 'Kumaon'} Homestay — Ezy Escape`;
  const description = String(stay.description || stay.story || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const image = stay.image || stay.images?.[0] || DEFAULT_OG_IMAGE;

  const story = escapeHtml(stay.story || '');
  const hosts = escapeHtml(stay.hosts || '');
  const directions = escapeHtml(stay.directions || '');
  const highlights = (stay.highlights || [])
    .map((h) => `<li>${escapeHtml(h)}</li>`)
    .join('');

  const bodyHtml = `
    <nav aria-label="Breadcrumb">
      <a href="${escapeHtml(absoluteUrl(req, '/'))}">Home</a> /
      <a href="${escapeHtml(absoluteUrl(req, '/stays'))}">Homestays</a> /
      <span>${escapeHtml(stay.title)}</span>
    </nav>
    <h1>${escapeHtml(stay.title)}</h1>
    <p><strong>${escapeHtml(stay.location || 'Kumaon')}</strong>
      ${stay.guests ? ` · Up to ${Number(stay.guests)} guests` : ''}
      ${stay.rooms ? ` · ${Number(stay.rooms)} rooms` : ''}
      ${stay.finalPrice || stay.price ? ` · from ₹${Number(stay.finalPrice || stay.price)} / night` : ''}
    </p>
    <p>${escapeHtml(description)}</p>
    ${story ? `<h2>Life inside this home</h2><p>${story.replace(/\n+/g, '</p><p>')}</p>` : ''}
    ${hosts ? `<h2>Who welcomes you in</h2><p>${hosts.replace(/\n+/g, '</p><p>')}</p>` : ''}
    ${highlights ? `<h2>At a glance</h2><ul>${highlights}</ul>` : ''}
    ${directions ? `<h2>How to reach</h2><p>${directions.replace(/\n+/g, '</p><p>')}</p>` : ''}
    <p><a href="${escapeHtml(absoluteUrl(req, path))}">Check availability on Ezy Escape</a></p>
  `;

  return seoDocument(req, {
    path,
    title,
    description: description || `${stay.title} — mountain homestay in ${stay.location || 'Kumaon'}.`,
    image,
    jsonLd: [
      lodgingJsonLd(origin, { ...stay, slug, id: stay.id || stay._id }),
      breadcrumbJsonLd(origin, [
        { name: 'Home', path: '/' },
        { name: 'Homestays', path: '/stays' },
        { name: stay.title, path },
      ]),
    ],
    bodyHtml,
  });
}

export function staysIndexSeoHtml(req, stays) {
  const page = SEO_PAGES['/stays'];
  const origin = absoluteUrl(req, '/').replace(/\/$/, '');
  const list = stays
    .map((s) => {
      const slug = s.slug || String(s.id);
      return `<li><a href="${escapeHtml(absoluteUrl(req, `/stays/${encodeURIComponent(slug)}`))}"><strong>${escapeHtml(s.title)}</strong> — ${escapeHtml(s.location || 'Kumaon')}</a>: ${escapeHtml((s.description || '').slice(0, 120))}</li>`;
    })
    .join('\n');

  return seoDocument(req, {
    path: '/stays',
    title: page.title.replace(/&amp;/g, '&'),
    description: page.description,
    jsonLd: [
      organizationJsonLd(origin),
      breadcrumbJsonLd(origin, [
        { name: 'Home', path: '/' },
        { name: 'Homestays', path: '/stays' },
      ]),
    ],
    bodyHtml: `${page.body}<ul>${list}</ul>`,
  });
}
