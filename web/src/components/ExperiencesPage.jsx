import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { PROPERTY_EXPERIENCES, UPCOMING_EVENTS } from '../data/propertyExperiences';
import { homeSectionPath, staysIndexPath } from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';
import AdSlot from './AdSlot';
import '../styles/immersion.css';

export default function ExperiencesPage() {
  const [activeId, setActiveId] = useState(PROPERTY_EXPERIENCES[0].id);
  const activeIndex = Math.max(
    0,
    PROPERTY_EXPERIENCES.findIndex((e) => e.id === activeId),
  );
  const active = PROPERTY_EXPERIENCES[activeIndex] || PROPERTY_EXPERIENCES[0];
  const touchRef = useRef({ x: 0, y: 0 });
  const railRef = useRef(null);
  const skipChipScrollRef = useRef(true);

  const selectByOffset = useCallback((delta) => {
    const next = (activeIndex + delta + PROPERTY_EXPERIENCES.length) % PROPERTY_EXPERIENCES.length;
    setActiveId(PROPERTY_EXPERIENCES[next].id);
  }, [activeIndex]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Keep the active chip centered in the horizontal rail only —
  // never scroll the page (scrollIntoView was jumping past the hero on load).
  useEffect(() => {
    if (skipChipScrollRef.current) {
      skipChipScrollRef.current = false;
      return;
    }
    const rail = railRef.current;
    if (!rail) return;
    const chip = rail.querySelector('.immersion-chip.is-active');
    if (!chip) return;
    const railRect = rail.getBoundingClientRect();
    const chipRect = chip.getBoundingClientRect();
    const delta =
      chipRect.left + chipRect.width / 2 - (railRect.left + railRect.width / 2);
    if (Math.abs(delta) < 2) return;
    rail.scrollBy({ left: delta, behavior: 'smooth' });
  }, [activeId]);

  const onHeroTouchStart = (e) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const onHeroTouchEnd = (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    selectByOffset(dx < 0 ? 1 : -1);
  };

  const pastEvents = useMemo(() => PROPERTY_EXPERIENCES, []);

  return (
    <SiteChrome
      title="Village Kitchen, Forest Walks & Hill Festivals — Ezy Escape"
      description="Immersive experiences with your homestay — village kitchen cooking, sunrise tea, forest walks, Holi in the hills, bonfire nights and more."
      path="/experiences"
    >
      <section className="sp-hero sp-hero--experiences">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Experiences</p>
          <h1 className="sp-title">
            <span className="sp-title-line">Festivals, circles &</span>
            <br />
            <span className="sp-title-script">
              <Typewriter text="gatherings in the hills." className="typewriter-cursor" speed={90} />
            </span>
          </h1>
          <p className="sp-lead">
            Holi, Diwali, regional festivals, wellness circles and more — moments you can share around our mountain homes.
          </p>
        </div>
      </section>

      <section className="exp-upcoming-section section-bg-cream">
        <div className="container">
          <header className="exp-upcoming-head">
            <p className="sp-eyebrow" style={{ color: '#c47a0a' }}>Event bookings</p>
            <h2>Upcoming</h2>
            <p>Reserve a seat for the next gatherings in the hills — limited spots with host families.</p>
          </header>
          <div className="exp-upcoming-grid">
            {UPCOMING_EVENTS.map((ev) => (
              <article key={ev.id} className="exp-upcoming-card">
                <div className="exp-upcoming-media">
                  <img src={ev.img} alt={ev.title} />
                  <div className="exp-upcoming-date">
                    <span className="exp-upcoming-month">{ev.month}</span>
                    <strong>{ev.day}</strong>
                  </div>
                </div>
                <div className="exp-upcoming-body">
                  <span className="exp-upcoming-tag">{ev.tag}</span>
                  <h3>{ev.title}</h3>
                  <p>{ev.desc}</p>
                  <p className="exp-upcoming-meta">{ev.place} · {ev.spots}</p>
                  <a
                    className="btn btn-amber exp-upcoming-book"
                    href={whatsappChatUrl(ev.waMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Book now
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="immersion-section immersion-section--page immersion-section--light section-bg-white"
        id="experiences-stage"
      >
        <div className="container immersion-inner">
          <header className="immersion-intro immersion-intro--page" data-reveal="up">
            <p className="sp-eyebrow" style={{ color: '#c47a0a' }}>Past events</p>
            <h2 className="immersion-title">
              <span className="immersion-title-lead">Moments already shared</span>
            </h2>
            <p className="immersion-sub">
              Browse festivals and gatherings that have lit up our mountain homes — tap a card to step inside.
            </p>
          </header>

          <div className="immersion-stage" data-reveal="up">
            <article
              className="immersion-hero"
              key={active.id}
              onTouchStart={onHeroTouchStart}
              onTouchEnd={onHeroTouchEnd}
            >
              <img className="immersion-hero-photo" src={active.img} alt={active.title} />
              <div className="immersion-hero-shade" />
              <div className="immersion-hero-copy">
                <div className="immersion-hero-meta">
                  <span className="immersion-tag">{active.tag}</span>
                  <span className="immersion-hero-count" aria-hidden="true">
                    {String(activeIndex + 1).padStart(2, '0')}
                    <span> / {String(pastEvents.length).padStart(2, '0')}</span>
                  </span>
                </div>
                <span className="immersion-hero-emoji" aria-hidden="true">{active.emoji}</span>
                <h3 className="immersion-hero-title">{active.title}</h3>
                <p className="immersion-hero-desc">{active.desc}</p>
                <p className="immersion-hero-swipe-hint">Swipe photo · tap a card below</p>
              </div>
            </article>

            <div className="immersion-rail" role="list" aria-label="Browse past experiences" ref={railRef}>
              {pastEvents.map((exp, i) => (
                <button
                  key={exp.id}
                  type="button"
                  role="listitem"
                  className={`immersion-chip immersion-chip--text immersion-chip--card${activeId === exp.id ? ' is-active' : ''}`}
                  onClick={() => setActiveId(exp.id)}
                  aria-pressed={activeId === exp.id}
                >
                  <img className="immersion-chip-img" src={exp.img} alt="" />
                  <span className="immersion-chip-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="immersion-chip-body">
                    <span className="immersion-chip-emoji" aria-hidden="true">{exp.emoji}</span>
                    <span className="immersion-chip-title">{exp.title}</span>
                    <span className="immersion-chip-tag">{exp.tag}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AdSlot adId="experiences-ad1" />

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Ready to join one of these?</h2>
          <p>Match your vibe first — then stay somewhere that opens the door to these gatherings.</p>
          <div className="sp-hero-actions">
            <a href={homeSectionPath('quiz')} className="btn btn-amber">Match My Stay →</a>
            <a href={staysIndexPath()} className="btn btn-ghost">View all homestays</a>
          </div>
        </div>
      </section>

      <AdSlot adId="experiences-ad2" />
    </SiteChrome>
  );
}
