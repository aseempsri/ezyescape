/** Client-side event date helpers — keep Upcoming / Past lists honest. */

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function startOfTodayUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

export function resolveEventStartDate(ev, now = new Date()) {
  if (ev?.startDate) {
    const d = new Date(ev.startDate);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const labeled = String(ev?.dateLabel || ev?.date || '').trim();

  const full = labeled.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (full) {
    const mi = MONTHS[full[2].toLowerCase()];
    if (mi != null) return new Date(Date.UTC(Number(full[3]), mi, Number(full[1])));
  }

  const md = labeled.match(/^([A-Za-z]{3})\s+(\d{1,2})(?:,?\s*(\d{4}))?$/);
  if (md) {
    const mi = MONTHS[md[1].toLowerCase()];
    if (mi != null) {
      const year = md[3] ? Number(md[3]) : now.getUTCFullYear();
      return new Date(Date.UTC(year, mi, Number(md[2])));
    }
  }

  const monthKey = String(ev?.month || '').slice(0, 3).toLowerCase();
  const day = Number(ev?.day);
  if (monthKey && MONTHS[monthKey] != null && day > 0) {
    return new Date(Date.UTC(now.getUTCFullYear(), MONTHS[monthKey], day));
  }

  return null;
}

/** Date wins when resolvable; stored status is only a fallback. */
export function isEventDatePast(ev, now = new Date()) {
  const start = resolveEventStartDate(ev, now);
  if (start) return start.getTime() < startOfTodayUtc(now).getTime();
  return String(ev?.status || '').toLowerCase() === 'past';
}

export function effectiveEventStatus(ev, now = new Date()) {
  const start = resolveEventStartDate(ev, now);
  if (start) {
    if (start.getTime() < startOfTodayUtc(now).getTime()) return 'past';
    const s = String(ev?.status || 'upcoming').toLowerCase();
    return s === 'live' ? 'live' : 'upcoming';
  }
  const s = String(ev?.status || 'upcoming').toLowerCase();
  if (s === 'past') return 'past';
  return s === 'live' ? 'live' : 'upcoming';
}

export function formatPastDateLabel(ev, now = new Date()) {
  const labeled = String(ev?.dateLabel || ev?.date || '').trim();
  if (labeled && /\d{4}/.test(labeled)) return labeled;

  const start = resolveEventStartDate(ev, now);
  if (start) {
    return start.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  return labeled;
}

/** Split a mixed list into upcoming vs past by date. */
export function partitionEventsByDate(events, now = new Date()) {
  const upcoming = [];
  const past = [];
  for (const ev of events || []) {
    if (isEventDatePast(ev, now)) past.push(ev);
    else upcoming.push(ev);
  }
  upcoming.sort((a, b) => {
    const da = resolveEventStartDate(a, now)?.getTime() || 0;
    const db = resolveEventStartDate(b, now)?.getTime() || 0;
    return da - db;
  });
  past.sort((a, b) => {
    const da = resolveEventStartDate(a, now)?.getTime() || 0;
    const db = resolveEventStartDate(b, now)?.getTime() || 0;
    return db - da;
  });
  return { upcoming, past };
}
