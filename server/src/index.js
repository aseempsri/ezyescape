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
import { scheduleExpiryReminders } from './jobs/expiryReminders.js';
import { seedStaysIfEmpty } from './data/seedStays.js';
import { UPLOAD_DIR } from './config/upload.js';
import User from './models/User.js';

const {
  PORT = 3001,
  MONGODB_URI = 'mongodb://localhost:27017/ezyescape',
  FRONTEND_URL = 'http://localhost:5173',
} = process.env;

const app = express();

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
app.use('/api/admin', adminRoutes);

await connectDB(MONGODB_URI);
// Reconcile indexes — the legacy googleId index was required+unique; now it is
// sparse+unique so password accounts (no googleId) don't collide.
await User.syncIndexes().catch((err) => console.warn('User.syncIndexes failed:', err.message));
await seedStaysIfEmpty();

scheduleExpiryReminders();

app.listen(PORT, () => {
  console.log(`Ezy Escape API listening on http://localhost:${PORT}`);
});
