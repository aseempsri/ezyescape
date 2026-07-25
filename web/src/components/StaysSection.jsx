import { useEffect, useMemo, useState } from 'react';
import Typewriter from './Typewriter';
import { fetchStays } from '../lib/api';
import { goStay, staysIndexPath } from '../utils/paths';
import {
  FALLBACK_STAYS,
  STAY_FILTERS,
  normalizeApiStay,
  stayMatchesFilter,
} from '../utils/stays';

function buildLoop(items) {
  if (!items.length) return [];
  let base = [...items];
  while (base.length < 4) base = [...base, ...items];
  return [...base, ...base];
}

function StayCard({ stay, onOpen }) {
  const guests = stay.guest || stay.guests;
  return (
    <div
      className="stay-card"
      data-cat={stay.cat}
      role="link"
      tabIndex={0}
      onClick={() => onOpen(stay)}
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
          <span className="s-tag s-tag--host">
            Hosts up to <em>{guests}</em>
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
    () => stays.filter((s) => stayMatchesFilter(s.cat, filter)),
    [stays, filter],
  );

  const loop = useMemo(() => buildLoop(filtered), [filtered]);
  const durationSec = Math.max(28, Math.round(loop.length / 2) * 7);

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

  const openStay = (stay) => {
    goStay(stay.slug || stay.id);
  };

  return (
    <section className="stays-section" id="stays" style={{ paddingTop: 100, paddingBottom: 120 }}>
      <div className="container">
        <div className="stays-header">
          <div data-reveal="left">
            <div className="eyebrow" style={{ color: '#101e2c' }}>Curated Collection</div>
            <h2 className="why-big-text" data-reveal>
              Not Just Rooms <br />
              <span className="why-script-line stays-script">
                <em id="typewriter-2" className="typewriter-cursor">
                  <Typewriter text="Homes with stories" className="" style={{ fontStyle: 'normal' }} />
                </em>
              </span>
            </h2>
          </div>
          <div className="stays-filter-row" data-reveal="right">
            {STAY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`s-filter${filter === f.id ? ' on' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="stays-track-wrap" id="staysWrap">
          {loop.length > 0 ? (
            <div
              className="stays-track stays-track--marquee"
              id="staysTrack"
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

        <div className="w" style={{ textAlign: 'center', marginTop: 8 }} data-reveal="up">
          <a href={staysIndexPath()} className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
            View All Homestays <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
