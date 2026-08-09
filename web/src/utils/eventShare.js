import { getSiteOrigin } from './postcardShare';

/** Pretty experience detail URL for sharing. */
export function experiencePageUrl(slugOrId) {
  const base = import.meta.env.BASE_URL || '/';
  const prefix = base === '/' ? '' : base.replace(/\/+$/, '');
  return `${getSiteOrigin()}${prefix}/experiences/${encodeURIComponent(slugOrId)}`;
}

export function experienceShareUrl(event) {
  const key = event?.slug || event?.id;
  return experiencePageUrl(key);
}

export function experienceShareText(event) {
  const title = event?.title || 'an experience';
  const when = event?.dateLabel || [event?.month, event?.day].filter(Boolean).join(' ');
  const place = event?.place ? ` · ${event.place}` : '';
  const blurb = event?.desc ? `\n${event.desc}` : '';
  return `${title}${when ? ` — ${when}` : ''}${place}${blurb}\n\nBook / details on Ezy Escape:`;
}
