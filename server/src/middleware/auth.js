import jwt from 'jsonwebtoken';

export function signToken(user, secret) {
  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    secret,
    { expiresIn: '7d' }
  );
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.ezyescape_token;
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.clearCookie('ezyescape_token', { path: '/' });
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}
