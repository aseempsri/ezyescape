import { Router } from 'express';
import { randomBytes, randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import PendingSignup from '../models/PendingSignup.js';
import { requireAuth, sessionIsLive, SESSION_IN_USE, signToken } from '../middleware/auth.js';
import { grantWelcomeBonus, syncCoins } from '../services/wallet.js';
import { mailChannelReady, sendMail } from '../config/mailer.js';
import { WELCOME_BONUS } from '../config/wallet.js';
import { rateLimit } from '../middleware/rateLimit.js';

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
    sameSite: 'lax',
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

async function beginSession(user) {
  user.sessionId = randomBytes(16).toString('hex');
  user.lastLoginAt = new Date();
  await user.save();
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
  return String(randomInt(0, 1000000)).padStart(6, '0');
}

function safeReturnPath(value) {
  const raw = String(value || '/').trim().slice(0, 200);
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\') || /[\u0000-\u001f]/.test(raw)) {
    return '/';
  }
  return raw;
}

const otpSendLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  key: (req) => `otp:${req.ip}:${String(req.body?.email || '').trim().toLowerCase()}`,
});

async function sendEmailOtp(email, code) {
  const subject = 'Your Ezy Escape sign-in code';
  const text = `Your Ezy Escape code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`;
  const html = `
    <div style="font-family:Georgia,serif;color:#1c2a3a;max-width:480px;margin:0 auto;padding:24px">
      <p style="letter-spacing:.14em;text-transform:uppercase;font-size:12px;color:#c47d0a;margin:0 0 12px">Ezy Escape</p>
      <h1 style="font-weight:500;font-size:28px;margin:0 0 12px">Your sign-in code</h1>
      <p style="line-height:1.5;margin:0 0 20px">Enter this code on Ezy Escape to continue. It expires in 10 minutes.</p>
      <p style="font-size:32px;letter-spacing:.28em;font-weight:700;margin:0 0 20px">${code}</p>
      <p style="color:#5c6b7a;font-size:14px;line-height:1.5;margin:0">If you did not request this, you can ignore this email.</p>
    </div>
  `;
  await sendMail({ to: email, subject, text, html, channel: 'info' });
  if (!mailChannelReady('info')) {
    console.log(`[otp] ${email} → ${code}`);
  }
}

async function activateWelcomeBonus(user) {
  if (user.welcomeBonusGranted) return 0;
  const bonus = await grantWelcomeBonus(user);
  return bonus.awarded ? bonus.amount ?? WELCOME_BONUS : 0;
}

// ── Email OTP auth (any inbox — Gmail, Outlook, and the rest) ──

async function stashEmailOtp({ email, name, mobile, purpose }) {
  const code = generateOtp();
  const otpHash = await bcrypt.hash(code, 10);
  await PendingSignup.findOneAndUpdate(
    { email },
    {
      email,
      name: name || '',
      mobile: mobile || '',
      purpose,
      otpHash,
      otpExpires: new Date(Date.now() + OTP_TTL_MS),
      otpAttempts: 0,
      expiresAt: new Date(Date.now() + PENDING_TTL_MS),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  await sendEmailOtp(email, code);
}

router.post('/signup', otpSendLimit, async (req, res) => {
  try {
    const name = (req.body.name || '').trim().slice(0, 80);
    const email = String(req.body.email || '').trim().toLowerCase();
    const mobile = normalizeMobile(req.body.mobile);

    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });
    if (mobile && !MOBILE_RE.test(mobile)) {
      return res.status(400).json({ error: 'Enter a valid 10-digit mobile number, or leave it blank.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      if (sessionIsLive(existing)) {
        return res.status(409).json({ error: SESSION_IN_USE });
      }
      // Same reply as a new signup, so the address cannot be used to list accounts.
      await stashEmailOtp({ email, name: existing.name, mobile: existing.mobile, purpose: 'login' });
      return res.json({ needsOtp: true, email });
    }

    // Nothing is written to `users` until the emailed code is confirmed.
    await stashEmailOtp({ email, name, mobile, purpose: 'signup' });
    return res.json({ needsOtp: true, email });
  } catch (err) {
    console.error('signup error', err);
    res.status(500).json({ error: 'Could not send the code. Please try again.' });
  }
});

router.post('/login', otpSendLimit, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address.' });

    const user = await User.findOne({ email });
    if (user) {
      if (sessionIsLive(user)) {
        return res.status(409).json({ error: SESSION_IN_USE });
      }
      await stashEmailOtp({ email, name: user.name, mobile: user.mobile, purpose: 'login' });
    }
    return res.json({ needsOtp: true, email });
  } catch (err) {
    console.error('login error', err);
    res.status(500).json({ error: 'Could not send the code. Please try again.' });
  }
});

router.post('/verify-otp', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  key: (req) => `otp-try:${req.ip}:${String(req.body?.email || '').trim().toLowerCase()}`,
}), async (req, res) => {
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

    let user = await User.findOne({ email });
    let created = false;
    if (!user) {
      if (pending.purpose === 'login') {
        return res.status(400).json({ error: 'No account found. Please sign up first.' });
      }
      user = await User.create({
        email: pending.email,
        name: pending.name || '',
        mobile: pending.mobile || '',
        authProvider: 'email',
        emailVerified: true,
      });
      created = true;
    } else if (pending.purpose === 'signup') {
      if (pending.name && !user.name) user.name = pending.name;
      if (pending.mobile && !user.mobile) user.mobile = pending.mobile;
      user.emailVerified = true;
    } else {
      user.emailVerified = true;
    }

    await PendingSignup.deleteOne({ email });

    if (!created && sessionIsLive(user)) {
      return res.status(409).json({ error: SESSION_IN_USE });
    }

    const welcome = created ? await activateWelcomeBonus(user) : 0;
    await beginSession(user);

    emitSession(res, user);
    res.json({ user: userJson(user), welcome });
  } catch (err) {
    console.error('verify-otp error', err);
    res.status(500).json({ error: 'Verification failed. Please try again.' });
  }
});

router.post('/resend-otp', otpSendLimit, async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const pending = await PendingSignup.findOne({ email });
    if (!pending) {
      return res.json({ needsOtp: true, email });
    }
    const code = generateOtp();
    pending.otpHash = await bcrypt.hash(code, 10);
    pending.otpExpires = new Date(Date.now() + OTP_TTL_MS);
    pending.otpAttempts = 0;
    pending.expiresAt = new Date(Date.now() + PENDING_TTL_MS);
    await pending.save();
    await sendEmailOtp(email, code);
    res.json({ needsOtp: true, email });
  } catch (err) {
    console.error('resend-otp error', err);
    res.status(500).json({ error: 'Could not resend the code. Please try again.' });
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
      const name = String(req.body.name).trim().slice(0, 80);
      if (!name) return res.status(400).json({ error: 'Please enter your name.' });
      user.name = name;
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

router.post('/logout', async (req, res) => {
  const token = req.cookies?.ezyescape_token;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload?.sub && payload?.sid) {
        await User.updateOne(
          { _id: payload.sub, sessionId: payload.sid },
          { $set: { sessionId: '' } }
        );
      }
    } catch {
      // An expired cookie can still be cleared.
    }
  }
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
    (req, res, next) => {
      const nonce = randomBytes(16).toString('hex');
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('ezyescape_oauth', nonce, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: 10 * 60 * 1000,
        path: '/',
      });
      const state = Buffer.from(JSON.stringify({
        returnTo: safeReturnPath(req.query.returnTo),
        nonce,
      }), 'utf8').toString('base64url');
      passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
        state,
      })(req, res, next);
    }
  );

  router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}?auth=failed` }),
    async (req, res) => {
      if (sessionIsLive(req.user)) {
        return res.redirect(`${process.env.FRONTEND_URL}?auth=already-in`);
      }
      await beginSession(req.user);
      const token = signToken(req.user, JWT_SECRET);
      res.cookie('ezyescape_token', token, cookieOptions());
      const welcome = req.user.welcomeAwarded ? '&welcome=500' : '';
      let returnTo = '/';
      try {
        const parsed = JSON.parse(Buffer.from(String(req.query.state || ''), 'base64url').toString('utf8'));
        const cookieNonce = req.cookies?.ezyescape_oauth;
        if (!cookieNonce || cookieNonce !== parsed?.nonce) {
          res.clearCookie('ezyescape_oauth', { path: '/' });
          return res.redirect(`${process.env.FRONTEND_URL}?auth=failed`);
        }
        returnTo = safeReturnPath(parsed?.returnTo);
      } catch {
        res.clearCookie('ezyescape_oauth', { path: '/' });
        return res.redirect(`${process.env.FRONTEND_URL}?auth=failed`);
      }
      res.clearCookie('ezyescape_oauth', { path: '/' });
      const hashIdx = returnTo.indexOf('#');
      const hash = hashIdx >= 0 ? returnTo.slice(hashIdx) : '';
      const pathAndQuery = hashIdx >= 0 ? returnTo.slice(0, hashIdx) : returnTo;
      const joiner = pathAndQuery.includes('?') ? '&' : '?';
      res.redirect(`${process.env.FRONTEND_URL}${pathAndQuery}${joiner}auth=success${welcome}${hash}`);
    }
  );

  return router;
}

export default router;
