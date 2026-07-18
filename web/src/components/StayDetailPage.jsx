import { useEffect, useMemo, useState } from 'react';
import Cursor from './Cursor';
import BookingForm from './BookingForm';
import { BookingSuccessToast } from './BookingFlow';
import useCustomCursor from '../hooks/useCustomCursor';
import { fetchStay } from '../lib/api';
import { STAYS } from '../data/stays';
import { appPath, goHome, staysIndexPath } from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';
import assetUrl from '../utils/assetUrl';
import '../styles/index.css';
import '../styles/hero-nav.css';
import '../styles/mobile.css';
import '../styles/stay-page.css';

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
    directions: s.directions || '',
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

  useCustomCursor();

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

  useEffect(() => {
    if (stay?.title) document.title = `${stay.title} — Ezy Escape`;
    return () => { document.title = 'Ezy Escape — Curated Mountain Homestays'; };
  }, [stay]);

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
      <div className="stay-page stay-page--loading">
        <Cursor />
        <p>Loading stay…</p>
      </div>
    );
  }

  if (notFound || !stay) {
    return (
      <div className="stay-page stay-page--missing">
        <Cursor />
        <h1>Stay not found</h1>
        <p>This homestay may have been removed or the link is incorrect.</p>
        <a className="btn btn-amber" href={appPath()}>Back to home</a>
      </div>
    );
  }

  const tags = (stay.cat || '').split(/\s+/).filter(Boolean);
  const current = media[index];
  const go = (dir) => setIndex((i) => (i + dir + media.length) % media.length);
  const storyParas = paragraphs(stay.story || stay.description);
  const waMessage = `Hi! I'm interested in "${stay.title}" (${stay.location}). Could you share availability and help me plan my stay?`;
  const heroBg = current?.type === 'image' ? current.url : photos[0] || stay.image;

  const openPhoto = (url) => {
    const i = media.findIndex((m) => m.url === url);
    if (i >= 0) {
      setIndex(i);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="stay-page">
      <Cursor />

      <header className="stay-page-nav">
        <a href={appPath()} className="stay-page-logo" onClick={(e) => { e.preventDefault(); goHome(); }}>
          <img
            src={assetUrl('images/logo.png')}
            alt="Ezy Escape"
            onError={(e) => { e.target.outerHTML = 'Ezy<em>Escape</em>'; }}
          />
        </a>
        <div className="stay-page-nav-actions">
          <a href={staysIndexPath()} className="stay-page-back">← All stays</a>
          <a href="#book" className="stay-page-book-chip">Book</a>
        </div>
      </header>

      <section className="stay-cinematic" style={heroBg ? { '--stay-hero': `url('${heroBg}')` } : undefined}>
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

      {stay.highlights?.length > 0 && (
        <section className="stay-moments">
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

      <div className="stay-page-body">
        <div className="stay-page-main">
          {storyParas.length > 0 && (
            <section className="stay-story">
              <div className="stay-story-visual" style={photos[0] ? { backgroundImage: `url('${photos[0]}')` } : undefined}>
                <div className="stay-story-visual-shade" />
                <p className="stay-story-kicker">The story</p>
                <h2>{stay.title}</h2>
              </div>
              <div className="stay-story-copy">
                {storyParas.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              </div>
            </section>
          )}

          {stay.directions && (
            <section className="stay-journey">
              <div className="stay-section-head">
                <p className="stay-eyebrow">Getting there</p>
                <h2>How to reach the home</h2>
              </div>
              <div className="stay-journey-card">
                <span className="stay-journey-icon" aria-hidden="true">🗺</span>
                <div>
                  {paragraphs(stay.directions).map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
                </div>
              </div>
            </section>
          )}

          {photos.length > 0 && (
            <section className="stay-mosaic">
              <div className="stay-section-head">
                <p className="stay-eyebrow">Gallery</p>
                <h2>See the atmosphere</h2>
              </div>
              <div className="stay-mosaic-grid">
                {photos.map((url, i) => (
                  <button
                    type="button"
                    key={url}
                    className={`stay-mosaic-tile stay-mosaic-tile--${i % 5 === 0 ? 'wide' : i % 3 === 0 ? 'tall' : 'std'}`}
                    style={{ backgroundImage: `url('${url}')` }}
                    onClick={() => openPhoto(url)}
                    aria-label="View photo"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="stay-page-aside" id="book">
          <div className="stay-book-card">
            <p className="stay-book-kicker">Reserve your dates</p>
            <h2>Book this stay</h2>
            <p className="stay-book-price">
              {stay.disPrice ? <del>₹{stay.disPrice}</del> : null}
              <strong>₹{stay.price}</strong>
              <span>/ night</span>
            </p>
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
        </aside>
      </div>

      <BookingSuccessToast result={bookingResult} onClose={() => setBookingResult(null)} />
    </div>
  );
}
