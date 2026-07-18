import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { GUEST_STORIES } from '../data/sitePages';
import { staysIndexPath, homeSectionPath } from '../utils/paths';

export default function StoriesPage() {
  const [featured, ...rest] = GUEST_STORIES;

  return (
    <SiteChrome title="Guest Stories — Ezy Escape">
      <section className="sp-hero sp-hero--stories">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Guest stories</p>
          <h1 className="sp-title">
            <span className="sp-title-line">Guests come for the mountains.</span>
            <br />
            <span className="sp-title-script">
              <Typewriter text="They remember the people." className="typewriter-cursor" speed={90} />
            </span>
          </h1>
          <p className="sp-lead">
            Real stays. Real hosts. Notes from travellers who found a home that matched how they like to travel.
          </p>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <article className="sp-story-feature">
            <div
              className="sp-story-feature-visual"
              style={{ backgroundImage: `url('${featured.img}')` }}
            >
              <div className="sp-story-feature-shade" />
              <span className="sp-story-emoji" aria-hidden="true">{featured.emoji}</span>
              <p className="sp-story-kicker">{featured.place}</p>
              <h2>{featured.title}</h2>
            </div>
            <div className="sp-story-feature-body">
              <p className="sp-story-meta">
                {featured.name} · {featured.from}
              </p>
              <p className="sp-story-stay">Stayed at {featured.stay}</p>
              <p className="sp-lead">{featured.excerpt}</p>
              <div className="sp-tags">
                {featured.tags.map((t) => (
                  <span key={t} className="sp-tag">{t}</span>
                ))}
              </div>
              <a href={staysIndexPath()} className="btn btn-amber">Browse similar stays →</a>
            </div>
          </article>

          <div className="sp-story-grid">
            {rest.map((s) => (
              <article key={s.id} className="sp-story-card">
                <div className="sp-story-card-img" style={{ backgroundImage: `url('${s.img}')` }}>
                  <span aria-hidden="true">{s.emoji}</span>
                </div>
                <div className="sp-story-card-body">
                  <p className="sp-story-meta">{s.name} · {s.from}</p>
                  <h3>{s.title}</h3>
                  <p>{s.excerpt}</p>
                  <div className="sp-tags">
                    {s.tags.map((t) => (
                      <span key={t} className="sp-tag">{t}</span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Write the next chapter</h2>
          <p>Match your vibe first — then stay somewhere worth remembering.</p>
          <div className="sp-hero-actions">
            <a href={homeSectionPath('quiz')} className="btn btn-amber">Match My Stay →</a>
            <a href={staysIndexPath()} className="btn btn-ghost">View all homestays</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
