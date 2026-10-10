import Event from '../models/Event.js';

const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** Start of today in UTC (calendar day). */
export function startOfTodayUtc(now = new Date()) {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** Resolve an event's start instant from startDate / dateLabel / month+day. */
export function resolveEventStartDate(ev, now = new Date()) {
  if (ev?.startDate) {
    const d = new Date(ev.startDate);
    if (!Number.isNaN(d.getTime())) return d;
  }

  const labeled = String(ev?.dateLabel || ev?.date || '').trim();

  // "14 Mar 2025"
  const full = labeled.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (full) {
    const mi = MONTHS[full[2].toLowerCase()];
    if (mi != null) return new Date(Date.UTC(Number(full[3]), mi, Number(full[1])));
  }

  // "Sep 14" or "Sep 14, 2025"
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

/**
 * Date wins when we can resolve one.
 * Stored status is only a fallback when there is no usable date.
 */
export function isEventDatePast(ev, now = new Date()) {
  const start = resolveEventStartDate(ev, now);
  if (start) return start.getTime() < startOfTodayUtc(now).getTime();
  return String(ev?.status || '').toLowerCase() === 'past';
}

/** Effective list status after date check. */
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

/** Status to persist from a startDate (keeps "live" when still current). */
export function statusFromStartDate(startDate, currentStatus = 'upcoming', now = new Date()) {
  if (!startDate) return currentStatus;
  const d = new Date(startDate);
  if (Number.isNaN(d.getTime())) return currentStatus;
  if (d.getTime() < startOfTodayUtc(now).getTime()) return 'past';
  const s = String(currentStatus || 'upcoming').toLowerCase();
  if (s === 'past') return 'upcoming';
  return s === 'live' ? 'live' : 'upcoming';
}

/** Past-card date text, preferring a year when we have startDate. */
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

/**
 * Keep DB status aligned with startDate:
 * - expired live/upcoming → past
 * - future-dated past → upcoming
 */
export async function syncEventStatusesFromDates(now = new Date()) {
  const today = startOfTodayUtc(now);
  try {
    await Promise.all([
      Event.updateMany(
        {
          active: true,
          status: { $in: ['live', 'upcoming'] },
          startDate: { $ne: null, $lt: today },
        },
        { $set: { status: 'past' } },
      ),
      Event.updateMany(
        {
          active: true,
          status: 'past',
          startDate: { $ne: null, $gte: today },
        },
        { $set: { status: 'upcoming' } },
      ),
    ]);
  } catch {
    /* listing still filters by date below */
  }
}

/** @deprecated use syncEventStatusesFromDates */
export async function promoteExpiredEvents(now = new Date()) {
  return syncEventStatusesFromDates(now);
}
