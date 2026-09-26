import { createHash, timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';

export function secretsMatch(input, expected) {
  const a = createHash('sha256').update(String(input || '')).digest();
  const b = createHash('sha256').update(String(expected || '')).digest();
  return timingSafeEqual(a, b);
}

export function signAdminToken(secret) {
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: '12h' });
}

export function adminCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 12 * 60 * 60 * 1000,
    path: '/',
  };
}

export function requireAdmin(req, res, next) {
  const token = req.cookies?.ezyescape_admin;
  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('Not admin');
    req.admin = payload;
    next();
  } catch {
    res.clearCookie('ezyescape_admin', { path: '/' });
    return res.status(401).json({ error: 'Invalid or expired admin session' });
  }
}
