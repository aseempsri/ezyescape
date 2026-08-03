import { useMemo, useState } from 'react';
import Typewriter from './Typewriter';
import { EXPERIENCES, IMMERSION_MOMENTS } from '../data/experiences';

const GAP = 14;
const COLS = 4;
const ROWS = 5;

/** Convert 0-based cell spans into animatable absolute box styles. */
function cellBox(c1, r1, c2, r2) {
  const colSpan = c2 - c1;
  const rowSpan = r2 - r1;
  const colTrack = `(100% - ${(COLS - 1) * GAP}px) / ${COLS}`;
  const rowTrack = `(100% - ${(ROWS - 1) * GAP}px) / ${ROWS}`;
  return {
    left: `calc(${c1} * (${colTrack} + ${GAP}px))`,
    top: `calc(${r1} * (${rowTrack} + ${GAP}px))`,
    width: `calc(${colSpan} * (${colTrack}) + ${(colSpan - 1) * GAP}px)`,
    height: `calc(${rowSpan} * (${rowTrack}) + ${(rowSpan - 1) * GAP}px)`,
  };
}

const DEFAULT_LAYOUT = {
  kitchen: cellBox(0, 0, 2, 3),
  sunrise: cellBox(2, 0, 3, 1),
  forest: cellBox(3, 0, 4, 1),
  farm: cellBox(2, 1, 4, 5),
  culture: cellBox(0, 3, 1, 5),
  waterfall: cellBox(1, 3, 2, 5),
};

/** Focused card always left ~75%; others always stack on the right in fixed order. */
function layoutForFocus(focusId) {
  if (!focusId) return DEFAULT_LAYOUT;

  const others = EXPERIENCES.filter((e) => e.id !== focusId);
  const layout = {
    [focusId]: cellBox(0, 0, 3, 5),
  };
  others.forEach((exp, i) => {
    layout[exp.id] = cellBox(3, i, 4, i + 1);
  });
  return layout;
}

export default function ImmersionSection() {
  const [activeId, setActiveId] = useState(null);
  const layout = useMemo(() => layoutForFocus(activeId), [activeId]);

  const onClickTile = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="immersion-section immersion-section--light section-bg-white" id="experiences">
      <div className="container immersion-inner">
        <header className="immersion-intro" data-reveal="up">
          <div className="eyebrow eyebrow--underline" style={{ color: '#101e2c' }}>
            Local Immersion
          </div>
          <h2 className="immersion-title">
            <span className="immersion-title-lead">Your stay can be</span>
            <br />
            <span className="immersion-title-script">
              <em id="typewriter-5" className="typewriter-cursor">
                <Typewriter text="more than a stay" className="" style={{ fontStyle: 'normal' }} />
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

        <div
          className="immersion-gallery"
          data-focus={activeId || undefined}
          data-reveal="up"
          data-delay="2"
        >
          {EXPERIENCES.map((exp) => {
            const isFocus = activeId === exp.id;
            return (
              <button
                key={exp.id}
                type="button"
                className={`immersion-tile${isFocus ? ' is-focus' : ''}${activeId && !isFocus ? ' is-side' : ''}`}
                style={layout[exp.id]}
                aria-pressed={isFocus}
                onClick={() => onClickTile(exp.id)}
              >
                <img className="immersion-tile-photo" src={exp.img} alt="" />
                <span className="immersion-tile-shade" aria-hidden="true" />
                <span className="immersion-tile-emoji" aria-hidden="true">{exp.emoji}</span>
                <span className="immersion-tile-tag">{exp.tag}</span>
                <span className="immersion-tile-title">{exp.title}</span>
                <span className="immersion-tile-desc">{exp.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
