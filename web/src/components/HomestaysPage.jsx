import { useEffect, useMemo, useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { fetchStays } from '../lib/api';
import {
  FALLBACK_STAYS,
  STAY_FILTERS,
  normalizeApiStay,
  stayCardChip,
  stayMatchesFilter,
  uniqueStayLocations,
} from '../utils/stays';
import { goStay, homeSectionPath, postcardsPath } from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';
import AdSlot from './AdSlot';
import '../styles/homestays-page.css';

function StayTile({ stay }) {
  const chip = stayCardChip(stay);

  return (
    <article
      className="hs-tile"
      role="link"
      tabIndex={0}
      onClick={() => goStay(stay.slug || stay.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          goStay(stay.slug || stay.id);
        }
      }}
    >
      <div
        className="hs-tile-visual"
        style={{ backgroundImage: `url('${stay.image}')` }}
      >
        <div className="hs-tile-shade" />
        <div className="hs-tile-chips">
          <span className={`s-tag s-tag--chip s-tag--${chip.kind}`}>
            {chip.label}
          </span>
        </div>
      </div>
      <div className="hs-tile-body">
        <p className="hs-tile-loc">{stay.location}</p>
        <h2>{stay.title}</h2>
        <p className="hs-tile-price">
          {stay.disPrice ? <del>₹ {stay.disPrice}</del> : null}
          <strong>₹ {stay.price}</strong>
          <span>/ night</span>
        </p>
        {stay.best ? <p className="hs-tile-best">{stay.best}</p> : null}
        <span className="hs-tile-cta">View stay →</span>
      </div>
    </article>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="hs-to-top"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      ↑
    </button>
  );
}

export default function HomestaysPage() {
  const [filter, setFilter] = useState('all');
  const [location, setLocation] = useState('all');
  const [query, setQuery] = useState('');
  const [stays, setStays] = useState(FALLBACK_STAYS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchStays()
      .then((data) => {
        if (active && Array.isArray(data) && data.length) {
          setStays(data.map(normalizeApiStay));
        }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const locations = useMemo(() => uniqueStayLocations(stays), [stays]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return stays.filter((s) => {
      if (!stayMatchesFilter(s.cat, filter, s)) return false;
      if (location !== 'all' && String(s.location || '').toLowerCase() !== location.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      const hay = `${s.title} ${s.location} ${s.best} ${s.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [stays, filter, location, query]);

  return (
    <SiteChrome
      title="Homestays in Kumaon & Uttarakhand — Ezy Escape"
      description="Browse curated Kumaon homestays — quiet forest cottages, family valley homes, and Almora stays with hosts who know the hills."
      path="/stays"
    >
      <section className="sp-hero sp-hero--homestays">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Curated collection</p>
          <h1 className="sp-title">
            <span className="sp-title-line">Every home has a story.</span>
            <br />
            <span className="sp-title-script">
              <Typewriter text="Find the one that fits you." className="typewriter-cursor" speed={90} />
            </span>
          </h1>
          <p className="sp-lead">
            Browse mountain homes matched by pace, place, and people — not by star ratings.
          </p>
        </div>
      </section>

      <section className="sp-section hs-section">
        <div className="container">
          <div className="hs-toolbar">
            <div className="sp-section-head hs-toolbar-copy">
              <p className="sp-eyebrow">Homestays</p>
              <h2>
                {loading
                  ? 'Loading stays…'
                  : `${visible.length} home${visible.length === 1 ? '' : 's'}${filter === 'all' ? ' in the hills' : ` · ${STAY_FILTERS.find((f) => f.id === filter)?.label || ''}`}`}
              </h2>
            </div>
            <form
              className="hs-search"
              role="search"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="hs-search-field">
                <span className="visually-hidden">Search stays</span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, place, vibe…"
                />
              </label>
              <label className="hs-location-field">
                <span className="visually-hidden">Location</span>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="all">All locations</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </label>
              <button type="submit" className="btn btn-amber hs-search-btn">Search</button>
            </form>
          </div>

          <div className="hs-filters" role="tablist" aria-label="Filter homestays">
            {STAY_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`hs-filter${filter === f.id ? ' is-on' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {!loading && visible.length === 0 && (
            <p className="hs-empty">No homes match this search yet. Try clearing filters, or take the quiz.</p>
          )}

          <div className="hs-mosaic hs-mosaic--equal">
            {visible.map((stay) => (
              <StayTile key={stay.id} stay={stay} />
            ))}
          </div>

          <div className="hs-footnote">
            <p>
              Not sure which pace fits you?{' '}
              <a href={homeSectionPath('quiz')}>Take the match quiz</a>
              {' '}— we’ll point you to the right home.
            </p>
          </div>
        </div>
      </section>

      <AdSlot adId="homestays-ad1" />

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Still deciding?</h2>
          <p>Tell us how you travel. We’ll match a mountain home to your vibe.</p>
          <div className="sp-hero-actions">
            <a href={postcardsPath()} className="btn btn-ghost">Read postcards</a>
            <a
              href={whatsappChatUrl('Hi! I\'d like help picking a homestay.')}
              className="btn btn-amber"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to a curator →
            </a>
          </div>
        </div>
      </section>

      <AdSlot adId="homestays-ad2" />
      <BackToTop />
    </SiteChrome>
  );
}
