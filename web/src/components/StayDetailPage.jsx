import { useEffect, useMemo, useState } from 'react';
import BookingForm from './BookingForm';
import { BookingSuccessToast } from './BookingFlow';
import { fetchStay } from '../lib/api';
import { STAYS } from '../data/stays';
import { appPath, goHome } from '../utils/paths';
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

  useEffect(() => {
    if (stay?.title) document.title = `${stay.title} — Ezy Escape`;
    return () => { document.title = 'Ezy Escape — Curated Mountain Homestays'; };
  }, [stay]);

  const media = useMemo(() => buildMedia(stay), [stay]);

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
        <p>Loading stay…</p>
      </div>
    );
  }

  if (notFound || !stay) {
    return (
      <div className="stay-page stay-page--missing">
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

  return (
    <div className="stay-page">
      <header className="stay-page-nav">
        <a href={appPath()} className="stay-page-logo" onClick={(e) => { e.preventDefault(); goHome(); }}>
          <img
            src={assetUrl('images/logo.png')}
            alt="Ezy Escape"
            onError={(e) => { e.target.outerHTML = 'Ezy<em>Escape</em>'; }}
          />
        </a>
        <a href={appPath('#stays')} className="stay-page-back">← All stays</a>
      </header>

      <section className="stay-hero">
        <div className="stay-hero-gallery">
          <div className="stay-hero-main">
            {media.length === 0 ? (
              <div className="stay-hero-empty">No photos yet</div>
            ) : current.type === 'video' ? (
              <video src={current.url} controls playsInline className="stay-hero-media" />
            ) : (
              <img src={current.url} alt={stay.title} className="stay-hero-media" />
            )}
            {media.length > 1 && (
              <>
                <button type="button" className="stay-hero-nav stay-hero-nav--prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
                <button type="button" className="stay-hero-nav stay-hero-nav--next" onClick={() => go(1)} aria-label="Next">›</button>
                <div className="stay-hero-counter">{index + 1} / {media.length}</div>
              </>
            )}
          </div>
          {media.length > 1 && (
            <div className="stay-hero-thumbs">
              {media.map((m, i) => (
                <button
                  type="button"
                  key={`${m.url}-${i}`}
                  className={`stay-hero-thumb${i === index ? ' is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={`View ${m.type} ${i + 1}`}
                >
                  {m.type === 'video' ? (
                    <video src={m.url} muted className="stay-hero-thumb-media" />
                  ) : (
                    <img src={m.url} alt="" className="stay-hero-thumb-media" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="stay-hero-copy">
          <p className="stay-hero-location">{stay.location}</p>
          <h1>{stay.title}</h1>
          <div className="stay-hero-meta">
            <span>{stay.guest} guests</span>
            <span>·</span>
            <span>{stay.rooms} rooms</span>
          </div>
          {tags.length > 0 && (
            <div className="stay-hero-tags">
              {tags.map((t) => <span key={t} className="stay-hero-tag">{t}</span>)}
            </div>
          )}
          {stay.best && <p className="stay-hero-best">Best for: {stay.best}</p>}
          {stay.description && <p className="stay-hero-desc">{stay.description}</p>}
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
      </section>

      <div className="stay-page-body">
        <div className="stay-page-main">
          {stay.highlights?.length > 0 && (
            <section className="stay-block">
              <h2>At a glance</h2>
              <ul className="stay-highlights">
                {stay.highlights.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </section>
          )}

          {storyParas.length > 0 && (
            <section className="stay-block">
              <h2>The story</h2>
              {storyParas.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            </section>
          )}

          {stay.directions && (
            <section className="stay-block">
              <h2>How to get there</h2>
              {paragraphs(stay.directions).map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            </section>
          )}

          <section className="stay-block stay-block--photos">
            <h2>Photos</h2>
            <div className="stay-photo-grid">
              {(stay.images?.length ? stay.images : stay.image ? [stay.image] : []).map((url) => (
                <button
                  type="button"
                  key={url}
                  className="stay-photo-tile"
                  style={{ backgroundImage: `url('${url}')` }}
                  onClick={() => {
                    const i = media.findIndex((m) => m.url === url);
                    if (i >= 0) {
                      setIndex(i);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  aria-label="View photo"
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="stay-page-aside" id="book">
          <div className="stay-book-card">
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
          </div>
        </aside>
      </div>

      <BookingSuccessToast result={bookingResult} onClose={() => setBookingResult(null)} />
    </div>
  );
}
