import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

export function signToken(user, secret) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email, sid: user.sessionId },
    secret,
    { expiresIn: '7d' }
  );
}

export function sessionIsLive(user) {
  if (!user?.sessionId || !user?.lastLoginAt) return false;
  return Date.now() - new Date(user.lastLoginAt).getTime() < SESSION_MS;
}

export const SESSION_IN_USE = 'This account is already signed in on another browser. Sign out there first.';

function clearSessionCookie(res) {
  res.clearCookie('ezyescape_token', { path: '/' });
}

export async function requireAuth(req, res, next) {
  const token = req.cookies?.ezyescape_token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).select('sessionId');
    if (!user || !payload.sid || payload.sid !== user.sessionId) {
      clearSessionCookie(res);
      const taken = Boolean(user?.sessionId) && payload.sid !== user.sessionId;
      return res.status(401).json({
        error: taken ? SESSION_IN_USE : 'Please sign in again.',
        code: taken ? 'session_taken' : 'session_expired',
      });
    }
    req.user = payload;
    next();
  } catch {
    clearSessionCookie(res);
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
