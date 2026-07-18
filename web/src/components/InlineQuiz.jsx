import { useEffect, useState } from 'react';
import { QUESTIONS, RESULTS, tallyAnswers } from '../data/quiz';

export default function InlineQuiz() {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [anim, setAnim] = useState('in');

  const q = QUESTIONS[cur];
  const progress = ((cur + (sel ? 0.35 : 0)) / QUESTIONS.length) * 100;

  useEffect(() => {
    const section = document.getElementById('quiz');
    if (!section || !q?.scene) return;
    section.style.setProperty('--quiz-scene', `url('${q.scene}')`);
  }, [q]);

  const goNext = () => {
    if (!sel) return;
    const next = [...answers, sel];
    setAnim('out');
    window.setTimeout(() => {
      if (cur >= QUESTIONS.length - 1) {
        setAnswers(next);
        setDone(true);
        setAnim('in');
        const section = document.getElementById('quiz');
        const vibe = RESULTS[tallyAnswers(next)] || RESULTS.mixed;
        if (section && vibe.img) {
          section.style.setProperty('--quiz-scene', `url('${vibe.img}')`);
        }
      } else {
        setAnswers(next);
        setCur((c) => c + 1);
        setSel(null);
        setAnim('in');
      }
    }, 280);
  };

  const goBack = () => {
    if (cur === 0) return;
    setAnim('out');
    window.setTimeout(() => {
      setCur((c) => c - 1);
      setAnswers((a) => a.slice(0, -1));
      setSel(null);
      setAnim('in');
    }, 220);
  };

  const retake = () => {
    setCur(0);
    setAnswers([]);
    setSel(null);
    setDone(false);
    setAnim('in');
    const section = document.getElementById('quiz');
    if (section && QUESTIONS[0]?.scene) {
      section.style.setProperty('--quiz-scene', `url('${QUESTIONS[0].scene}')`);
    }
  };

  if (done) {
    const res = RESULTS[tallyAnswers(answers)] || RESULTS.mixed;
    return (
      <div className={`match-result match-panel-${anim}`}>
        <div className="match-result-visual" style={{ backgroundImage: `url('${res.img}')` }}>
          <div className="match-result-visual-shade" />
          <span className="match-result-emoji" aria-hidden="true">{res.e}</span>
          <p className="match-result-kicker">{res.type}</p>
          <h3 className="match-result-title">{res.t}</h3>
        </div>
        <div className="match-result-body">
          <p className="match-result-desc">{res.d}</p>
          <div className="match-result-tags">
            {res.tags.map((t) => (
              <span key={t} className="match-result-tag">{t}</span>
            ))}
          </div>
          <div className="match-result-actions">
            <button type="button" className="retake-btn" onClick={retake}>
              Retake quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`match-console match-panel-${anim}`}>
      <div className="match-trail" aria-hidden="true">
        {QUESTIONS.map((step, i) => {
          const state = i < cur ? 'is-done' : i === cur ? 'is-active' : '';
          return (
            <div key={step.id} className={`match-trail-step ${state}`}>
              <span className="match-trail-node">{i + 1}</span>
              <span className="match-trail-label">{step.sceneLabel}</span>
            </div>
          );
        })}
      </div>

      <div className="match-progress-bar" aria-hidden="true">
        <span style={{ width: `${Math.max(8, progress)}%` }} />
      </div>

      <div className="match-stage">
        <aside className="match-scene">
          <div
            className="match-scene-photo"
            style={{ backgroundImage: `url('${q.scene}')` }}
            key={q.id}
          />
          <div className="match-scene-shade" />
          <div className="match-scene-copy">
            <span className="match-scene-step">Question {cur + 1} of {QUESTIONS.length}</span>
            <p className="match-scene-label">{q.sceneLabel}</p>
          </div>
        </aside>

        <div className="match-board">
          <p className="match-eyebrow">Mountain Matchmaker</p>
          <h3 className="match-question">{q.q}</h3>
          <p className="match-hint">{q.hint}</p>

          <div className={`match-opts match-opts--${q.opts.length}`}>
            {q.opts.map((o) => (
              <button
                key={o.v + o.t}
                type="button"
                className={`match-opt${sel === o.v ? ' is-sel' : ''}`}
                onClick={() => setSel(o.v)}
              >
                <span
                  className="match-opt-img"
                  style={{ backgroundImage: `url('${o.img}')` }}
                  aria-hidden="true"
                />
                <span className="match-opt-shade" aria-hidden="true" />
                <span className="match-opt-emoji" aria-hidden="true">{o.e}</span>
                <span className="match-opt-text">{o.t}</span>
                <span className="match-opt-check" aria-hidden="true">✓</span>
              </button>
            ))}
          </div>

          <div className="match-nav">
            <button
              type="button"
              className="q-back-btn"
              style={{ visibility: cur > 0 ? 'visible' : 'hidden' }}
              onClick={goBack}
            >
              ← Back
            </button>
            <span className="q-counter">{cur + 1} / {QUESTIONS.length}</span>
            <button
              type="button"
              className={`q-next-btn${sel ? ' active' : ''}`}
              onClick={goNext}
            >
              {cur >= QUESTIONS.length - 1 ? 'See my vibe →' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
