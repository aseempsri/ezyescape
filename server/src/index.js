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
} from './routes/seo.js';
import { scheduleExpiryReminders } from './jobs/expiryReminders.js';
import { seedStaysIfEmpty } from './data/seedStays.js';
import { seedPostcardsIfEmpty } from './data/seedPostcards.js';
import { UPLOAD_DIR } from './config/upload.js';
import User from './models/User.js';

const {
  PORT = 3001,
  MONGODB_URI = 'mongodb://localhost:27017/ezyescape',
  FRONTEND_URL = 'http://localhost:5173',
} = process.env;

const app = express();

app.set('trust proxy', 1);

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.json({ ok: true, db: 'ezyescape' });
});

// Serve uploaded images/videos.
app.use('/uploads', express.static(UPLOAD_DIR));

app.use('/auth', configureGoogleAuth());
app.use('/api/wallet', walletRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stays', stayRoutes);
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

for (const path of ['/experiences', '/postcards', '/shop', '/partner', '/contact']) {
  app.get(path, async (req, res, next) => {
    if (!isSeoBot(req)) return next();
    return handleStaticSeoPage(req, res, path);
  });
}

await connectDB(MONGODB_URI);
// Reconcile indexes — the legacy googleId index was required+unique; now it is
// sparse+unique so password accounts (no googleId) don't collide.
await User.syncIndexes().catch((err) => console.warn('User.syncIndexes failed:', err.message));
await seedStaysIfEmpty();
await seedPostcardsIfEmpty();

scheduleExpiryReminders();

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
