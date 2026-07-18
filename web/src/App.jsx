import { useCallback, useEffect, useState } from 'react';
import Loader from './components/Loader';
import Nav from './components/Nav';
import Cursor from './components/Cursor';
import Grain from './components/Grain';
import Marquee from './components/Marquee';
import Magnetic from './components/Magnetic';
import Typewriter from './components/Typewriter';
import InlineQuiz from './components/InlineQuiz';
import StaysSection from './components/StaysSection';
import Footer from './components/Footer';
import MobileBar from './components/MobileBar';
import MobileAccountDock from './components/MobileAccountDock';
import useCustomCursor from './hooks/useCustomCursor';
import useScrollNav from './hooks/useScrollNav';
import useReveal from './hooks/useReveal';
import useCounterAnimation from './hooks/useCounterAnimation';
import assetUrl from './utils/assetUrl';
import { whatsappChatUrl } from './utils/whatsapp';
import './styles/index.css';
import './styles/mobile.css';
import './styles/hero-nav.css';
import './styles/quiz-match.css';

const HERO_BG = assetUrl('images/ju.png');
const EXP_BG = assetUrl('images/bg.png');

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
  const [heroLoaded, setHeroLoaded] = useState(false);
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
      <Cursor />
      <Grain />
      <Loader onHeroReady={handleHeroReady} />
      <MobileAccountDock />
      <Nav />

      <section className={`hero${heroLoaded ? ' loaded' : ''}`} id="heroSection">
        <div
          className="hero-bg"
          style={{
            backgroundImage: `url(${HERO_BG}), url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80)`,
          }}
        />
        <div className="hero-vignette" />
        <div className="hero-shade" />
        <div className="hero-fog" />

        <a href="#" className="hero-mobile-logo" aria-label="Ezy Escape home">
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

      <section className="why-section" id="why" style={{ paddingBottom: 0, paddingTop: 100 }}>
        <div className="container">
          <header className="why-header" data-reveal>
            <div className="eyebrow"><span className="eyebrow-line" />Feel The Difference</div>
            <h2 className="why-big-text">
              <span className="why-big-line">Most travel sites sell rooms.</span>
              <br />
              <span className="why-script-line">
                <em id="typewriter-text" className="typewriter-cursor" style={{ fontWeight: 600 }}>
                  <Typewriter text="We match you with the right home" className="" style={{ fontStyle: 'normal' }} />
                </em>
              </span>
            </h2>
          </header>

          <div className="why-grid">
            <div className="why-left">
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

      <section className="quiz-section match-section" id="quiz">
        <div className="match-section-bg" aria-hidden="true" />
        <div className="match-section-veil" aria-hidden="true" />
        <div className="container match-section-inner">
          <header className="match-intro" data-reveal="up">
            <div className="eyebrow match-intro-eyebrow" style={{ justifyContent: 'center', color: '#fff' }}>
              <span className="line" />Mountain Matchmaker<span className="line" />
            </div>
            <h2 className="why-big-text match-intro-title" data-reveal>
              <span className="why-big-line">Know your vibe.</span>
              <br />
              <span className="match-intro-script">
                <em id="typewriter-1" className="typewriter-cursor" style={{ color: '#fff' }}>
                  <Typewriter text="Match your stay" className="" style={{ fontStyle: 'normal', color: '#fff' }} />
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

      <section className="honest-section" style={{ paddingTop: 100, paddingBottom: 110 }}>
        <div className="container">
          <div className="why-grid honest-layout">
            <div className="why-left honest-left">
              <div className="eyebrow" data-reveal style={{ color: '#fff' }}>
                <span className="eyebrow-line" />Honest by Design
              </div>
              <h2 className="why-big-text" data-reveal>
                <span className="why-big-line">We are not</span>
                <br />
                <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(2rem,5vw,6rem)', color: '#fff' }}>
                  <em id="typewriter-3" className="typewriter-cursor" style={{ color: '#fff' }}>
                    <Typewriter text="for everyone." className="" style={{ fontStyle: 'normal', color: '#fff' }} />
                  </em>
                </span>
              </h2>
              <p className="why-desc honest-desc" data-reveal>
                The right guest matters to us as much as the right stay matters to you. So we say this plainly.
              </p>
              <Magnetic>
                <a href="#quiz" className="btn btn-amber" data-reveal style={{ fontSize: '1rem' }}>
                  This sounds like me — Match My Stay <span className="btn-arrow">→</span>
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

      <section
        className="exp-section"
        id="experiences"
        style={{
          backgroundImage: `url(${EXP_BG}), url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80)`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          paddingTop: 80,
        }}
      >
        <div className="container">
          <div className="w">
            <div data-reveal="up">
              <div className="eyebrow" style={{ color: '#fff' }}>Local Immersion</div>
              <h2 className="why-big-text" data-reveal>
                Your stay can be <br />
                <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(2rem,5vw,6rem)', color: '#fff' }}>
                  <em id="typewriter-5" className="typewriter-cursor" style={{ color: '#fff' }}>
                    <Typewriter text="more than a stay" className="" style={{ fontStyle: 'normal', color: '#fff' }} />
                  </em>
                </span>
              </h2>
              <p className="sec-sub">Cook with a local family, walk trails only locals know, sit by a bonfire or watch the stars from a quiet mountain home.</p>
            </div>
            <div className="bento" data-reveal="up" data-delay="2">
              <div className="b-cell large">
                <div className="b-corner-glow" />
                <span className="b-emoji">🍳</span>
                <div className="b-title">Village Kitchen Experience</div>
                <p className="b-desc">Learn local recipes with the host family. Kumaoni dal, bhatt ki churkani and rotis on a wood fire. Take the recipe home.</p>
              </div>
              <div className="b-cell sm">
                <span className="b-emoji">🌄</span>
                <div className="b-title">Sunrise Tea Spot</div>
                <p className="b-desc">Tea and mountain views before anyone else is awake.</p>
              </div>
              <div className="b-cell sm">
                <span className="b-emoji">🌿</span>
                <div className="b-title">Forest Walk</div>
                <p className="b-desc">Trails known only to locals. Oak forests, rhododendron slopes.</p>
              </div>
              <div className="b-cell tall">
                <div className="b-corner-glow" />
                <span className="b-emoji">🥬</span>
                <div className="b-title">Farm-to-Table Meal</div>
                <p className="b-desc">Eat what grows around the home. Seasonal, local, cooked by the family who grew it. Zero food miles.</p>
              </div>
              <div className="b-cell sm">
                <span className="b-emoji">🎶</span>
                <div className="b-title">Local Culture Evening</div>
                <p className="b-desc">Stories, music and mountain traditions around a fire.</p>
              </div>
              <div className="b-cell sm">
                <span className="b-emoji">💧</span>
                <div className="b-title">Hidden Waterfall Walk</div>
                <p className="b-desc">Not on Google Maps. Found only through local knowledge.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-section" id="impact" style={{ background: '#f7f3ed', paddingTop: 80, paddingBottom: 110 }}>
        <div className="container">
          <div className="w">
            <div style={{ textAlign: 'center', marginBottom: 14 }} data-reveal="up">
              <div className="eyebrow" style={{ justifyContent: 'center' }}>Responsible Tourism</div>
              <h2 className="why-big-text" data-reveal>
                Your stay supports <br />
                <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(4.4vw,4.4vw,4.4vw)', color: '#fff' }}>
                  <em id="typewriter-6" className="typewriter-cursor" style={{ color: '#111d2d' }}>
                    <Typewriter text="a local family." className="" style={{ fontStyle: 'normal', color: '#111d2d' }} />
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

      <section className="testimonials-section" id="stories" style={{ paddingTop: 60, paddingBottom: 160 }}>
        <div className="container">
          <div className="w">
            <div data-reveal="up">
              <div className="eyebrow" style={{ color: '#fff' }}>Guest Stories</div>
              <h2 className="why-big-text" data-reveal>
                Guests come for the mountains. <br />
                <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(2rem,5vw,6rem)', color: '#fff' }}>
                  <em id="typewriter-7" className="typewriter-cursor" style={{ color: '#fff' }}>
                    <Typewriter text="They remember the people." className="" style={{ fontStyle: 'normal', color: '#fff' }} />
                  </em>
                </span>
              </h2>
            </div>
            <div className="t-grid-wrap">
            <div className="t-grid">
              {[
                { stars: '★★★★★', text: 'We arrived as guests and left as family. The home-cooked meals, evening conversations and village walk made this feel nothing like a hotel stay. Nothing I\'ve booked before came close.', emoji: '🌸', name: 'Priya & Rahul S.', from: 'Guests from Delhi' },
                { stars: '★★★★★', text: 'The short walk to the property became our favourite part of the whole trip. I had been nervous about it. I shouldn\'t have been. The location was peaceful, beautiful and completely worth every step.', emoji: '🏔️', name: 'Sahil M.', from: 'Guest from Mumbai' },
                { stars: '★★★★★', text: 'Our children still talk about the host family months later. They learned about farming, local food and mountain life in a way no resort could ever offer. This is the travel I want my kids to grow up with.', emoji: '🌿', name: 'The Kapoor Family', from: 'Guests from Gurgaon' },
              ].map((t, i) => (
                <div key={t.name} className="t-card" data-reveal="up" data-delay={String(i + 1)}>
                  <div className="t-stars">{t.stars}</div>
                  <p className="t-text">{t.text}</p>
                  <div className="t-who">
                    <div className="t-avatar">{t.emoji}</div>
                    <div>
                      <div className="t-name">{t.name}</div>
                      <div className="t-from">{t.from}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </div>
            <div className="testimonials-dots" aria-hidden="true">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </section>

      <MobileBar />

      <section className="cta-section" style={{ background: '#f7f3ed', paddingTop: 40, paddingBottom: 110 }}>
        <div className="cta-bg-glow" />
        <div className="w" style={{ position: 'relative', zIndex: 1 }}>
          <div data-reveal="up">
            <div className="eyebrow" style={{ justifyContent: 'center' }}><span className="line" />Ready to Escape?<span className="line" /></div>
            <h2 className="why-big-text" data-reveal>
              Find a mountain home<br />
              <span style={{ fontFamily: 'Tangerine,cursive', fontSize: 'clamp(4.4vw,4.4vw,4.4vw)', color: '#fff' }}>
                <em id="typewriter-8" className="typewriter-cursor" style={{ color: '#111d2d' }}>
                  <Typewriter text="that matches you." className="" style={{ fontStyle: 'normal', color: '#111d2d' }} />
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
      </section>

      <Footer />
    </>
  );
}
