import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import EventShareMenu from './EventShareMenu';
import { PROPERTY_EXPERIENCES, UPCOMING_EVENTS } from '../data/propertyExperiences';
import { resolveEventIcon } from '../data/eventIcons';
import { fetchEvents } from '../lib/api';
import {
  experiencePath,
} from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';
import AdSlot from './AdSlot';
import '../styles/immersion.css';

function normalizeUpcoming(ev) {
  const month = ev.month || '';
  const day = ev.day || '';
  const dateLabel =
    ev.dateLabel ||
    (month && day
      ? `${month.charAt(0)}${month.slice(1).toLowerCase()} ${day}`
      : ev.date || '');
  return {
    ...ev,
    id: ev.id || ev.slug,
    slug: ev.slug || ev.id,
    img: ev.img || ev.images?.[0] || '',
    emoji: resolveEventIcon(ev.emoji),
    month,
    day,
    dateLabel,
  };
}

function normalizePast(ev) {
  return {
    ...ev,
    id: ev.id || ev.slug,
    slug: ev.slug || ev.id,
    img: ev.img || ev.images?.[0] || '',
    emoji: resolveEventIcon(ev.emoji),
    date: ev.dateLabel || ev.date || '',
  };
}

const FALLBACK_UPCOMING = UPCOMING_EVENTS.map(normalizeUpcoming);
const FALLBACK_PAST = PROPERTY_EXPERIENCES.map(normalizePast);

export default function ExperiencesPage() {
  const [upcoming, setUpcoming] = useState(FALLBACK_UPCOMING);
  const [pastEvents, setPastEvents] = useState(FALLBACK_PAST);
  const [activeId, setActiveId] = useState(FALLBACK_PAST[0]?.id);
  const activeIndex = Math.max(
    0,
    pastEvents.findIndex((e) => e.id === activeId),
  );
  const active = pastEvents[activeIndex] || pastEvents[0];
  const touchRef = useRef({ x: 0, y: 0 });
  const railRef = useRef(null);
  const skipChipScrollRef = useRef(true);

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchEvents('upcoming').catch(() => null),
      fetchEvents('past').catch(() => null),
    ]).then(([up, past]) => {
      if (!alive) return;
      if (Array.isArray(up) && up.length) setUpcoming(up.map(normalizeUpcoming));
      if (Array.isArray(past) && past.length) {
        const next = past.map(normalizePast);
        setPastEvents(next);
        setActiveId((cur) => (next.some((e) => e.id === cur) ? cur : next[0]?.id));
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const selectByOffset = useCallback((delta) => {
    if (!pastEvents.length) return;
    const next = (activeIndex + delta + pastEvents.length) % pastEvents.length;
    setActiveId(pastEvents[next].id);
  }, [activeIndex, pastEvents]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const activeKey = useMemo(() => active?.id || 'none', [active?.id]);

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

      <section className="exp-upcoming-section section-bg-cream" id="upcoming-events">
        <div className="container">
          <header className="exp-upcoming-head">
            <p className="sp-eyebrow" style={{ color: '#c47a0a' }}>Event bookings</p>
            <h2>Upcoming</h2>
            <p>Reserve a seat for the next gatherings in the hills — limited spots with host families.</p>
          </header>
          <div className="exp-upcoming-grid">
            {upcoming.map((ev) => {
              const when =
                ev.dateLabel ||
                (ev.month && ev.day
                  ? `${ev.month.charAt(0)}${ev.month.slice(1).toLowerCase()} ${ev.day}`
                  : '');
              const detailHref = experiencePath(ev.slug || ev.id);
              return (
                <article key={ev.id} className="exp-upcoming-card">
                  <a href={detailHref} className="exp-upcoming-media-link">
                    <div className="exp-upcoming-media">
                      <img src={ev.img} alt={ev.title} />
                      {when ? (
                        <div className="exp-upcoming-date">
                          <span className="exp-upcoming-starts">Starts -</span>
                          <span className="exp-upcoming-when">{when}</span>
                        </div>
                      ) : null}
                    </div>
                  </a>
                  <div className="exp-upcoming-body">
                    <span className="exp-upcoming-tag">{ev.tag}</span>
                    <h3>
                      <a href={detailHref}>{ev.title}</a>
                    </h3>
                    <p>{ev.desc}</p>
                    <p className="exp-upcoming-meta">
                      {[ev.place, ev.spots].filter(Boolean).join(' · ')}
                    </p>
                    <div className="exp-upcoming-actions">
                      <a className="btn btn-amber exp-upcoming-book" href={detailHref}>
                        Book now
                      </a>
                      <EventShareMenu event={ev} className="exp-upcoming-share" />
                    </div>
                  </div>
                </article>
              );
            })}
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

          {active ? (
            <div className="immersion-stage" data-reveal="up">
              <a
                className="immersion-hero"
                href={experiencePath(active.slug || active.id)}
                key={activeKey}
                onTouchStart={onHeroTouchStart}
                onTouchEnd={onHeroTouchEnd}
              >
                <img className="immersion-hero-photo" src={active.img} alt={active.title} />
                <div className="immersion-hero-shade" />
                <div className="immersion-hero-copy">
                  <div className="immersion-hero-meta">
                    <span className="immersion-tag">{active.tag}</span>
                    {active.date ? (
                      <span className="immersion-hero-date">{active.date}</span>
                    ) : null}
                  </div>
                  <h3 className="immersion-hero-title">{active.title}</h3>
                  <p className="immersion-hero-desc">{active.desc}</p>
                  <p className="immersion-hero-swipe-hint">Swipe photo · tap a card · open details</p>
                </div>
              </a>

              <div className="immersion-rail" role="list" aria-label="Browse past experiences" ref={railRef}>
                {pastEvents.map((exp) => (
                  <button
                    key={exp.id}
                    type="button"
                    role="listitem"
                    className={`immersion-chip immersion-chip--text immersion-chip--card${activeId === exp.id ? ' is-active' : ''}`}
                    onClick={() => setActiveId(exp.id)}
                    onDoubleClick={() => {
                      window.location.assign(experiencePath(exp.slug || exp.id));
                    }}
                    aria-pressed={activeId === exp.id}
                  >
                    <span className="immersion-chip-emoji" aria-hidden="true">
                      {exp.emoji}
                    </span>
                    <img className="immersion-chip-img" src={exp.img} alt="" />
                    <span className="immersion-chip-body">
                      <span className="immersion-chip-title">{exp.title}</span>
                      <span className="immersion-chip-meta">
                        <span className="immersion-chip-tag">{exp.tag}</span>
                        {exp.date ? <span className="immersion-chip-date">{exp.date}</span> : null}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <AdSlot adId="experiences-ad1" />

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Ready to join one of these?</h2>
          <p>Match your vibe first — then stay somewhere that opens the door to these gatherings.</p>
          <div className="sp-hero-actions">
            <a href="#upcoming-events" className="btn btn-amber">Join upcoming events</a>
            <a
              href={whatsappChatUrl(
                "Hi Ezy Escape! I'd like to talk to a curator about joining an experience or festival gathering in the hills. Could you help?"
              )}
              className="btn btn-ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to curator
            </a>
          </div>
        </div>
      </section>

      <AdSlot adId="experiences-ad2" />
    </SiteChrome>
  );
}
