import { useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { PROPERTY_EXPERIENCES } from '../data/propertyExperiences';
import { homeSectionPath, staysIndexPath } from '../utils/paths';
import assetUrl from '../utils/assetUrl';
import AdSlot from './AdSlot';
import '../styles/immersion.css';

const EXP_BG = assetUrl('images/bg.png');

export default function ExperiencesPage() {
  const [activeId, setActiveId] = useState(PROPERTY_EXPERIENCES[0].id);
  const active = PROPERTY_EXPERIENCES.find((e) => e.id === activeId) || PROPERTY_EXPERIENCES[0];

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

      <section
        className="immersion-section immersion-section--page"
        id="experiences-stage"
        style={{ backgroundImage: `url(${EXP_BG}), url(${active.img})` }}
      >
        <div className="immersion-veil" aria-hidden="true" />
        <div className="container immersion-inner">
          <div className="immersion-stage" data-reveal="up">
            <article className="immersion-hero" key={active.id}>
              <img className="immersion-hero-photo" src={active.img} alt={active.title} />
              <div className="immersion-hero-shade" />
              <div className="immersion-hero-copy">
                <span className="immersion-tag">{active.tag}</span>
                <span className="immersion-hero-emoji" aria-hidden="true">{active.emoji}</span>
                <h3 className="immersion-hero-title">{active.title}</h3>
                <p className="immersion-hero-desc">{active.desc}</p>
              </div>
            </article>

            <div className="immersion-rail" role="list">
              {PROPERTY_EXPERIENCES.map((exp, i) => (
                <button
                  key={exp.id}
                  type="button"
                  role="listitem"
                  className={`immersion-chip immersion-chip--text${activeId === exp.id ? ' is-active' : ''}`}
                  onClick={() => setActiveId(exp.id)}
                >
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
