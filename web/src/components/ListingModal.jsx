import { useEffect, useMemo, useState } from 'react';
import BookingForm from './BookingForm';

function buildMedia(stay) {
  if (!stay) return [];
  const images = stay.images?.length ? stay.images : stay.image ? [stay.image] : [];
  return [
    ...images.map((url) => ({ type: 'image', url })),
    ...(stay.videos || []).map((url) => ({ type: 'video', url })),
  ];
}

export default function ListingModal({ stay, open, onClose, onBookingSuccess }) {
  const media = useMemo(() => buildMedia(stay), [stay]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [stay]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') setIndex((i) => (media.length ? (i + 1) % media.length : 0));
      else if (e.key === 'ArrowLeft') setIndex((i) => (media.length ? (i - 1 + media.length) % media.length : 0));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, media.length, onClose]);

  if (!open || !stay) return null;

  const tags = (stay.cat || '').split(/\s+/).filter(Boolean);
  const current = media[index];
  const go = (dir) => setIndex((i) => (i + dir + media.length) % media.length);

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal listing-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="listing-title">
        <button type="button" className="modal-close listing-close" onClick={onClose} aria-label="Close">×</button>

        <div className="listing-modal-inner">
          {/* LEFT: media gallery */}
          <div className="listing-gallery">
            <div className="listing-gallery-main">
              {media.length === 0 ? (
                <div className="listing-gallery-empty">No media</div>
              ) : current.type === 'video' ? (
                <video src={current.url} controls playsInline className="listing-media" />
              ) : (
                <img src={current.url} alt={stay.title} className="listing-media" />
              )}

              {media.length > 1 && (
                <>
                  <button type="button" className="listing-nav listing-nav--prev" onClick={() => go(-1)} aria-label="Previous">‹</button>
                  <button type="button" className="listing-nav listing-nav--next" onClick={() => go(1)} aria-label="Next">›</button>
                  <div className="listing-counter">{index + 1} / {media.length}</div>
                </>
              )}
            </div>

            {media.length > 1 && (
              <div className="listing-thumbs">
                {media.map((m, i) => (
                  <button
                    type="button"
                    key={`${m.url}-${i}`}
                    className={`listing-thumb${i === index ? ' is-active' : ''}`}
                    onClick={() => setIndex(i)}
                    aria-label={`View ${m.type} ${i + 1}`}
                  >
                    {m.type === 'video' ? (
                      <>
                        <video src={m.url} muted className="listing-thumb-media" />
                        <span className="listing-thumb-play">▶</span>
                      </>
                    ) : (
                      <img src={m.url} alt="" className="listing-thumb-media" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: details + booking */}
          <div className="listing-details">
            <div className="listing-details-head">
              <div className="listing-location">{stay.location}</div>
              <h2 id="listing-title">{stay.title}</h2>
              <div className="listing-meta">
                <span>{stay.guest} guests</span>
                <span>·</span>
                <span>{stay.rooms} rooms</span>
              </div>
              {tags.length > 0 && (
                <div className="listing-tags">
                  {tags.map((t) => (
                    <span key={t} className="listing-tag">{t}</span>
                  ))}
                </div>
              )}
              {stay.best && <p className="listing-best">Best for: {stay.best}</p>}
              <div className="listing-price">
                {stay.disPrice ? <del>₹{stay.disPrice}</del> : null}
                <strong>₹{stay.price}</strong>
                <span className="listing-price-unit">/ night</span>
              </div>
            </div>

            <div className="listing-book">
              <h3>Book this stay</h3>
              <BookingForm stay={stay} onSuccess={onBookingSuccess} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
