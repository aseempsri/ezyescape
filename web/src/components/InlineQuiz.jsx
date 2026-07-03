import { useState } from 'react';
import { QUESTIONS, RESULTS, tallyAnswers } from '../data/quiz';
import Magnetic from './Magnetic';

export default function InlineQuiz() {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [panelStyle, setPanelStyle] = useState({});

  const updatePips = () =>
    QUESTIONS.map((_, i) => {
      if (i < cur) return 'done';
      if (i === cur) return 'active';
      return '';
    });

  const finish = () => {
    if (!sel) return;
    const next = [...answers, sel];
    if (cur >= QUESTIONS.length - 1) {
      setAnswers(next);
      setPanelStyle({ opacity: 0, transform: 'translateX(-30px)' });
      setTimeout(() => setDone(true), 350);
    } else {
      setAnswers(next);
      setPanelStyle({ opacity: 0, transform: 'translateX(-24px)' });
      setTimeout(() => {
        setCur((c) => c + 1);
        setSel(null);
        setPanelStyle({ transform: 'translateX(24px)' });
        requestAnimationFrame(() => {
          setPanelStyle({ opacity: 1, transform: 'none', transition: 'opacity .35s, transform .35s' });
          setTimeout(() => setPanelStyle({}), 400);
        });
      }, 200);
    }
  };

  const retake = () => {
    setCur(0);
    setAnswers([]);
    setSel(null);
    setDone(false);
    setPanelStyle({});
  };

  if (done) {
    const res = RESULTS[tallyAnswers(answers)] || RESULTS.mixed;
    return (
      <div className="q-result show">
        <span className="q-result-emoji">{res.e}</span>
        <div className="q-result-type">{res.type}</div>
        <div className="q-result-title">{res.t}</div>
        <p className="q-result-desc">{res.d}</p>
        <div className="q-result-tags">
          {res.tags.map((t) => <span key={t} className="q-result-tag">{t}</span>)}
        </div>
        <div className="q-result-btns">
          <Magnetic>
            <a href="#stays" className="btn btn-amber" style={{ fontSize: '.85rem', padding: '12px 24px' }}>
              See Matched Stays <span className="btn-arrow">→</span>
            </a>
          </Magnetic>
          <button type="button" className="retake-btn" onClick={retake}>Retake Quiz</button>
        </div>
      </div>
    );
  }

  const q = QUESTIONS[cur];
  const pips = updatePips();

  return (
    <>
      <div className="q-progress">
        {pips.map((cls, i) => (
          <div key={i} className={`q-pip${cls ? ` ${cls}` : ''}`} />
        ))}
      </div>
      <div id="qPanel" style={panelStyle}>
        <div className="q-eyebrow">Question {cur + 1} of {QUESTIONS.length}</div>
        <div className="q-text">{q.q}</div>
        <div className="q-hint">{q.hint}</div>
        <div className="q-opts">
          {q.opts.map((o) => (
            <button
              key={o.v}
              type="button"
              className={`q-opt${sel === o.v ? ' sel' : ''}`}
              onClick={() => setSel(o.v)}
            >
              <span className="q-opt-emoji">{o.e}</span>
              <div className="q-opt-text">{o.t}</div>
            </button>
          ))}
        </div>
        <div className="q-nav">
          <button
            type="button"
            className="q-back-btn"
            style={{ visibility: cur > 0 ? 'visible' : 'hidden' }}
            onClick={() => { setCur((c) => c - 1); setAnswers((a) => a.slice(0, -1)); setSel(null); }}
          >
            ← Back
          </button>
          <span className="q-counter">{cur + 1} / {QUESTIONS.length}</span>
          <button type="button" className={`q-next-btn${sel ? ' active' : ''}`} onClick={finish}>Next →</button>
        </div>
      </div>
    </>
  );
}
