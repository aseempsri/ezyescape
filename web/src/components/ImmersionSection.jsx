import { useState } from 'react';
import Typewriter from './Typewriter';
import { EXPERIENCES, IMMERSION_MOMENTS } from '../data/experiences';
import assetUrl from '../utils/assetUrl';

const EXP_BG = assetUrl('images/bg.png');

export default function ImmersionSection() {
  const [activeId, setActiveId] = useState(EXPERIENCES[0].id);
  const active = EXPERIENCES.find((e) => e.id === activeId) || EXPERIENCES[0];

  return (
    <section
      className="immersion-section"
      id="experiences"
      style={{
        backgroundImage: `url(${EXP_BG}), url(${active.img})`,
      }}
    >
      <div className="immersion-veil" aria-hidden="true" />
      <div className="container immersion-inner">
        <header className="immersion-intro" data-reveal="up">
          <div className="eyebrow" style={{ color: '#fff' }}>
            <span className="line" />Local Immersion<span className="line" />
          </div>
          <h2 className="immersion-title">
            <span className="immersion-title-lead">Your stay can be</span>
            <br />
            <span className="immersion-title-script">
              <em id="typewriter-5" className="typewriter-cursor">
                <Typewriter text="more than a stay" className="" style={{ fontStyle: 'normal', color: '#fff' }} />
              </em>
            </span>
          </h2>
          <p className="immersion-sub">
            Cook with a local family, walk trails only locals know, sit by a bonfire or watch the stars from a quiet mountain home.
          </p>
          <div className="immersion-moments" aria-hidden="true">
            {IMMERSION_MOMENTS.map((m) => (
              <span key={m.label} className="immersion-moment">
                <span className="immersion-moment-emoji">{m.emoji}</span>
                {m.label}
              </span>
            ))}
          </div>
        </header>

        <div className="immersion-stage" data-reveal="up" data-delay="2">
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
            {EXPERIENCES.map((exp, i) => (
              <button
                key={exp.id}
                type="button"
                role="listitem"
                className={`immersion-chip${activeId === exp.id ? ' is-active' : ''}`}
                onMouseEnter={() => setActiveId(exp.id)}
                onFocus={() => setActiveId(exp.id)}
                onClick={() => setActiveId(exp.id)}
              >
                <span className="immersion-chip-num">{String(i + 1).padStart(2, '0')}</span>
                <img className="immersion-chip-img" src={exp.img} alt="" />
                <span className="immersion-chip-body">
                  <span className="immersion-chip-emoji" aria-hidden="true">{exp.emoji}</span>
                  <span className="immersion-chip-title">{exp.title}</span>
                  <span className="immersion-chip-tag">{exp.tag}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="immersion-gallery" data-reveal="up" data-delay="3">
          {EXPERIENCES.map((exp) => (
            <button
              key={`tile-${exp.id}`}
              type="button"
              className={`immersion-tile immersion-tile--${exp.size}${activeId === exp.id ? ' is-active' : ''}`}
              onMouseEnter={() => setActiveId(exp.id)}
              onFocus={() => setActiveId(exp.id)}
              onClick={() => setActiveId(exp.id)}
            >
              <img className="immersion-tile-photo" src={exp.img} alt="" />
              <span className="immersion-tile-shade" aria-hidden="true" />
              <span className="immersion-tile-emoji" aria-hidden="true">{exp.emoji}</span>
              <span className="immersion-tile-tag">{exp.tag}</span>
              <span className="immersion-tile-title">{exp.title}</span>
              <span className="immersion-tile-desc">{exp.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
