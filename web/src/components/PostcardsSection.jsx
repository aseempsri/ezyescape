import { useEffect, useState } from 'react';
import Typewriter from './Typewriter';
import HomePostcardStage from './HomePostcardStage';
import AddPostcardModal from './AddPostcardModal';
import { fetchPostcards } from '../lib/api';
import { postcardsPath } from '../utils/paths';
import '../styles/postcards.css';

export default function PostcardsSection() {
  const [cards, setCards] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPostcards();
        if (!cancelled) setCards(list.slice(0, 12));
      } catch {
        if (!cancelled) setCards([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="pc-home section-bg-white" id="stories">
      <div className="container">
        <div className="pc-home-head" data-reveal="up">
          <div>
            <div className="eyebrow eyebrow--underline">Postcards</div>
            <h2 className="why-big-text" data-reveal>
              <span className="why-big-line">Guests come for the mountains.</span>
              <br />
              <span className="why-script-line stories-script">
                <em className="typewriter-cursor">
                  <Typewriter
                    text="They leave a postcard."
                    className=""
                    style={{ fontStyle: 'normal' }}
                  />
                </em>
              </span>
            </h2>
          </div>
          <div className="pc-home-actions">
            <button type="button" className="btn btn-amber pc-add-btn" onClick={() => setModalOpen(true)}>
              Add review
            </button>
            <a href={postcardsPath()} className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
              Full wall →
            </a>
          </div>
        </div>

        <div className="pc-home-stage-wrap" data-reveal="up">
          {cards.length === 0 ? (
            <p style={{ color: 'rgba(16,30,44,.55)', textAlign: 'center' }}>
              The first postcards are on their way — share yours while you wait.
            </p>
          ) : (
            <HomePostcardStage cards={cards} />
          )}
        </div>

        <div className="pc-home-foot" data-reveal="up">
          <a href={postcardsPath()} className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
            Read more postcards <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>

      <AddPostcardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
