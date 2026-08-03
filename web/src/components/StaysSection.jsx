import { useEffect, useMemo, useRef, useState } from 'react';
import Typewriter from './Typewriter';
import { fetchStays } from '../lib/api';
import { goStay, staysIndexPath } from '../utils/paths';
import {
  FALLBACK_STAYS,
  STAY_FILTERS,
  normalizeApiStay,
  stayCardChip,
  stayMatchesFilter,
} from '../utils/stays';

const MOBILE_MQ = '(max-width: 768px)';
const TOUCH_RESUME_MS = 3000;
const CARD_W = 340;
const CARD_GAP = 24;

/** Duplicate cards until one half fills the viewport — keeps the marquee gap-free. */
function buildLoop(items, viewportWidth = 1440) {
  if (!items.length) return [];
  const vw = viewportWidth || 1440;
  // One half must be wider than the viewport so empty cream never shows.
  const minHalfWidth = Math.max(vw + CARD_W * 2, 1800);
  const minCount = Math.ceil(minHalfWidth / (CARD_W + CARD_GAP)) + 2;
  let base = [...items];
  while (base.length < Math.max(minCount, 8)) {
    base = [...base, ...items];
  }
  return [...base, ...base];
}

function StayCard({ stay, onOpen }) {
  const chip = stayCardChip(stay);
  const touchRef = useRef({ x: 0, y: 0, dragged: false });

  return (
    <div
      className="stay-card"
      data-cat={stay.cat}
      role="link"
      tabIndex={0}
      onTouchStart={(e) => {
        const t = e.touches[0];
        touchRef.current = { x: t.clientX, y: t.clientY, dragged: false };
      }}
      onTouchMove={(e) => {
        const t = e.touches[0];
        if (!t) return;
        if (
          Math.abs(t.clientX - touchRef.current.x) > 10
          || Math.abs(t.clientY - touchRef.current.y) > 10
        ) {
          touchRef.current.dragged = true;
        }
      }}
      onClick={() => {
        if (touchRef.current.dragged) {
          touchRef.current.dragged = false;
          return;
        }
        onOpen(stay);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(stay);
        }
      }}
    >
      <div className="stay-img" style={{ backgroundImage: `url('${stay.image}')` }}>
        <div className="stay-img-overlay" />
        <div className="stay-img-tags">
          <span className={`s-tag s-tag--chip s-tag--${chip.kind}`}>
            {chip.label}
          </span>
        </div>
      </div>
      <div className="stay-body">
        <div className="stay-host">{stay.location}</div>
        <div className="stay-name" title={stay.title}>{stay.title}</div>
        <div className="stay-footer">
          <span className="stay-best">{stay.best}</span>
          <span className="stay-link stay-book-btn">View stay →</span>
        </div>
      </div>
    </div>
  );
}

export default function StaysSection() {
  const [filter, setFilter] = useState('all');
  const [stays, setStays] = useState(FALLBACK_STAYS);
  const [viewportW, setViewportW] = useState(
    () => (typeof window !== 'undefined' ? window.innerWidth : 1440),
  );
  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;
    fetchStays()
      .then((data) => {
        if (active && Array.isArray(data) && data.length) {
          setStays(data.map(normalizeApiStay));
        }
      })
      .catch(() => { /* keep fallback */ });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(
    () => stays.filter((s) => stayMatchesFilter(s.cat, filter, s)),
    [stays, filter],
  );

  const loop = useMemo(() => buildLoop(filtered, viewportW), [filtered, viewportW]);
  const durationSec = Math.max(32, Math.round(loop.length / 2) * 4);

  useEffect(() => {
    const cards = document.querySelectorAll('.stays-section .stay-card');
    const cleanups = [];
    cards.forEach((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        card.removeEventListener('mousemove', onMove);
        card.removeEventListener('mouseleave', onLeave);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [loop]);

  // Mobile only: touch-scroll the strip; auto-scroll resumes after 3s idle.
  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || !loop.length) return undefined;

    const mq = window.matchMedia(MOBILE_MQ);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = false;
    let resumeTimer = null;
    let rafId = 0;
    let lastTs = 0;

    const pauseForTouch = () => {
      if (!mq.matches) return;
      paused = true;
      lastTs = 0;
      window.clearTimeout(resumeTimer);
      resumeTimer = window.setTimeout(() => {
        paused = false;
        lastTs = 0;
      }, TOUCH_RESUME_MS);
    };

    const tick = (ts) => {
      rafId = window.requestAnimationFrame(tick);
      if (!mq.matches || reduceMotion.matches || paused) {
        lastTs = 0;
        return;
      }
      if (!lastTs) lastTs = ts;
      const dt = Math.min(48, ts - lastTs);
      lastTs = ts;
      const half = track.scrollWidth / 2;
      if (half <= 0) return;
      const pps = half / durationSec;
      wrap.scrollLeft += (dt / 1000) * pps;
      if (wrap.scrollLeft >= half) wrap.scrollLeft -= half;
    };

    wrap.addEventListener('touchstart', pauseForTouch, { passive: true });
    wrap.addEventListener('touchmove', pauseForTouch, { passive: true });
    wrap.addEventListener('touchend', pauseForTouch, { passive: true });
    wrap.addEventListener('pointerdown', pauseForTouch, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(resumeTimer);
      wrap.removeEventListener('touchstart', pauseForTouch);
      wrap.removeEventListener('touchmove', pauseForTouch);
      wrap.removeEventListener('touchend', pauseForTouch);
      wrap.removeEventListener('pointerdown', pauseForTouch);
    };
  }, [loop, durationSec, filter]);

  const openStay = (stay) => {
    goStay(stay.slug || stay.id);
  };

  return (
    <section className="stays-section section-bg-cream" id="stays" style={{ paddingTop: 100, paddingBottom: 120 }}>
      <div className="container">
        <div className="stays-header">
          <div data-reveal="left">
            <div className="eyebrow eyebrow--underline" style={{ color: '#101e2c' }}>Curated Collection</div>
            <h2 className="why-big-text" data-reveal>
              Not Just Rooms <br />
              <span className="why-script-line stays-script">
                <em id="typewriter-2" className="typewriter-cursor">
                  <Typewriter text="Homes with stories" className="" style={{ fontStyle: 'normal' }} />
                </em>
              </span>
            </h2>
          </div>
          <div className="stays-filter-row" data-reveal="right" role="tablist" aria-label="Filter stays">
            {STAY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`s-filter${filter === f.id ? ' on' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="stays-track-bleed">
        <div className="stays-track-wrap" id="staysWrap" ref={wrapRef}>
          {loop.length > 0 ? (
            <div
              className="stays-track stays-track--marquee"
              id="staysTrack"
              ref={trackRef}
              key={filter}
              style={{ animationDuration: `${durationSec}s` }}
            >
              {loop.map((stay, i) => (
                <StayCard key={`${stay.id}-${i}`} stay={stay} onOpen={openStay} />
              ))}
            </div>
          ) : (
            <p className="stays-empty">No stays match this filter yet.</p>
          )}
        </div>
      </div>

      <div className="container">
        <div className="w" style={{ textAlign: 'center', marginTop: 8 }} data-reveal="up">
          <a href={staysIndexPath()} className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
            View All Homestays <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
