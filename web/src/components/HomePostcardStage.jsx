import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { resolvePostcardStyle } from '../data/postcardStyles';
import PostcardShareMenu from './PostcardShareMenu';
import assetUrl from '../utils/assetUrl';

const ENTER_MS = 780;
const EXIT_MS = 720;
const DWELL_MS = 5600;
const TEXT_MIN_PX = 15;
const TEXT_MAX_PX = 64;

const TEMPLATE_URL = assetUrl('images/postcard-2.png');
const TEMPLATE_MOBILE_URL = assetUrl('images/postcard-mobile.png');
const STAMP_URL = assetUrl('images/postcard-stamp.png');

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

function postcardMedia(postcard) {
  if (postcard.media?.length) return postcard.media;
  if (postcard.img) return [{ url: postcard.img, type: 'image' }];
  return [];
}

export default function HomePostcardStage({ cards }) {
  const [cardIdx, setCardIdx] = useState(0);
  const [phase, setPhase] = useState('enter');
  const [mediaIdx, setMediaIdx] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [fitFontSize, setFitFontSize] = useState(null);
  const hoverRef = useRef(false);
  const timers = useRef([]);
  const textBoxRef = useRef(null);
  const textInnerRef = useRef(null);

  const postcard = cards[cardIdx] || null;
  const media = postcard ? postcardMedia(postcard) : [];
  const current = media[mediaIdx] || null;
  const { font } = postcard
    ? resolvePostcardStyle(postcard, cardIdx)
    : { font: null };
  const kicker = 'A note from the hills';

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };

  const schedule = (fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  };

  useEffect(() => {
    hoverRef.current = hovered;
  }, [hovered]);

  useEffect(() => {
    setCardIdx(0);
    setPhase('enter');
    setMediaIdx(0);
  }, [cards]);

  useEffect(() => {
    setMediaIdx(0);
  }, [postcard?.id]);

  // Mobile only — grow quote to fill band between kicker and signer rule.
  // Do not depend on `phase`: re-fitting after enter (~1s) was shrinking the text.
  useLayoutEffect(() => {
    if (!postcard) return undefined;
    const box = textBoxRef.current;
    const inner = textInnerRef.current;
    if (!box || !inner) return undefined;

    const mql = window.matchMedia('(max-width: 720px)');
    const copy = box.parentElement;
    let raf = 0;

    const measureFits = (px, maxH) => {
      box.style.fontSize = `${px}px`;
      void inner.offsetHeight;
      // Height only — width checks false-triggered shrinks on script fonts
      return inner.scrollHeight <= maxH + 1;
    };

    const fit = () => {
      if (!mql.matches) {
        box.style.fontSize = '';
        box.style.height = '';
        box.style.maxHeight = '';
        setFitFontSize(null);
        return;
      }

      // Flex band height (basis 0) — the real quote area
      box.style.height = '';
      box.style.maxHeight = '';
      box.style.fontSize = font?.size || '';
      void box.offsetHeight;

      const maxH = box.clientHeight;
      if (maxH < 12 || box.clientWidth < 12) return;

      // Leave room so the last line / descenders aren’t clipped
      const safeH = Math.max(12, maxH - 14);
      const preferredPx = parseFloat(getComputedStyle(box).fontSize) || 22;
      box.style.height = `${maxH}px`;
      box.style.maxHeight = `${maxH}px`;

      let lo;
      let hi;
      let best;

      if (measureFits(preferredPx, safeH)) {
        // Preferred fits — only grow to fill empty space (never shrink)
        lo = preferredPx;
        hi = TEXT_MAX_PX;
        best = preferredPx;
      } else {
        // Preferred overflows — shrink until it fits
        lo = TEXT_MIN_PX;
        hi = preferredPx;
        best = TEXT_MIN_PX;
      }

      while (hi - lo > 0.35) {
        const mid = (lo + hi) / 2;
        if (measureFits(mid, safeH)) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      if (!measureFits(best, safeH)) {
        while (best > TEXT_MIN_PX && !measureFits(best, safeH)) best -= 0.5;
      }

      // Slightly under-size so script glyphs don’t clip the band edge
      best = Math.max(TEXT_MIN_PX, best * 0.94);

      box.style.fontSize = '';
      box.style.height = '';
      box.style.maxHeight = '';
      setFitFontSize(`${best.toFixed(1)}px`);
    };

    const scheduleFit = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        raf = requestAnimationFrame(fit);
      });
    };

    scheduleFit();
    const ro = new ResizeObserver(scheduleFit);
    ro.observe(box);
    if (copy) ro.observe(copy);
    const frame = copy?.closest('.pc-stage-frame');
    if (frame) ro.observe(frame);
    mql.addEventListener('change', scheduleFit);
    let cancelled = false;
    document.fonts?.ready?.then?.(() => {
      if (!cancelled) scheduleFit();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      mql.removeEventListener('change', scheduleFit);
      box.style.fontSize = '';
      box.style.height = '';
      box.style.maxHeight = '';
    };
  }, [postcard?.id, postcard?.text, font?.family, font?.size, font?.line]);

  // Postcard enter → dwell → exit → next (paused while hovered)
  useEffect(() => {
    if (!postcard || cards.length === 0) return undefined;
    clearTimers();

    if (phase === 'enter') {
      schedule(() => setPhase('idle'), ENTER_MS);
      return clearTimers;
    }

    if (phase === 'idle') {
      if (hovered || cards.length < 2) return clearTimers;
      schedule(() => {
        if (hoverRef.current) return;
        setPhase('exit');
      }, DWELL_MS);
      return clearTimers;
    }

    if (phase === 'exit') {
      schedule(() => {
        setCardIdx((i) => (i + 1) % cards.length);
        setPhase('enter');
      }, EXIT_MS);
      return clearTimers;
    }

    return clearTimers;
  }, [phase, postcard?.id, cards.length, hovered]);

  const goMedia = (dir) => {
    if (media.length < 2) return;
    setMediaIdx((i) => (i + dir + media.length) % media.length);
  };

  if (!postcard) return null;

  const textStyle = font
    ? {
        fontFamily: font.family,
        fontSize: fitFontSize || font.size,
        fontWeight: font.weight,
        lineHeight: font.line,
      }
    : fitFontSize
      ? { fontSize: fitFontSize }
      : undefined;

  return (
    <div
      className={`pc-stage${hovered ? ' is-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setHovered(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false);
      }}
    >
      <div
        className="pc-stage-frame"
        style={{
          '--pc-template': `url('${TEMPLATE_URL}')`,
          '--pc-template-mobile': `url('${TEMPLATE_MOBILE_URL}')`,
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label="Guest postcards"
      >
        <img
          className="pc-stage-stamp"
          src={STAMP_URL}
          alt=""
          aria-hidden="true"
          draggable={false}
        />

        {/* Fixed share — URL follows the active postcard */}
        <div className="pc-stage-share-fixed">
          <PostcardShareMenu key={postcard.id} postcard={postcard} />
        </div>

        <div key={postcard.id} className={`pc-stage-slide pc-stage-slide--${phase}`}>
          <div className="pc-stage-media">
            {current ? (
              current.type === 'video' ? (
                <video
                  key={current.url}
                  className="pc-stage-media-el"
                  src={current.url}
                  autoPlay
                  muted
                  playsInline
                  loop
                  preload="auto"
                />
              ) : (
                <div
                  className="pc-stage-media-el"
                  style={{ backgroundImage: `url('${current.url}')` }}
                  role="img"
                  aria-label=""
                />
              )
            ) : (
              <div className="pc-stage-media-empty">No media yet</div>
            )}

            {media.length > 1 ? (
              <>
                <button
                  type="button"
                  className="pc-media-nav pc-media-nav--prev"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    goMedia(-1);
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
                    goMedia(1);
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
                      className={`${i === mediaIdx ? 'is-on' : ''}${item.type === 'video' ? ' is-video' : ''}`}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="pc-stage-copy">
            <p className="pc-card-kicker">{kicker}</p>
            <p className="pc-stage-text" ref={textBoxRef} style={textStyle}>
              <span className="pc-stage-text-inner" ref={textInnerRef}>
                “{postcard.text}”
              </span>
            </p>
            <div className="pc-card-signer pc-stage-signer">
              <Avatar postcard={postcard} />
              <div className="pc-card-signer-meta">
                <div className="pc-card-name">{postcard.name}</div>
                {postcard.from ? <div className="pc-card-from">{postcard.from}</div> : null}
              </div>
              <span className="pc-stage-share-slot" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
