import { useState } from 'react';
import { QUESTIONS, RESULTS, tallyAnswers } from '../data/quiz';
import Magnetic from './Magnetic';
import { staysIndexPath } from '../utils/paths';
import { whatsappChatUrl } from '../utils/whatsapp';

export default function InlineQuiz() {
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const [anim, setAnim] = useState('in');

  const q = QUESTIONS[cur];
  const selectedOpt = q?.opts.find((o) => o.t === sel) || null;
  const sceneImg = selectedOpt?.img || q?.scene;

  const goNext = () => {
    if (!selectedOpt) return;
    const next = [...answers, selectedOpt.t];
    setAnim('out');
    window.setTimeout(() => {
      if (cur >= QUESTIONS.length - 1) {
        setAnswers(next);
        setDone(true);
        setAnim('in');
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
    const prevAnswer = answers[cur - 1] ?? null;
    setAnim('out');
    window.setTimeout(() => {
      setCur((c) => c - 1);
      setAnswers((a) => a.slice(0, -1));
      setSel(prevAnswer);
      setAnim('in');
    }, 220);
  };

  const retake = () => {
    setCur(0);
    setAnswers([]);
    setSel(null);
    setDone(false);
    setAnim('in');
  };

  if (done) {
    const vibes = answers.map((label, i) => (
      QUESTIONS[i]?.opts.find((o) => o.t === label)?.v || 'mixed'
    ));
    const res = RESULTS[tallyAnswers(vibes)] || RESULTS.mixed;
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
          {res.tags?.length > 0 && (
            <div className="match-result-tags">
              {res.tags.map((t) => (
                <span key={t} className="match-result-tag">{t}</span>
              ))}
            </div>
          )}
          <div className="match-result-actions">
            <Magnetic>
              <a href={staysIndexPath()} className="btn btn-amber">
                See matched stays <span className="btn-arrow">→</span>
              </a>
            </Magnetic>
            <a
              href={whatsappChatUrl(`Hi! I just finished the Mountain Matchmaker and got "${res.t}". Can you help me pick a stay?`)}
              className="btn btn-ghost match-result-wa"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talk to a curator
            </a>
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
      <div className="match-stage">
        <aside className="match-scene">
          <div
            className="match-scene-photo"
            style={{ backgroundImage: `url('${sceneImg}')` }}
            key={sceneImg}
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
                key={o.t}
                type="button"
                className={`match-opt${sel === o.t ? ' is-sel' : ''}`}
                onClick={() => setSel(o.t)}
              >
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
