import { useEffect, useState } from 'react';
import Typewriter from './Typewriter';
import PostcardCard from './PostcardCard';
import AddPostcardModal from './AddPostcardModal';
import { fetchPostcards } from '../lib/api';
import { postcardsPath } from '../utils/paths';
import AdSlot from './AdSlot';
import '../styles/postcards.css';

export default function PostcardsSection() {
  const [cards, setCards] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPostcards();
        if (!cancelled) setCards(list.slice(0, 3));
      } catch {
        if (!cancelled) setCards([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="pc-home" id="stories">
      <div className="container">
        <div className="pc-home-head" data-reveal="up">
          <div>
            <div className="eyebrow" style={{ color: '#fff' }}>Postcards</div>
            <h2 className="why-big-text" data-reveal>
              Guests come for the mountains. <br />
              <span className="why-script-line stories-script">
                <em className="typewriter-cursor">
                  <Typewriter
                    text="They leave a postcard."
                    className=""
                    style={{ fontStyle: 'normal', color: '#fff' }}
                  />
                </em>
              </span>
            </h2>
          </div>
          <div className="pc-home-actions">
            <button type="button" className="btn btn-amber pc-add-btn" onClick={() => setModalOpen(true)}>
              Add review
            </button>
            <a href={postcardsPath()} className="btn btn-ghost" style={{ fontSize: '.85rem', color: '#fff' }}>
              Full wall →
            </a>
          </div>
        </div>

        <div className="pc-home-list">
          {cards.length === 0 ? (
            <p style={{ color: 'rgba(237,232,225,.55)', textAlign: 'center' }}>
              The first postcards are on their way — share yours while you wait.
            </p>
          ) : (
            cards.map((p, i) => (
              <div key={p.id} data-reveal="up">
                <PostcardCard postcard={p} index={i} />
              </div>
            ))
          )}
        </div>

        <div className="pc-home-foot" data-reveal="up">
          <a href={postcardsPath()} className="btn btn-ghost" style={{ fontSize: '.85rem', color: '#fff' }}>
            Read more postcards <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>

      <AdSlot adId="home-ad3" />

      <AddPostcardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
