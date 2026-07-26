import { Router } from 'express';
import mongoose from 'mongoose';
import Stay from '../models/Stay.js';
import { serializeStay } from '../utils/stayPricing.js';
import { absoluteUrl, siteOrigin } from '../utils/siteUrl.js';
import { SEO_PAGES } from '../utils/seoPages.js';
import {
  staticPageSeoHtml,
  staySeoHtml,
  staysIndexSeoHtml,
} from '../utils/seoHtml.js';

const router = Router();

export const SOCIAL_BOT_RE =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|Discordbot|TelegramBot|Pinterest|Googlebot|bingbot|Applebot|Embedly|Quora Link Preview|Showyoubot|Outbrain|vkShare|W3C_Validator|redditbot|SkypeUriPreview|DuckDuckBot|YandexBot|Baiduspider/i;

export function isSeoBot(req) {
  const ua = req.get('user-agent') || '';
  return SOCIAL_BOT_RE.test(ua) || req.query.og === '1' || req.query.seo === '1';
}

function sendHtml(res, html, status = 200) {
  res
    .status(status)
    .type('html')
    .set('Cache-Control', 'public, max-age=300')
    .send(html);
}

router.get('/robots.txt', (_req, res) => {
  const origin = siteOrigin();
  // Allow postcard OG/share under /api/postcards/ — Facebook & WhatsApp refuse to
  // refresh previews for URLs blocked by Disallow: /api/
  const body = `User-agent: *
Allow: /
Allow: /api/postcards/
Disallow: /admin
Disallow: /profile
Disallow: /api/
Disallow: /auth/

User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: WhatsApp
Allow: /

Sitemap: ${origin}/sitemap.xml
`;
  res
    .type('text/plain')
    .set('Cache-Control', 'public, max-age=3600')
    .send(body);
});

router.get('/sitemap.xml', async (_req, res) => {
  try {
    const origin = siteOrigin().replace(/\/+$/, '');
    const stays = await Stay.find({ active: true }).select('slug updatedAt createdAt title').sort({ createdAt: 1 });

    const urls = [];

    for (const [path, meta] of Object.entries(SEO_PAGES)) {
      urls.push({
        loc: `${origin}${path === '/' ? '/' : path}`,
        changefreq: meta.changefreq || 'monthly',
        priority: meta.priority ?? 0.5,
      });
    }

    for (const stay of stays) {
      const slug = stay.slug || String(stay._id);
      const lastmod = (stay.updatedAt || stay.createdAt || new Date()).toISOString().slice(0, 10);
      urls.push({
        loc: `${origin}/stays/${encodeURIComponent(slug)}`,
        changefreq: 'weekly',
        priority: 0.9,
        lastmod,
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${Number(u.priority).toFixed(1)}</priority>
  </url>`)
  .join('\n')}
</urlset>
`;

    res
      .type('application/xml')
      .set('Cache-Control', 'public, max-age=600')
      .send(xml);
  } catch (err) {
    res.status(500).type('text/plain').send('Sitemap unavailable');
  }
});

/** Crawler HTML for static marketing paths. */
export async function handleStaticSeoPage(req, res, pathname) {
  const html = staticPageSeoHtml(req, pathname);
  if (!html) return res.status(404).type('html').send('<!doctype html><title>Not found</title>');
  return sendHtml(res, html);
}

/** Crawler HTML for /stays index with live listings. */
export async function handleStaysIndexSeo(req, res) {
  const stays = await Stay.find({ active: true }).sort({ createdAt: 1 });
  return sendHtml(res, staysIndexSeoHtml(req, stays.map(serializeStay)));
}

/** Crawler HTML for a single stay. */
export async function handleStaySeo(req, res, idOrSlug) {
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }], active: true }
    : { slug: idOrSlug, active: true };

  const stay = await Stay.findOne(query);
  if (!stay) {
    return res.status(404).type('html').send('<!doctype html><title>Stay not found</title><p>Stay not found.</p>');
  }
  return sendHtml(res, staySeoHtml(req, serializeStay(stay)));
}

export default router;
