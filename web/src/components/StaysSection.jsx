import { useEffect, useRef, useState } from 'react';
import { STAYS } from '../data/stays';
import Typewriter from './Typewriter';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'quiet', label: 'Quiet' },
  { id: 'family', label: 'Family' },
  { id: 'forest', label: 'Forest' },
  { id: 'accessible', label: 'Road Access' },
];

export default function StaysSection() {
  const [filter, setFilter] = useState('all');
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onDown = (e) => {
      isDown = true;
      wrap.classList.add('dragging');
      startX = e.pageX - wrap.offsetLeft;
      scrollLeft = wrap.scrollLeft;
    };
    const onUp = () => { isDown = false; wrap.classList.remove('dragging'); };
    const onMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrap.offsetLeft;
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
  }, [filter]);

  const visible = (cat) => filter === 'all' || cat.includes(filter);

  return (
    <section className="stays-section" id="stays" style={{ paddingTop: 100, paddingBottom: 120 }}>
      <div className="container">
        <div className="stays-header">
          <div data-reveal="left">
            <div className="eyebrow" style={{ color: '#101e2c' }}>Curated Collection</div>
            <h2 className="why-big-text" data-reveal>
              Not Just Rooms <br />
              <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(4.4vw,4.4vw,4.4vw)', color: '#111d2d' }}>
                <em id="typewriter-2" className="typewriter-cursor" style={{ color: '#111d2d' }}>
                  <Typewriter text="Homes with stories" className="" style={{ fontStyle: 'normal' }} />
                </em>
              </span>
            </h2>
          </div>
          <div className="stays-filter-row" data-reveal="right">
            {FILTERS.map((f) => (
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
            {STAYS.map((stay) => (
              <div
                key={stay.id}
                className="stay-card"
                data-cat={stay.cat}
                style={{
                  opacity: visible(stay.cat) ? 1 : 0.25,
                  transform: visible(stay.cat) ? '' : 'scale(0.97)',
                  pointerEvents: visible(stay.cat) ? 'auto' : 'none',
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
                  <del style={{ fontSize: 18 }}> ₹ {stay.disPrice} </del> /per Night &nbsp;&nbsp;
                  <span className="price"><span>₹ {stay.price}</span></span>
                  <div className="stay-footer">
                    <span className="stay-best">{stay.best}</span>
                    <a href="#" className="stay-link">View Story →</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="stays-scroll-hint">
          Swipe to explore <span>→</span>
        </div>
        <div className="w" style={{ textAlign: 'center', marginTop: 8 }} data-reveal="up">
          <a href="#" className="btn btn-ghost" style={{ fontSize: '.85rem' }}>View All Homestays <span className="btn-arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}
