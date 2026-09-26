const buckets = new Map();

function prune(now, windowMs) {
  if (buckets.size < 4000) return;
  for (const [key, hits] of buckets) {
    const fresh = hits.filter((t) => now - t < windowMs);
    if (fresh.length === 0) buckets.delete(key);
    else buckets.set(key, fresh);
  }
}

/** Small in-memory limiter. Enough to stop OTP guessing, mail floods, and upload spam. */
export function rateLimit({ windowMs, max, key }) {
  return (req, res, next) => {
    const now = Date.now();
    const id = key(req);
    const hits = (buckets.get(id) || []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      const retry = Math.ceil((windowMs - (now - hits[0])) / 1000);
      res.set('Retry-After', String(Math.max(retry, 1)));
      return res.status(429).json({ error: 'Too many requests. Please wait and try again.' });
    }
    hits.push(now);
    buckets.set(id, hits);
    prune(now, windowMs);
    next();
  };
}
