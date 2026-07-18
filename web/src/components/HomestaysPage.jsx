import { useEffect, useMemo, useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { fetchStays } from '../lib/api';
import {
  FALLBACK_STAYS,
  STAY_FILTERS,
  normalizeApiStay,
  stayMatchesFilter,
} from '../utils/stays';
import { goStay, homeSectionPath, storiesPath } from '../utils/paths';
import assetUrl from '../utils/assetUrl';
import '../styles/homestays-page.css';

function StayTile({ stay, featured = false }) {
  return (
    <article
      className={`hs-tile${featured ? ' hs-tile--feature' : ''}`}
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
          <span>{stay.guest} adults</span>
          <span>{stay.rooms} rooms</span>
        </div>
        {featured && (
          <div className="hs-tile-feature-copy">
            <p className="hs-tile-loc">{stay.location}</p>
            <h2>{stay.title}</h2>
          </div>
        )}
      </div>
      <div className="hs-tile-body">
        {!featured && (
          <>
            <p className="hs-tile-loc">{stay.location}</p>
            <h2>{stay.title}</h2>
          </>
        )}
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

export default function HomestaysPage() {
  const [filter, setFilter] = useState('all');
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

  const visible = useMemo(
    () => stays.filter((s) => stayMatchesFilter(s.cat, filter)),
    [stays, filter],
  );

  const featured = filter === 'all' && visible.length > 0 ? visible[0] : null;
  const rest = featured ? visible.slice(1) : visible;

  return (
    <SiteChrome title="Homestays — Ezy Escape">
      <section
        className="sp-hero sp-hero--homestays"
        style={{ backgroundImage: `url('${assetUrl('images/ju.png')}')` }}
      >
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
          <div className="sp-hero-actions">
            <a href={homeSectionPath('quiz')} className="btn btn-amber">
              Match My Stay →
            </a>
          </div>
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
          </div>

          {!loading && visible.length === 0 && (
            <p className="hs-empty">No homes match this filter yet. Try All, or take the quiz.</p>
          )}

          {featured && (
            <div className="hs-feature-wrap">
              <StayTile stay={featured} featured />
            </div>
          )}

          <div className="hs-mosaic">
            {rest.map((stay) => (
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

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Still deciding?</h2>
          <p>Tell us how you travel. We’ll match a mountain home to your vibe.</p>
          <div className="sp-hero-actions">
            <a href={homeSectionPath('quiz')} className="btn btn-amber">Match My Stay →</a>
            <a href={storiesPath()} className="btn btn-ghost">Read guest stories</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
