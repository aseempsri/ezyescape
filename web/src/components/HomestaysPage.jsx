import { useEffect, useState } from 'react';
import { fetchStays } from '../lib/api';
import {
  FALLBACK_STAYS,
  STAY_FILTERS,
  normalizeApiStay,
  stayMatchesFilter,
} from '../utils/stays';
import { appPath, goHome, goStay } from '../utils/paths';
import assetUrl from '../utils/assetUrl';
import '../styles/index.css';
import '../styles/hero-nav.css';
import '../styles/mobile.css';
import '../styles/stay-page.css';
import '../styles/homestays-page.css';

export default function HomestaysPage() {
  const [filter, setFilter] = useState('all');
  const [stays, setStays] = useState(FALLBACK_STAYS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Homestays — Ezy Escape';
    return () => { document.title = 'Ezy Escape — Curated Mountain Homestays'; };
  }, []);

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

  return (
    <div className="homestays-page">
      <header className="stay-page-nav">
        <a
          href={appPath()}
          className="stay-page-logo"
          onClick={(e) => { e.preventDefault(); goHome(); }}
        >
          <img
            src={assetUrl('images/logo.png')}
            alt="Ezy Escape"
            onError={(e) => { e.target.outerHTML = 'Ezy<em>Escape</em>'; }}
          />
        </a>
        <a href={appPath()} className="stay-page-back" onClick={(e) => { e.preventDefault(); goHome(); }}>
          ← Home
        </a>
      </header>

      <div className="homestays-hero">
        <p className="homestays-eyebrow">Curated Collection</p>
        <h1>Homestays</h1>
        <p className="homestays-sub">
          Every home has a story. Browse the full collection and filter by the kind of escape you want.
        </p>
      </div>

      <div className="homestays-filters" role="tablist" aria-label="Filter homestays">
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

      {loading && <p className="homestays-status">Loading stays…</p>}

      <div className="homestays-grid">
        {stays.map((stay) => {
          const active = stayMatchesFilter(stay.cat, filter);
          return (
            <article
              key={stay.id}
              className={`homestay-card${active ? '' : ' is-dimmed'}`}
              role="link"
              tabIndex={active ? 0 : -1}
              aria-disabled={!active}
              onClick={() => { if (active) goStay(stay.slug || stay.id); }}
              onKeyDown={(e) => {
                if (!active) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goStay(stay.slug || stay.id);
                }
              }}
            >
              <div
                className="homestay-card-img"
                style={{ backgroundImage: `url('${stay.image}')` }}
              >
                <div className="homestay-card-overlay" />
                <div className="homestay-card-tags">
                  <span className="s-tag">{stay.guest} Adults</span>
                  <span className="s-tag">{stay.rooms} Rooms</span>
                </div>
              </div>
              <div className="homestay-card-body">
                <p className="homestay-card-loc">{stay.location}</p>
                <h2>{stay.title}</h2>
                <p className="homestay-card-price">
                  {stay.disPrice ? <del>₹ {stay.disPrice}</del> : null}
                  <strong>₹ {stay.price}</strong>
                  <span>/ night</span>
                </p>
                {stay.best && <p className="homestay-card-best">{stay.best}</p>}
                <span className="homestay-card-cta">View stay →</span>
              </div>
            </article>
          );
        })}
      </div>

      {!loading && stays.length === 0 && (
        <p className="homestays-status">No homestays listed yet.</p>
      )}

      <p className="homestays-footnote">
        Looking for something specific?{' '}
        <a href={appPath('#quiz')}>Take the match quiz</a>.
      </p>
    </div>
  );
}
