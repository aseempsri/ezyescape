import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { connectDB } from './config/db.js';
import { configureGoogleAuth } from './routes/auth.js';
import walletRoutes from './routes/wallet.js';
import bookingRoutes from './routes/bookings.js';
import stayRoutes from './routes/stays.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import adsRoutes from './routes/ads.js';
import postcardRoutes, {
  findApprovedPostcard,
  shareHtmlForPostcard,
} from './routes/postcards.js';
import seoRoutes, {
  isSeoBot,
  handleStaticSeoPage,
  handleStaysIndexSeo,
  handleStaySeo,
  handleEventSeo,
} from './routes/seo.js';
import { scheduleExpiryReminders } from './jobs/expiryReminders.js';
import { scheduleBookingReminders } from './jobs/bookingReminders.js';
import { seedStaysIfEmpty } from './data/seedStays.js';
import { seedPostcardsIfEmpty } from './data/seedPostcards.js';
import { seedEventsIfEmpty } from './data/seedEvents.js';
import { UPLOAD_DIR } from './config/upload.js';
import User from './models/User.js';

const {
  PORT = 3001,
  MONGODB_URI = 'mongodb://localhost:27017/ezyescape',
  FRONTEND_URL = 'http://localhost:5173',
} = process.env;

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '200kb' }));
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.json({ ok: true, db: 'ezyescape' });
});

// Uploaded media. Scripts are blocked even if a file type check is bypassed.
app.use('/uploads', express.static(UPLOAD_DIR, {
  dotfiles: 'deny',
  index: false,
  setHeaders(res) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; media-src 'self'; style-src 'none'; script-src 'none'");
    res.setHeader('Content-Disposition', 'inline');
  },
}));

app.use('/auth', configureGoogleAuth());
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stays', stayRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/postcards', postcardRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/admin', adminRoutes);

// robots.txt + sitemap.xml (also reachable under /api/seo/* if needed)
app.use(seoRoutes);
app.use('/api/seo', seoRoutes);

/**
 * Pretty postcard URLs for social crawlers (proxied by nginx).
 * Browsers get the SPA via nginx try_files; bots hitting this route get OG HTML.
 */
app.get('/postcards/:id', async (req, res, next) => {
  if (!isSeoBot(req)) {
    return next();
  }
  try {
    const doc = await findApprovedPostcard(req.params.id);
    if (!doc) {
      return res.status(404).type('html').send('<!doctype html><title>Not found</title><p>Postcard not found.</p>');
    }
    res
      .status(200)
      .type('html')
      .set('Cache-Control', 'public, max-age=300')
      .send(shareHtmlForPostcard(req, doc));
  } catch (err) {
    next(err);
  }
});

/** Crawler-friendly HTML for key marketing routes (nginx proxies bots here). */
app.get('/', async (req, res, next) => {
  if (!isSeoBot(req)) return next();
  return handleStaticSeoPage(req, res, '/');
});

app.get('/stays', async (req, res, next) => {
  if (!isSeoBot(req)) return next();
  try {
    return await handleStaysIndexSeo(req, res);
  } catch (err) {
    next(err);
  }
});

app.get('/stays/:idOrSlug', async (req, res, next) => {
  if (!isSeoBot(req)) return next();
  try {
    return await handleStaySeo(req, res, req.params.idOrSlug);
  } catch (err) {
    next(err);
  }
});

app.get('/experiences/:idOrSlug', async (req, res, next) => {
  if (!isSeoBot(req)) return next();
  try {
    return await handleEventSeo(req, res, req.params.idOrSlug);
  } catch (err) {
    next(err);
  }
});

for (const path of ['/experiences', '/postcards', '/shop', '/partner', '/contact', '/policies', '/terms', '/privacy']) {
  app.get(path, async (req, res, next) => {
    if (!isSeoBot(req)) return next();
    return handleStaticSeoPage(req, res, path);
  });
}

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET must be a long random value (at least 32 characters).');
  process.exit(1);
}
const adminPassword = process.env.ADMIN_PASSWORD || '';
if (adminPassword.length < 16 || /admin|password|ezyescape/i.test(adminPassword)) {
  console.warn('ADMIN_PASSWORD is easy to guess. Replace it with a long random password in server/.env and on the live server.');
}

await connectDB(MONGODB_URI);
// Reconcile indexes — the legacy googleId index was required+unique; now it is
// sparse+unique so password accounts (no googleId) don't collide.
await User.syncIndexes().catch((err) => console.warn('User.syncIndexes failed:', err.message));
await seedStaysIfEmpty();
await seedPostcardsIfEmpty();
await seedEventsIfEmpty();

scheduleExpiryReminders();
scheduleBookingReminders();

app.use((err, _req, res, _next) => {
  const uploadRejected = err?.code === 'LIMIT_FILE_SIZE' || err?.code === 'LIMIT_FILE_COUNT' || err?.code === 'LIMIT_UNEXPECTED_FILE';
  if (uploadRejected || /JPEG|PNG|WEBP|GIF|MP4|WEBM/i.test(err?.message || '')) {
    return res.status(400).json({ error: 'Upload rejected. Use a smaller JPEG, PNG, WEBP, GIF, MP4, or WEBM file.' });
  }
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Something went wrong.' });
});

const server = app.listen(PORT, () => {
  console.log(`Ezy Escape API listening on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in server/.env.`);
    process.exit(1);
  }
  throw err;
});
