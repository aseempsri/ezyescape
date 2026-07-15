import jwt from 'jsonwebtoken';

export function signAdminToken(secret) {
  return jwt.sign({ role: 'admin' }, secret, { expiresIn: '12h' });
}

export function adminCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
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
