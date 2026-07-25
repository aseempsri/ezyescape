import { useEffect, useRef, useState } from 'react';
import { resolvePostcardStyle } from '../data/postcardStyles';
import PostcardShareMenu from './PostcardShareMenu';

const IMAGE_DWELL_MS = 4200;

function Avatar({ postcard }) {
  if (postcard.avatarMode === 'photo' && postcard.avatarUrl) {
    return (
      <span
        className="pc-avatar pc-avatar--photo"
        style={{ backgroundImage: `url('${postcard.avatarUrl}')` }}
        aria-hidden="true"
      />
    );
  }
  return (
    <span className="pc-avatar pc-avatar--char" aria-hidden="true">
      {postcard.characterEmoji || '✉️'}
    </span>
  );
}

function MediaStage({ media, idx, setIdx, current }) {
  const videoRef = useRef(null);
  const pauseAutoUntil = useRef(0);

  const go = (dir) => {
    if (media.length < 2) return;
    pauseAutoUntil.current = Date.now() + 8000;
    setIdx((i) => (i + dir + media.length) % media.length);
  };

  // Auto-advance images; videos advance only when they finish (no loop in a carousel).
  useEffect(() => {
    if (!current || media.length < 2) return undefined;

    if (current.type === 'video') {
      const el = videoRef.current;
      if (!el) return undefined;

      const onEnded = () => {
        if (Date.now() < pauseAutoUntil.current) return;
        setIdx((i) => (i + 1) % media.length);
      };

      el.loop = false;
      el.muted = true;
      el.playsInline = true;
      const playPromise = el.play();
      if (playPromise?.catch) playPromise.catch(() => {});

      el.addEventListener('ended', onEnded);
      return () => el.removeEventListener('ended', onEnded);
    }

    let cancelled = false;
    let timerId;

    const schedule = (ms) => {
      timerId = window.setTimeout(() => {
        if (cancelled) return;
        const wait = pauseAutoUntil.current - Date.now();
        if (wait > 0) {
          schedule(wait + 40);
          return;
        }
        setIdx((i) => (i + 1) % media.length);
      }, ms);
    };

    schedule(IMAGE_DWELL_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [current, idx, media.length, setIdx]);

  // Solo video: keep looping while on screen.
  useEffect(() => {
    if (!current || current.type !== 'video' || media.length !== 1) return undefined;
    const el = videoRef.current;
    if (!el) return undefined;
    el.loop = true;
    el.muted = true;
    const playPromise = el.play();
    if (playPromise?.catch) playPromise.catch(() => {});
    return undefined;
  }, [current, media.length]);

  if (!current) {
    return <div className="pc-card-media-empty">No media yet</div>;
  }

  return (
    <>
      {current.type === 'video' ? (
        <video
          key={current.url}
          ref={videoRef}
          className="pc-card-media-el"
          src={current.url}
          autoPlay
          muted
          playsInline
          loop={media.length === 1}
          preload="auto"
        />
      ) : (
        <div
          className="pc-card-media-el"
          style={{ backgroundImage: `url('${current.url}')` }}
          role="img"
          aria-label=""
        />
      )}

      {media.length > 1 ? (
        <>
          <button
            type="button"
            className="pc-media-nav pc-media-nav--prev"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous photo or video"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="pc-media-nav pc-media-nav--next"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next photo or video"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="currentColor"
                d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"
              />
            </svg>
          </button>
          <div className="pc-media-dots" aria-hidden="true">
            {media.map((item, i) => (
              <span
                key={`${item.url}-${i}`}
                className={`${i === idx ? 'is-on' : ''}${item.type === 'video' ? ' is-video' : ''}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </>
  );
}

function Stamp({ layout }) {
  if (layout === 'airmail') {
    return (
      <span className="pc-postmark">
        <em>Ezy</em>
        <span>Escape</span>
      </span>
    );
  }
  if (layout === 'ticket') {
    return <span className="pc-ticket-stub">EE · PASS</span>;
  }
  if (layout === 'telegram') {
    return <span className="pc-telegram-stamp">RCVD</span>;
  }
  if (layout === 'polaroid') {
    return <span className="pc-polaroid-date">Ezy Escape</span>;
  }
  return 'Ezy Escape';
}

export default function PostcardCard({ postcard, index = 0, highlighted = false }) {
  const media = postcard.media?.length
    ? postcard.media
    : postcard.img
      ? [{ url: postcard.img, type: 'image' }]
      : [];
  const [idx, setIdx] = useState(0);
  const current = media[idx] || null;
  const { font, layout, kicker } = resolvePostcardStyle(postcard, index);

  useEffect(() => {
    setIdx(0);
  }, [postcard.id]);

  const textStyle = {
    fontFamily: font.family,
    fontSize: font.size,
    fontWeight: font.weight,
    lineHeight: font.line,
  };

  return (
    <article
      id={`postcard-${postcard.id}`}
      className={`pc-card pc-card--${layout} pc-card--font-${font.id}${highlighted ? ' pc-card--focus' : ''}`}
    >
      <div className="pc-card-stamp" aria-hidden="true">
        <Stamp layout={layout} />
      </div>

      <div className={`pc-card-inner pc-card-inner--${layout}`}>
        <div className="pc-card-copy">
          <p className="pc-card-kicker">{kicker}</p>
          <p className="pc-card-text" style={textStyle}>
            “{postcard.text}”
          </p>
          <div className="pc-card-signer">
            <Avatar postcard={postcard} />
            <div className="pc-card-signer-meta">
              <div className="pc-card-name">{postcard.name}</div>
              {postcard.from ? <div className="pc-card-from">{postcard.from}</div> : null}
            </div>
            <PostcardShareMenu postcard={postcard} />
          </div>
        </div>

        <div className="pc-card-media">
          <MediaStage media={media} idx={idx} setIdx={setIdx} current={current} />
        </div>
      </div>
    </article>
  );
}
