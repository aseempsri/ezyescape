import { useCallback, useEffect, useState } from 'react';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import Grain from './components/Grain';
import Marquee from './components/Marquee';
import Magnetic from './components/Magnetic';
import Typewriter from './components/Typewriter';
import InlineQuiz from './components/InlineQuiz';
import ImmersionSection from './components/ImmersionSection';
import HomeExperiencesSection from './components/HomeExperiencesSection';
import StaysSection from './components/StaysSection';
import Footer from './components/Footer';
import MobileBar from './components/MobileBar';
import useCustomCursor from './hooks/useCustomCursor';
import useScrollNav from './hooks/useScrollNav';
import useReveal from './hooks/useReveal';
import useCounterAnimation from './hooks/useCounterAnimation';
import assetUrl from './utils/assetUrl';
import { whatsappChatUrl } from './utils/whatsapp';
import { hasSeenSplash } from './utils/splash';
import PostcardsSection from './components/PostcardsSection';
import SeoHead, { organizationJsonLd } from './components/SeoHead';
import AdSlot from './components/AdSlot';
import './styles/index.css';
import './styles/mobile.css';
import './styles/hero-nav.css';
import './styles/quiz-match.css';
import './styles/immersion.css';

const HERO_BG = assetUrl('images/ju.jpg');

function CompareStack({ badLabel, goodLabel, badItems, goodItems, minHeight }) {
  return (
    <div className="compare-stack" style={minHeight ? { minHeight } : undefined}>
      <div className="compare-card bad" data-reveal="right">
        <div className="compare-label bad">{badLabel}</div>
        {badItems.map((t) => (
          <div key={t} className="compare-item"><span className="ci-icon">—</span><p>{t}</p></div>
        ))}
      </div>
      <div className="compare-card good" data-reveal="right" data-delay="2">
        <div className="compare-label good">{goodLabel}</div>
        {goodItems.map((t) => (
          <div key={t} className="compare-item"><span className="ci-icon">✓</span><p>{t}</p></div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [heroLoaded, setHeroLoaded] = useState(() => hasSeenSplash());
  const handleHeroReady = useCallback(() => setHeroLoaded(true), []);

  useCustomCursor();
  useScrollNav(60);
  useReveal();
  useCounterAnimation();

  useEffect(() => {
    document.querySelectorAll('.t-card,.b-cell.large').forEach((card) => {
      const onMove = (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      };
      const onLeave = () => { card.style.transform = ''; };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });
  }, []);

  return (
    <>
      <SeoHead
        title="Ezy Escape — Curated Mountain Homestays in Kumaon"
        description="Discover authentic mountain homestays in Almora, Ranikhet, Nainital and Kausani — matched to how you travel, hosted by local families."
        path="/"
        jsonLd={organizationJsonLd()}
      />
      <Cursor />
      <Grain />
      <Loader onHeroReady={handleHeroReady} />
      <Nav />

      <section className={`hero${heroLoaded ? ' loaded' : ''}`} id="heroSection">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="hero-vignette" />
        <div className="hero-shade" />
        <div className="hero-fog" />

        <a
          href="#"
          className={`hero-mobile-logo${heroLoaded ? ' hero-mobile-logo--landed' : ''}`}
          aria-label="Ezy Escape home"
        >
          <img src={assetUrl('images/logo.png')} alt="Ezy Escape" />
        </a>

        <div className="hero-content">
          <div className="hero-inner">
            <div className="hero-copy">
              <h1 className="hero-title">
                <span className="line-wrap">
                  <span className="line-inner line-1">Tourists book their stays</span>
                </span>
                <span className="line-wrap line-wrap--type">
                  <span className="line-inner line-2 typewriter-text">
                    <Typewriter text="Travellers match their vibes" className="typewriter-cursor" style={{ fontStyle: 'normal', color: '#fff' }} />
                  </span>
                </span>
              </h1>
              <p className="hero-sub">
                Discover authentic mountain homes hosted by local families — matched to how you actually travel.
              </p>
              <div className="hero-actions">
                <a href="#quiz" className="btn btn-amber">
                  Match My Stay <span className="btn-arrow">→</span>
                </a>
                <div className="btn-row">
                  <a href="#stays" className="btn btn-ghost">Explore Homes</a>
                  <a href="#quiz" className="btn btn-ghost">Take the Quiz</a>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-btns">
                <Magnetic>
                  <a href="#quiz" className="btn btn-amber">Match My Stay <span className="btn-arrow">→</span></a>
                </Magnetic>
                <Magnetic>
                  <a href="#stays" className="btn btn-ghost">Explore Homes</a>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="mouse"><div className="mouse-wheel" /></div>
          <span>Scroll</span>
        </div>
      </section>

      <Marquee />

      <section className="why-section section-bg-cream" id="why" style={{ paddingBottom: 0, paddingTop: 100 }}>
        <div className="container">
          <div className="why-grid">
            <div className="why-left">
              <div className="eyebrow eyebrow--underline" data-reveal><span className="eyebrow-line" />Feel The Difference</div>
              <h2 className="why-big-text" data-reveal>
                <span className="why-big-line">Most travel sites sell rooms.</span>
                <br />
                <span className="why-script-line">
                  <em id="typewriter-text" className="typewriter-cursor" style={{ fontWeight: 600 }}>
                    <Typewriter text="We match you with the right home" className="" style={{ fontStyle: 'normal' }} />
                  </em>
                </span>
              </h2>
              <p className="why-desc" data-reveal>
                Built for travellers who want meaning, culture and human connection — not a hotel wearing a homestay name. Every recommendation is shaped by how you actually like to travel.
              </p>
              <a href="#quiz" className="btn btn-amber" data-reveal style={{ fontSize: '1rem' }}>Find My Match </a>
            </div>
            <div className="why-right">
              <CompareStack
                badLabel="✗ Regular booking sites"
                goodLabel="✦ EzyEscape"
                badItems={[
                  'Show hundreds of undifferentiated listings',
                  'Focus mainly on price and amenity checkboxes',
                  'Same filters for every type of traveller',
                  'Very little about the host family or their story',
                  'No honest expectation-setting before booking',
                ]}
                goodItems={[
                  'Curated homestays only — no listing spam',
                  'Recommendations based on your travel style',
                  'Honest expectations set before you book',
                  'Local families, food and culture at the centre',
                  'A human trip curator helps you choose',
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="quiz-section match-section match-section--light section-bg-white" id="quiz">
        <div className="match-section-veil" aria-hidden="true" />
        <div className="container match-section-inner">
          <header className="match-intro" data-reveal="up">
            <div className="eyebrow match-intro-eyebrow eyebrow--underline" style={{ justifyContent: 'center' }}>
              Mountain Matchmaker
            </div>
            <h2 className="why-big-text match-intro-title" data-reveal>
              <span className="why-big-line">Know your vibe.</span>
              <br />
              <span className="match-intro-script">
                <em id="typewriter-1" className="typewriter-cursor">
                  <Typewriter text="Match your stay" className="" style={{ fontStyle: 'normal' }} />
                </em>
              </span>
            </h2>
            <p className="match-intro-sub">
              Five honest questions. We point you toward homes that fit how you travel.
            </p>
          </header>

          <div className="match-wrap" data-reveal="up" data-delay="2">
            <InlineQuiz />
          </div>
        </div>
      </section>

      <StaysSection />

      <section className="honest-section section-bg-white" style={{ paddingTop: 100, paddingBottom: 110 }}>
        <div className="container">
          <div className="why-grid honest-layout">
            <div className="why-left honest-left">
              <div className="eyebrow eyebrow--underline" data-reveal>
                <span className="eyebrow-line" />Honest by Design
              </div>
              <h2 className="why-big-text" data-reveal>
                <span className="why-big-line">We are not</span>
                <br />
                <span className="why-script-line honest-script">
                  <em id="typewriter-3" className="typewriter-cursor">
                    <Typewriter text="for everyone." className="" style={{ fontStyle: 'normal' }} />
                  </em>
                </span>
              </h2>
              <p className="why-desc honest-desc" data-reveal>
                The right guest matters to us as much as the right stay matters to you. So we say this plainly.
              </p>
              <Magnetic>
                <a href="#quiz" className="btn btn-amber honest-cta" data-reveal>
                  <span className="honest-cta-text">This sounds like me — Match My Stay</span>
                  <span className="btn-arrow" aria-hidden="true">→</span>
                </a>
              </Magnetic>
            </div>
            <div className="why-right">
              <CompareStack
                badLabel="🚫 Don't book with us if"
                goodLabel="✦ You'll love Ezy Escape if…"
                badItems={[
                  'You want a hotel wearing a homestay name',
                  'Your vacation needs a swimming pool, DJ or buffet counter',
                  'You expect room service every single hour',
                  'You want the mountains to feel exactly like the city',
                  'You\'d rather not interact with the people who make the place special',
                ]}
                goodItems={[
                  'You want the mountains to feel personal and authentic',
                  'You enjoy stories, people and home-cooked food',
                  'You appreciate village life, nature and local culture',
                  'You seek meaningful travel over commercial tourism',
                  'You want to belong to the mountains — not just visit',
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <HomeExperiencesSection />

      <ImmersionSection />

      <section className="impact-section section-bg-cream" id="impact" style={{ paddingTop: 80, paddingBottom: 110 }}>
        <div className="container">
          <div className="w">
            <div style={{ textAlign: 'center', marginBottom: 14 }} data-reveal="up">
              <div className="eyebrow eyebrow--underline" style={{ justifyContent: 'center' }}>Responsible Tourism</div>
              <h2 className="why-big-text" data-reveal>
                <span className="why-big-line">Your stay supports</span>
                <br />
                <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(2.4rem, 3.9vw, 3.55rem)', color: '#1a181c' }}>
                  <em id="typewriter-6" className="typewriter-cursor" style={{ color: '#1a181c' }}>
                    <Typewriter text="a local family." className="" style={{ fontStyle: 'normal', color: '#1a181c' }} />
                  </em>
                </span>
              </h2>
            </div>
            <div className="impact-grid">
              {[
                { count: 40, suf: '+', lbl: <>Local Family<br />Partnerships</> },
                { count: 15, suf: '', lbl: <>Villages<br />Supported</> },
                { count: 100, suf: '%', lbl: <>Local Experiences<br />Built</> },
                { count: 24, suf: '/7', lbl: <>Guest Matching<br />Support</> },
              ].map((item, i) => (
                <div key={i} className="impact-item" data-reveal="up" data-delay={String(i + 1)}>
                  <span className="i-num" data-count={item.count} data-suf={item.suf}>0</span>
                  <div className="i-lbl">{item.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PostcardsSection />

      <MobileBar />

      <section className="cta-section section-bg-cream" style={{ paddingTop: 40, paddingBottom: 110 }}>
        <div className="cta-bg-glow" />
        <div className="w" style={{ position: 'relative', zIndex: 1 }}>
          <div data-reveal="up">
            <div className="eyebrow eyebrow--underline" style={{ justifyContent: 'center' }}>Ready to Escape?</div>
            <h2 className="why-big-text" data-reveal>
              Find a mountain home<br />
              <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(4.4vw,4.4vw,4.4vw)' }}>
                <em id="typewriter-8" className="typewriter-cursor" style={{ color: '#132b45' }}>
                  <Typewriter text="that matches you." className="" style={{ fontStyle: 'normal', color: '#132b45' }} />
                </em>
              </span>
            </h2>
            <p className="cta-sub">Skip the endless scrolling. Tell us how you like to travel and we&apos;ll help you choose.</p>
          </div>
          <div className="cta-btns" data-reveal="up" data-delay="2">
            <Magnetic><a href="#quiz" className="btn btn-amber">Match My Stay <span className="btn-arrow">→</span></a></Magnetic>
            <Magnetic>
              <a
                href={whatsappChatUrl()}
                className="btn btn-ghost"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Talk to a Trip Curator
              </a>
            </Magnetic>
          </div>
        </div>
        <AdSlot adId="home-ad4" />
      </section>

      <Footer />
    </>
  );
}
