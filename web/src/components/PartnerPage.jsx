import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { whatsappChatUrl } from '../utils/whatsapp';
import { contactPath, homeSectionPath } from '../utils/paths';

const BENEFITS = [
  { e: '🎯', t: 'Matched guests', d: 'We send travellers who already fit your home’s pace — quiet, family, trek, or workation.' },
  { e: '🤝', t: 'Human curation', d: 'No listing spam. A trip curator briefs guests before they arrive so expectations stay honest.' },
  { e: '📸', t: 'Story-led pages', d: 'Your property gets a cinematic page — gallery, moments, story, directions — not a bare amenity grid.' },
  { e: '💬', t: 'Direct support', d: 'WhatsApp-first coordination for dates, pickups, and guest questions.' },
];

const STEPS = [
  { n: '01', t: 'Tell us about your home', d: 'Location, access, rooms, food, and the kind of traveller you love hosting.' },
  { n: '02', t: 'We visit or video-walk', d: 'We learn the house the way a guest would — light, noise, trails, kitchen rhythm.' },
  { n: '03', t: 'Go live with a full page', d: 'Photos, story, highlights, and booking flow that matches the rest of Ezy Escape.' },
];

const partnerWa = whatsappChatUrl(
  "Hi! I'd like to partner with Ezy Escape and list my homestay. Can you share how the partnership works?"
);

export default function PartnerPage() {
  return (
    <SiteChrome title="Partner With Us — Ezy Escape">
      <section className="sp-hero sp-hero--partner">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Partner with Ezy Escape</p>
          <h1 className="sp-title">
            <span className="sp-title-line">List a mountain home.</span>
            <br />
            <span className="sp-title-script">
              <Typewriter text="that deserves better guests." className="typewriter-cursor" speed={90} />
            </span>
          </h1>
          <p className="sp-lead">
            We work with host families who care about culture, honesty, and pace — not with hotels wearing a homestay name.
            If that sounds like you, let’s talk.
          </p>
          <div className="sp-hero-actions">
            <a href={partnerWa} className="btn btn-amber" target="_blank" rel="noopener noreferrer">
              Partner on WhatsApp →
            </a>
            <a href={contactPath()} className="btn btn-ghost">Contact the team</a>
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <div className="sp-section-head">
            <p className="sp-eyebrow">Why partner</p>
            <h2>Built for hosts who want the right fit</h2>
          </div>
          <div className="sp-card-grid sp-card-grid--4">
            {BENEFITS.map((b) => (
              <article key={b.t} className="sp-card">
                <span className="sp-card-emoji" aria-hidden="true">{b.e}</span>
                <h3>{b.t}</h3>
                <p>{b.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section sp-section--split">
        <div className="container sp-split">
          <div>
            <p className="sp-eyebrow">How it works</p>
            <h2>Three calm steps to going live</h2>
            <p className="sp-muted">
              We keep the process personal. No marketplace dashboards that bury your story under filters.
            </p>
          </div>
          <ol className="sp-steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="sp-step-n">{s.n}</span>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="sp-cta-band">
        <div className="container sp-cta-band-inner">
          <h2>Ready to host with intention?</h2>
          <p>Share a few photos and how you like to welcome guests. We’ll reply on WhatsApp.</p>
          <div className="sp-hero-actions">
            <a href={partnerWa} className="btn btn-amber" target="_blank" rel="noopener noreferrer">
              Start a partnership chat →
            </a>
            <a href={homeSectionPath('quiz')} className="btn btn-ghost">See how we match travellers</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
