import { useEffect, useMemo, useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import PostcardCard from './PostcardCard';
import AddPostcardModal from './AddPostcardModal';
import { fetchPostcard, fetchPostcards } from '../lib/api';
import { homeSectionPath } from '../utils/paths';
import AdSlot from './AdSlot';
import '../styles/postcards.css';

export default function PostcardsPage({ focusId = '' }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [missingFocus, setMissingFocus] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchPostcards();
        if (cancelled) return;

        let next = Array.isArray(list) ? [...list] : [];

        if (focusId) {
          const idx = next.findIndex((p) => p.id === focusId);
          if (idx > 0) {
            const [hit] = next.splice(idx, 1);
            next = [hit, ...next];
          } else if (idx < 0) {
            const one = await fetchPostcard(focusId);
            if (cancelled) return;
            if (one) next = [one, ...next.filter((p) => p.id !== one.id)];
            else setMissingFocus(true);
          }
        }

        setCards(next);
      } catch {
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [focusId]);

  const ordered = useMemo(() => cards, [cards]);

  useEffect(() => {
    if (!focusId || loading) return undefined;
    const t = window.setTimeout(() => {
      const el = document.getElementById(`postcard-${focusId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
    return () => window.clearTimeout(t);
  }, [focusId, loading, ordered]);

  const title = focusId
    ? 'Guest Postcard — Ezy Escape'
    : 'Guest Postcards from the Ridge — Ezy Escape';
  const description = focusId
    ? 'A guest postcard from a mountain homestay stay with Ezy Escape in Kumaon.'
    : 'Notes and photos from travellers who stayed in Kumaon mountain homes — real stories from Almora, Ranikhet and beyond.';

  return (
    <SiteChrome
      title={title}
      description={description}
      path={focusId ? `/postcards/${encodeURIComponent(focusId)}` : '/postcards'}
    >
      <section className="sp-hero sp-hero--stories pc-page-hero">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <div className="pc-page-hero-row">
            <div>
              <p className="sp-eyebrow">Postcards</p>
              <h1 className="sp-title">
                <span className="sp-title-line">Notes from the ridge.</span>
                <br />
                <span className="sp-title-script">
                  <Typewriter text="Stamped by travellers." className="typewriter-cursor" speed={90} />
                </span>
              </h1>
              <p className="sp-lead">
                Real stays, real handwriting energy — photos, clips, and short letters from guests who found a home in the hills.
              </p>
              {missingFocus ? (
                <p className="pc-focus-miss">That postcard isn’t on the wall yet — browse the rest below.</p>
              ) : null}
            </div>
            <button type="button" className="btn btn-amber pc-add-btn" onClick={() => setModalOpen(true)}>
              Add review
            </button>
          </div>
        </div>
      </section>

      <section className="sp-section pc-wall">
        <div className="container">
          {loading ? (
            <p className="pc-wall-empty">Sorting the mail…</p>
          ) : ordered.length === 0 ? (
            <div className="pc-wall-empty">
              <p>The postcard wall is waiting for its first stamp.</p>
              <button type="button" className="btn btn-amber" onClick={() => setModalOpen(true)}>
                Be the first to write
              </button>
            </div>
          ) : (
            <div className="pc-wall-list">
              {ordered.map((p, i) => (
                <div
                  key={p.id}
                  className={`pc-wall-item${i % 2 === 1 ? ' pc-wall-item--tilt' : ''}${p.id === focusId ? ' pc-wall-item--focus' : ''}`}
                  style={{ '--pc-tilt': i % 2 === 1 ? '0.6deg' : '-0.4deg' }}
                >
                  <PostcardCard postcard={p} index={i} highlighted={p.id === focusId} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <AdSlot adId="postcards-ad1" />

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Send the next postcard</h2>
          <p>Match your stay first — then leave a note for the next traveller.</p>
          <a href={homeSectionPath('quiz')} className="btn btn-amber">
            Match my stay →
          </a>
        </div>
      </section>

      <AdSlot adId="postcards-ad2" />

      <AddPostcardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </SiteChrome>
  );
}
