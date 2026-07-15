import { Router } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import PendingSignup from '../models/PendingSignup.js';
import { requireAuth, signToken } from '../middleware/auth.js';
import { grantWelcomeBonus, syncCoins } from '../services/wallet.js';
import { sendWhatsappOtp, toE164 } from '../config/whatsapp.js';
import { WELCOME_BONUS } from '../config/wallet.js';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9]{10}$/;
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const PENDING_TTL_MS = 30 * 60 * 1000; // pending signup lifetime
const OTP_MAX_ATTEMPTS = 5;

function cookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

function googleConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function emitSession(res, user) {
  const token = signToken(user, process.env.JWT_SECRET);
  res.cookie('ezyescape_token', token, cookieOptions());
}

function userJson(u) {
  return {
    id: u._id,
    email: u.email,
    name: u.name,
    avatar: u.avatar,
    mobile: u.mobile || '',
    emailVerified: u.emailVerified,
    authProvider: u.authProvider,
    ezyCoins: u.ezyCoins,
    welcomeBonusGranted: u.welcomeBonusGranted,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

function normalizeMobile(raw) {
  return String(raw || '').replace(/[\s()-]/g, '');
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function activateWelcomeBonus(user) {
  if (user.welcomeBonusGranted) return 0;
  const bonus = await grantWelcomeBonus(user);
  return bonus.awarded ? bonus.amount ?? WELCOME_BONUS : 0;
}

// ── Email + password auth ──

router.post('/signup', async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const mobile = normalizeMobile(req.body.mobile);
    const password = String(req.body.password || '');

    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (!MOBILE_RE.test(mobile)) return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Every signup must confirm via emailed OTP. Nothing is persisted to `users`
    // yet — stash the details in a pending record and email a code; the User is
    // only created once the code is verified.
    const code = generateOtp();
    const otpHash = await bcrypt.hash(code, 10);
    await PendingSignup.findOneAndUpdate(
      { email },
      {
        email,
        name,
        mobile,
        passwordHash,
        otpHash,
        otpExpires: new Date(Date.now() + OTP_TTL_MS),
        otpAttempts: 0,
        expiresAt: new Date(Date.now() + PENDING_TTL_MS),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await sendWhatsappOtp(toE164(mobile), code);
    return res.json({ needsOtp: true, email });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ error: 'Could not create account. Please try again.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const otp = String(req.body.otp || '').trim();

    const pending = await PendingSignup.findOne({ email });
    if (!pending) {
      return res.status(400).json({ error: 'No pending verification for this email.' });
    }
    if (!pending.otpExpires || pending.otpExpires < new Date()) {
      return res.status(400).json({ error: 'Code expired. Please request a new one.' });
    }
    if (pending.otpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    const ok = await bcrypt.compare(otp, pending.otpHash);
    if (!ok) {
      pending.otpAttempts += 1;
      await pending.save();
      return res.status(400).json({ error: 'Incorrect code. Please try again.' });
    }

    // OTP confirmed — now (and only now) persist the real account.
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email: pending.email,
        name: pending.name,
        mobile: pending.mobile,
        passwordHash: pending.passwordHash,
        authProvider: 'password',
        emailVerified: true,
      });
    }
    await PendingSignup.deleteOne({ email });

    const welcome = await activateWelcomeBonus(user);
    user.lastLoginAt = new Date();
    await user.save();

    emitSession(res, user);
    res.json({ user: userJson(user), welcome });
  } catch (err) {
    console.error('verify-otp error', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

router.post('/resend-otp', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email });
    if (!pending) {
      return res.status(400).json({ error: 'No pending verification for this email.' });
    }
    const code = generateOtp();
    pending.otpHash = await bcrypt.hash(code, 10);
    pending.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    pending.otpAttempts = 0;
    pending.expiresAt = new Date(Date.now() + PENDING_TTL_MS);
    await pending.save();
    await sendWhatsappOtp(toE164(pending.mobile), code);
    res.json({ needsOtp: true, email });
  } catch (err) {
    console.error('resend-otp error', err);
    res.status(500).json({ error: 'Could not resend the code. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) {
      if (user && user.googleId) {
        return res.status(401).json({ error: 'This email is registered with Google. Use “Continue with Google”.' });
      }
      return res.status(401).json({ error: 'No account found. Please sign up first.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password.' });

    user.lastLoginAt = new Date();
    await user.save();
    emitSession(res, user);
    res.json({ user: userJson(user) });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Sign in failed. Please try again.' });
  }
});

// ── Session + profile ──

router.get('/me', requireAuth, async (req, res) => {
  await syncCoins(req.user.sub);
  const user = await User.findById(req.user.sub).select('-__v -passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(userJson(user));
});

router.patch('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.name !== undefined) {
      user.name = String(req.body.name).trim();
    }
    if (req.body.mobile !== undefined) {
      const mobile = normalizeMobile(req.body.mobile);
      if (mobile && !MOBILE_RE.test(mobile)) {
        return res.status(400).json({ error: 'Enter a valid 10-digit mobile number.' });
      }
      user.mobile = mobile;
    }

    await user.save();
    res.json(userJson(user));
  } catch (err) {
    console.error('profile update error', err);
    res.status(500).json({ error: 'Could not update profile.' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('ezyescape_token', cookieOptions());
  res.json({ ok: true });
});

router.get('/status', (_req, res) => {
  res.json({ emailAuth: true, googleOAuth: googleConfigured() });
});

// ── Google OAuth (optional secondary method) ──

export function configureGoogleAuth() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env');
    return router;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Google account has no email'));
          }

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: email.toLowerCase() }] });
          let welcomeAwarded = false;

          if (!user) {
            user = await User.create({
              googleId: profile.id,
              email,
              name: profile.displayName,
              avatar: profile.photos?.[0]?.value,
              authProvider: 'google',
              emailVerified: true,
            });
            const bonus = await grantWelcomeBonus(user);
            welcomeAwarded = bonus.awarded;
          } else {
            user.googleId = user.googleId || profile.id;
            user.name = profile.displayName ?? user.name;
            user.avatar = profile.photos?.[0]?.value ?? user.avatar;
            user.emailVerified = true;
            user.lastLoginAt = new Date();
            await user.save();

            if (!user.welcomeBonusGranted) {
              const bonus = await grantWelcomeBonus(user);
              welcomeAwarded = bonus.awarded;
            }
          }

          user.welcomeAwarded = welcomeAwarded;
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}?auth=failed` }),
    (req, res) => {
      const token = signToken(req.user, JWT_SECRET);
      res.cookie('ezyescape_token', token, cookieOptions());
      const welcome = req.user.welcomeAwarded ? '&welcome=500' : '';
      res.redirect(`${process.env.FRONTEND_URL}?auth=success${welcome}`);
    }
  );

  return router;
}

export default router;
