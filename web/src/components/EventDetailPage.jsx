import { useEffect, useState } from 'react';
import SiteChrome from './SiteChrome';
import EventShareMenu from './EventShareMenu';
import { fetchEvent } from '../lib/api';
import { experiencesPath, experiencePath } from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';
import '../styles/ads.css';
import '../styles/event-detail.css';

function withProtocol(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw) || raw.startsWith('/')) return raw;
  return `https://${raw}`;
}

/** Emphasize prices (₹…) and clock times (5:30 pm) inside copy. */
function highlightFacts(text) {
  const raw = String(text || '');
  if (!raw) return null;
  const parts = raw.split(/(₹[\d,]+(?:\.\d+)?|\d{1,2}:\d{2}\s*(?:am|pm))/gi);
  return parts.map((part, i) => {
    if (/^₹[\d,]+(?:\.\d+)?$/i.test(part) || /^\d{1,2}:\d{2}\s*(?:am|pm)$/i.test(part)) {
      return (
        <span key={`${part}-${i}`} className="ev-hl">
          {part}
        </span>
      );
    }
    return part;
  });
}

function Section({ title, body }) {
  if (!body) return null;
  return (
    <section className="ev-detail-block">
      <h2>{title}</h2>
      {String(body)
        .split(/\n+/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => (
          <p key={p.slice(0, 48)}>{highlightFacts(p)}</p>
        ))}
    </section>
  );
}

/** Per-event horizontal ad — same frame as portal AdSlot. */
function EventPageAd({ event }) {
  if (!event?.adEnabled) return null;

  const href = withProtocol(event.adLinkUrl);
  const alt = event.adAltText || 'Advertisement';
  const empty = !event.adMediaUrl;

  const media = empty ? (
    <div className="ezy-ad-placeholder" aria-hidden="true">
      <span>Advertisement</span>
    </div>
  ) : event.adMediaType === 'video' ? (
    <video
      className="ezy-ad-media"
      src={event.adMediaUrl}
      muted
      autoPlay
      loop
      playsInline
      aria-label={alt}
    />
  ) : (
    <img className="ezy-ad-media" src={event.adMediaUrl} alt={alt} loading="lazy" />
  );

  return (
    <aside
      className={`ezy-ad ezy-ad--horizontal${empty ? ' ezy-ad--empty' : ''}`}
      aria-label="Advertisement"
      data-ad-id={`event-${event.id || event.slug || 'ad'}`}
    >
      <p className="ezy-ad-label">Advertisement</p>
      <div className={`ezy-ad-frame${empty ? ' ezy-ad-frame--empty' : ''}`}>
        {!empty && href ? (
          <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="ezy-ad-link">
            {media}
          </a>
        ) : (
          media
        )}
      </div>
    </aside>
  );
}

export default function EventDetailPage({ idOrSlug }) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    fetchEvent(idOrSlug)
      .then((data) => {
        if (!active) return;
        if (!data) setError('Event not found');
        else setEvent(data);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Failed to load event');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [idOrSlug]);

  const cover = event?.img || event?.images?.[0] || '';
  const when =
    event?.dateLabel ||
    [event?.month, event?.day].filter(Boolean).join(' ') ||
    '';
  const path = experiencePath(event?.slug || idOrSlug);
  const bookHref = event?.waMessage
    ? whatsappChatUrl(event.waMessage)
    : whatsappChatUrl(`Hi Ezy Escape! I'd like to know more about ${event?.title || 'this experience'}.`);

  if (loading) {
    return (
      <SiteChrome title="Loading experience…" path={path}>
        <div className="ev-detail-page">
          <div className="container">
            <p className="ev-detail-status">Loading…</p>
          </div>
        </div>
      </SiteChrome>
    );
  }

  if (error || !event) {
    return (
      <SiteChrome title="Experience not found" path={experiencesPath()} noindex>
        <div className="ev-detail-page">
          <div className="container">
            <p className="ev-detail-status">{error || 'Event not found'}</p>
            <a href={experiencesPath()} className="btn btn-amber">
              Back to experiences
            </a>
          </div>
        </div>
      </SiteChrome>
    );
  }

  const description = (event.desc || event.details || '').slice(0, 160);
  const metaLine = [when, event.place, event.spots].filter(Boolean).join(' · ');
  const startsLine = metaLine
    ? `Starts — ${metaLine}`
    : when
      ? `Starts — ${when}`
      : '';

  return (
    <SiteChrome
      title={`${event.title} — Ezy Escape`}
      description={description}
      path={path}
      image={cover}
    >
      <div className="ev-detail-page">
        <div className="container ev-detail-inner">
          <a href={experiencesPath()} className="ev-detail-back">
            ← All experiences
          </a>

          <div className="ev-detail-hero">
            {cover ? <img src={cover} alt={event.title} /> : null}
            <div className="ev-detail-hero-copy">
              {event.tag ? <span className="ev-detail-tag">{event.tag}</span> : null}
              <h1>{event.title}</h1>
              {metaLine ? <p className="ev-detail-meta ev-detail-meta--hl">{metaLine}</p> : null}
              {event.desc ? <p className="ev-detail-lead">{event.desc}</p> : null}
            </div>
          </div>

          {event.images?.length > 1 ? (
            <div className="ev-detail-gallery">
              {event.images.slice(1).map((src) => (
                <img key={src} src={src} alt="" />
              ))}
            </div>
          ) : null}

          <div className="ev-detail-grid">
            <div className="ev-detail-main">
              <Section title="About this event" body={event.details || event.desc} />
              <Section title="Instructions" body={event.instructions} />
              <Section title="Guidelines" body={event.guidelines} />
              <Section title="Pricing" body={event.pricing} />
              <Section title="Location" body={event.locationDetails || event.place} />
            </div>

            <aside className="ev-detail-aside">
              <div className="ev-detail-card">
                <p className="ev-detail-card-kicker">
                  {event.status === 'past' ? 'Past gathering' : 'Reserve your spot'}
                </p>
                {startsLine ? (
                  <p className="ev-detail-card-when ev-detail-card-when--hl">{startsLine}</p>
                ) : null}
                {event.pricing ? (
                  <p className="ev-detail-card-price">{highlightFacts(event.pricing)}</p>
                ) : null}
                {event.status !== 'past' ? (
                  <a
                    className="btn btn-amber ev-detail-book"
                    href={bookHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book now
                  </a>
                ) : null}
                <EventShareMenu event={event} className="ev-detail-share" />
              </div>
            </aside>
          </div>
        </div>

        <EventPageAd event={event} />
      </div>
    </SiteChrome>
  );
}
