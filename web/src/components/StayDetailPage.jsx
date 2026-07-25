import { useEffect, useMemo, useState } from 'react';
import SiteChrome from './SiteChrome';
import BookingForm from './BookingForm';
import { BookingSuccessToast } from './BookingFlow';
import { fetchStay } from '../lib/api';
import { STAYS } from '../data/stays';
import { appPath, staysIndexPath } from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';
import assetUrl from '../utils/assetUrl';
import { lodgingJsonLd } from './SeoHead';
import '../styles/stay-page.css';

const STORY_FALLBACK = assetUrl('images/experiences/village-kitchen.jpg');
const HOST_FALLBACK = assetUrl('images/experiences/local-culture.jpg');

function resolveStayAsset(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
  return assetUrl(url.replace(/^\//, ''));
}


function buildMedia(stay) {
  if (!stay) return [];
  const images = stay.images?.length ? stay.images : stay.image ? [stay.image] : [];
  return [
    ...images.map((url) => ({ type: 'image', url })),
    ...(stay.videos || []).map((url) => ({ type: 'video', url })),
  ];
}

function normalizeApiStay(s) {
  return {
    id: s.id,
    slug: s.slug || s.id,
    cat: s.cat || '',
    location: s.location,
    title: s.title,
    disPrice: s.hasDiscount ? s.price : null,
    price: s.finalPrice,
    guest: s.guests,
    rooms: s.rooms,
    image: s.image,
    images: s.images || [],
    videos: s.videos || [],
    best: s.best || '',
    description: s.description || '',
    story: s.story || '',
    hosts: s.hosts || '',
    storyImage: s.storyImage || '',
    hostImage: s.hostImage || '',
    directions: s.directions || '',
    mapQuery: s.mapQuery || '',
    highlights: s.highlights || [],
  };
}

function fallbackStay(idOrSlug) {
  const key = String(idOrSlug);
  const found = STAYS.find((s) => s.slug === key || String(s.id) === key);
  return found ? { ...found } : null;
}

function paragraphs(text) {
  return String(text || '')
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function highlightIcon(text) {
  const t = String(text).toLowerCase();
  if (/sunrise|view|balcony|mountain/.test(t)) return '🌄';
  if (/meal|food|cook|kitchen|kumaoni/.test(t)) return '🍲';
  if (/walk|trail|village|forest/.test(t)) return '🥾';
  if (/quiet|writer|work|workspace/.test(t)) return '✍️';
  if (/fire|bonfire|evening|culture|music/.test(t)) return '🔥';
  if (/tea|coffee/.test(t)) return '🫖';
  if (/star|night/.test(t)) return '🌌';
  return '✦';
}

export default function StayDetailPage({ idOrSlug }) {
  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [index, setIndex] = useState(0);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setIndex(0);

    fetchStay(idOrSlug)
      .then((data) => {
        if (!active) return;
        if (data) {
          setStay(normalizeApiStay(data));
        } else {
          const fb = fallbackStay(idOrSlug);
          if (fb) setStay(fb);
          else setNotFound(true);
        }
      })
      .catch(() => {
        if (!active) return;
        const fb = fallbackStay(idOrSlug);
        if (fb) setStay(fb);
        else setNotFound(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [idOrSlug]);

  const media = useMemo(() => buildMedia(stay), [stay]);
  const photos = useMemo(() => {
    if (!stay) return [];
    return stay.images?.length ? stay.images : stay.image ? [stay.image] : [];
  }, [stay]);

  useEffect(() => {
    if (!media.length) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % media.length);
      else if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + media.length) % media.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [media.length]);

  if (loading) {
    return (
      <SiteChrome title="Loading stay — Ezy Escape" path="/stays" noindex>
        <div className="stay-page">
          <div className="stay-page-status">
            <p>Loading stay…</p>
          </div>
        </div>
      </SiteChrome>
    );
  }

  if (notFound || !stay) {
    return (
      <SiteChrome title="Stay not found — Ezy Escape" path="/stays" noindex>
        <div className="stay-page">
          <div className="stay-page-status">
            <h1>Stay not found</h1>
            <p>This homestay may have been removed or the link is incorrect.</p>
            <a className="btn btn-amber" href={appPath()}>Back to home</a>
          </div>
        </div>
      </SiteChrome>
    );
  }

  const tags = (stay.cat || '').split(/\s+/).filter(Boolean);
  const current = media[index];
  const go = (dir) => setIndex((i) => (i + dir + media.length) % media.length);
  const storyParas = paragraphs(stay.story || (!stay.hosts ? stay.description : ''));
  const hostParas = paragraphs(stay.hosts);
  const locationParas = paragraphs(stay.directions);
  const waMessage = `Hi! I'm interested in "${stay.title}" (${stay.location}). Could you share availability and help me plan my stay?`;
  const heroBg = current?.type === 'image' ? current.url : photos[0] || stay.image;
  const storyVisual = resolveStayAsset(stay.storyImage) || STORY_FALLBACK;
  const hostVisual = resolveStayAsset(stay.hostImage) || resolveStayAsset(photos[2] || photos[0] || stay.image) || HOST_FALLBACK;
  const stayPathSeo = `/stays/${encodeURIComponent(stay.slug || stay.id)}`;
  const stayDescription = String(stay.description || stay.story || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);

  return (
    <SiteChrome
      title={`${stay.title} | ${stay.location || 'Kumaon'} Homestay — Ezy Escape`}
      description={stayDescription || `${stay.title} — mountain homestay in ${stay.location || 'Kumaon'}.`}
      path={stayPathSeo}
      image={stay.image || stay.images?.[0]}
      jsonLd={lodgingJsonLd(stay)}
    >
      <div className="stay-page">
        <div className="stay-narrative">
          <header className="stay-page-intro">
            <a href={staysIndexPath()} className="stay-back-link">← All stays</a>
            <p className="stay-hero-location">{stay.location}</p>
            <h1>{stay.title}</h1>
            {stay.description ? <p className="stay-page-intro-lead">{stay.description}</p> : null}
          </header>

          {storyParas.length > 0 && (
            <section className="stay-story">
              <div className="stay-story-visual" style={storyVisual ? { backgroundImage: `url('${storyVisual}')` } : undefined}>
                <div className="stay-story-visual-shade" />
                <p className="stay-story-kicker">The story</p>
                <h2>Life inside this home</h2>
              </div>
              <div className="stay-story-copy">
                {storyParas.map((p) => <p key={p.slice(0, 48)}>{p}</p>)}
              </div>
            </section>
          )}

          {hostParas.length > 0 && (
            <section className="stay-hosts">
              <div className="stay-hosts-copy">
                <div className="stay-section-head">
                  <p className="stay-eyebrow">The hosts</p>
                  <h2>Who welcomes you in</h2>
                </div>
                {hostParas.map((p) => <p key={p.slice(0, 48)}>{p}</p>)}
              </div>
              <div
                className="stay-hosts-visual"
                style={hostVisual ? { backgroundImage: `url('${hostVisual}')` } : undefined}
                aria-hidden="true"
              />
            </section>
          )}

          {(stay.location || locationParas.length > 0) && (
            <section className="stay-location">
              <div className="stay-section-head">
                <p className="stay-eyebrow">About the location</p>
                <h2>{stay.location || 'The hills around you'}</h2>
              </div>
              <div className="stay-location-split">
                <div className="stay-location-card stay-location-card--text">
                  <span className="stay-journey-icon" aria-hidden="true">🗺</span>
                  <div>
                    {locationParas.length > 0 ? (
                      locationParas.map((p) => <p key={p.slice(0, 48)}>{p}</p>)
                    ) : (
                      <p>
                        This stay sits in {stay.location} — a place shaped by mountain light, local rhythms, and the kind of quiet that makes days feel longer.
                      </p>
                    )}
                  </div>
                </div>
                <a
                  className="stay-location-card stay-location-card--map"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stay.mapQuery || stay.location || 'Kumaon')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${stay.location || 'location'} in Google Maps`}
                >
                  <iframe
                    title={`Map of ${stay.location || 'stay location'}`}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(stay.mapQuery || stay.location || 'Kumaon')}&z=12&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    tabIndex={-1}
                  />
                </a>
              </div>
            </section>
          )}

          {stay.highlights?.length > 0 && (
            <section className="stay-moments stay-moments--inline">
              <div className="stay-section-head">
                <p className="stay-eyebrow">At a glance</p>
                <h2>Moments that shape this stay</h2>
              </div>
              <div className="stay-moment-grid">
                {stay.highlights.map((h) => (
                  <article key={h} className="stay-moment-card">
                    <span className="stay-moment-icon" aria-hidden="true">{highlightIcon(h)}</span>
                    <p>{h}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <section
          id="stay-showcase"
          className="stay-cinematic"
          style={heroBg ? { '--stay-hero': `url('${heroBg}')` } : undefined}
        >
          <div className="stay-cinematic-bg" aria-hidden="true" />
          <div className="stay-cinematic-veil" aria-hidden="true" />

          <div className="stay-cinematic-stage">
            <div className="stay-cinematic-frame">
              {media.length === 0 ? (
                <div className="stay-hero-empty">No photos yet</div>
              ) : current.type === 'video' ? (
                <video src={current.url} controls playsInline className="stay-cinematic-media" />
              ) : (
                <img src={current.url} alt={stay.title} className="stay-cinematic-media" key={current.url} />
              )}

              {media.length > 1 && (
                <>
                  <button type="button" className="stay-hero-nav stay-hero-nav--prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
                  <button type="button" className="stay-hero-nav stay-hero-nav--next" onClick={() => go(1)} aria-label="Next">›</button>
                  <div className="stay-hero-counter">{index + 1} / {media.length}</div>
                </>
              )}
            </div>

            <div className="stay-cinematic-copy">
              <a href={staysIndexPath()} className="stay-back-link">← All stays</a>
              <p className="stay-hero-location">{stay.location}</p>
              <h1>{stay.title}</h1>
              <div className="stay-stat-row">
                <span className="stay-stat"><em>{stay.guest}</em> guests</span>
                <span className="stay-stat"><em>{stay.rooms}</em> rooms</span>
                {stay.best && <span className="stay-stat stay-stat--best">{stay.best}</span>}
              </div>
              {tags.length > 0 && (
                <div className="stay-hero-tags">
                  {tags.map((t) => <span key={t} className="stay-hero-tag">{t}</span>)}
                </div>
              )}
              {stay.description && <p className="stay-hero-desc">{stay.description}</p>}
              <div className="stay-cinematic-foot">
                <div className="stay-hero-price">
                  {stay.disPrice ? <del>₹{stay.disPrice}</del> : null}
                  <strong>₹{stay.price}</strong>
                  <span>/ night</span>
                </div>
                <div className="stay-hero-actions">
                  <a href="#book" className="btn btn-amber">Book this stay →</a>
                  <a
                    href={whatsappChatUrl(waMessage)}
                    className="btn btn-ghost"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ask on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          {media.length > 1 && (
            <div className="stay-filmstrip" aria-label="Stay gallery">
              {media.map((m, i) => (
                <button
                  type="button"
                  key={`${m.url}-${i}`}
                  className={`stay-film-frame${i === index ? ' is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`View ${m.type} ${i + 1}`}
                >
                  {m.type === 'video' ? (
                    <video src={m.url} muted className="stay-film-media" />
                  ) : (
                    <img src={m.url} alt="" className="stay-film-media" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="stay-booking" id="book">
          <div className="stay-booking-inner">
            <div className="stay-booking-intro">
              <p className="stay-eyebrow">Ready when you are</p>
              <h2>Book this stay</h2>
              <p className="stay-booking-lead">
                Choose your dates below. A curator will confirm availability and help shape the rest of your trip.
              </p>
              <div className="stay-book-price">
                {stay.disPrice ? <del>₹{stay.disPrice}</del> : null}
                <strong>₹{stay.price}</strong>
                <span>/ night</span>
              </div>
            </div>
            <div className="stay-book-card">
              <p className="stay-book-kicker">Reserve your dates</p>
              <BookingForm
                stay={stay}
                onSuccess={(result) => setBookingResult(result)}
              />
              <a
                href={whatsappChatUrl(waMessage)}
                className="stay-book-wa"
                target="_blank"
                rel="noopener noreferrer"
              >
                Prefer WhatsApp? Talk to a curator →
              </a>
            </div>
          </div>
        </section>

        <BookingSuccessToast result={bookingResult} onClose={() => setBookingResult(null)} />
      </div>
    </SiteChrome>
  );
}
