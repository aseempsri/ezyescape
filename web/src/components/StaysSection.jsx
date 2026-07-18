import { useEffect, useRef, useState } from 'react';
import Typewriter from './Typewriter';
import { fetchStays } from '../lib/api';
import { goStay, staysIndexPath } from '../utils/paths';
import {
  FALLBACK_STAYS,
  STAY_FILTERS,
  normalizeApiStay,
  stayMatchesFilter,
} from '../utils/stays';

export default function StaysSection() {
  const [filter, setFilter] = useState('all');
  const [stays, setStays] = useState(FALLBACK_STAYS);
  const wrapRef = useRef(null);
  const draggedRef = useRef(false);

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

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e) => {
      isDown = true;
      draggedRef.current = false;
      wrap.classList.add('dragging');
      startX = e.pageX - wrap.offsetLeft;
      scrollLeft = wrap.scrollLeft;
    };
    const onUp = () => { isDown = false; wrap.classList.remove('dragging'); };
    const onMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrap.offsetLeft;
      if (Math.abs(x - startX) > 5) draggedRef.current = true;
      wrap.scrollLeft = scrollLeft - (x - startX) * 1.8;
    };

    wrap.addEventListener('mousedown', onDown);
    wrap.addEventListener('mouseleave', onUp);
    wrap.addEventListener('mouseup', onUp);
    wrap.addEventListener('mousemove', onMove);
    return () => {
      wrap.removeEventListener('mousedown', onDown);
      wrap.removeEventListener('mouseleave', onUp);
      wrap.removeEventListener('mouseup', onUp);
      wrap.removeEventListener('mousemove', onMove);
    };
  }, []);

  useEffect(() => {
    document.querySelectorAll('.stay-card').forEach((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }, [filter, stays]);

  const openStay = (stay) => {
    if (draggedRef.current) return;
    if (!stayMatchesFilter(stay.cat, filter)) return;
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
        <div className="stays-track-wrap" id="staysWrap" ref={wrapRef}>
          <div className="stays-track" id="staysTrack">
            {stays.map((stay) => {
              const active = stayMatchesFilter(stay.cat, filter);
              return (
                <div
                  key={stay.id}
                  className="stay-card"
                  data-cat={stay.cat}
                  role="link"
                  tabIndex={active ? 0 : -1}
                  onClick={() => openStay(stay)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openStay(stay);
                    }
                  }}
                  style={{
                    opacity: active ? 1 : 0.25,
                    transform: active ? '' : 'scale(0.97)',
                    pointerEvents: active ? 'auto' : 'none',
                    cursor: active ? 'pointer' : 'default',
                  }}
                >
                  <div className="stay-img" style={{ backgroundImage: `url('${stay.image}')` }}>
                    <div className="stay-img-overlay" />
                    <div className="stay-img-tags">
                      <span className="s-tag">{stay.guest} Adults</span>
                      <span className="s-tag">{stay.rooms} Rooms</span>
                    </div>
                  </div>
                  <div className="stay-body">
                    <div className="stay-host">{stay.location}</div>
                    <div className="stay-name">{stay.title}</div>
                    {stay.disPrice ? (
                      <del style={{ fontSize: 18 }}> ₹ {stay.disPrice} </del>
                    ) : null}
                    {stay.disPrice ? ' ' : null}/per Night &nbsp;&nbsp;
                    <span className="price"><span>₹ {stay.price}</span></span>
                    <div className="stay-footer">
                      <span className="stay-best">{stay.best}</span>
                      <span className="stay-link stay-book-btn">View stay →</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="stays-scroll-hint">
          Swipe to explore <span>→</span>
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
