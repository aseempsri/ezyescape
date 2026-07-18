import { useState } from 'react';
import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { whatsappChatUrl, WHATSAPP_LOCAL_NUMBER, WHATSAPP_COUNTRY_CODE } from '../utils/whatsapp';
import { partnerPath, shopPath, homeSectionPath } from '../utils/paths';

const CHANNELS = [
  {
    e: '💬',
    t: 'WhatsApp',
    d: 'Fastest way to plan a stay, ask about a product, or partner with us.',
    href: whatsappChatUrl(),
    cta: 'Chat now →',
    external: true,
  },
  {
    e: '✉️',
    t: 'Email',
    d: 'For longer notes, press, or partnership decks.',
    href: 'mailto:hello@ezyescape.com',
    cta: 'hello@ezyescape.com',
    external: false,
  },
  {
    e: '📞',
    t: 'Phone',
    d: 'India mobile — same line as WhatsApp.',
    href: `tel:+${WHATSAPP_COUNTRY_CODE}${WHATSAPP_LOCAL_NUMBER}`,
    cta: `+${WHATSAPP_COUNTRY_CODE} ${WHATSAPP_LOCAL_NUMBER}`,
    external: false,
  },
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('stay');
  const [message, setMessage] = useState('');

  const topicLabel = {
    stay: 'a mountain stay',
    partner: 'hosting / partnership',
    shop: 'Shop With Us',
    other: 'something else',
  }[topic];

  const composed = whatsappChatUrl(
    `Hi! I'm ${name || 'a traveller'} writing about ${topicLabel}.\n\n${message || 'Looking forward to hearing from you.'}`
  );

  return (
    <SiteChrome title="Contact Us — Ezy Escape">
      <section className="sp-hero sp-hero--contact">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Contact us</p>
          <h1 className="sp-title">
            <span className="sp-title-line">Talk to a human.</span>
            <br />
            <span className="sp-title-script">
              <Typewriter text="Not a ticket queue." className="typewriter-cursor" speed={90} />
            </span>
          </h1>
          <p className="sp-lead">
            Whether you’re matching a stay, listing a home, or ordering from an NGO partner — start here.
          </p>
        </div>
      </section>

      <section className="sp-section">
        <div className="container sp-contact-layout">
          <div className="sp-contact-channels">
            {CHANNELS.map((c) => (
              <a
                key={c.t}
                href={c.href}
                className="sp-channel"
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noopener noreferrer' : undefined}
              >
                <span className="sp-channel-emoji" aria-hidden="true">{c.e}</span>
                <div>
                  <h3>{c.t}</h3>
                  <p>{c.d}</p>
                  <span className="sp-channel-cta">{c.cta}</span>
                </div>
              </a>
            ))}
          </div>

          <form
            className="sp-contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              window.open(composed, '_blank', 'noopener,noreferrer');
            }}
          >
            <p className="sp-eyebrow">Send a note</p>
            <h2>We’ll open WhatsApp with your message</h2>
            <label className="sp-field">
              <span>Your name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aseem" />
            </label>
            <label className="sp-field">
              <span>Topic</span>
              <select value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="stay">Planning a stay</option>
                <option value="partner">Partner / list my home</option>
                <option value="shop">Shop / NGO products</option>
                <option value="other">Something else</option>
              </select>
            </label>
            <label className="sp-field">
              <span>Message</span>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dates, region, or questions…"
              />
            </label>
            <button type="submit" className="btn btn-amber">Continue on WhatsApp →</button>
            <p className="sp-form-note">
              Prefer email? Write to <a href="mailto:hello@ezyescape.com">hello@ezyescape.com</a>
            </p>
          </form>
        </div>
      </section>

      <section className="sp-section sp-section--alt">
        <div className="container">
          <div className="sp-section-head">
            <p className="sp-eyebrow">Quick links</p>
            <h2>Looking for something specific?</h2>
          </div>
          <div className="sp-card-grid sp-card-grid--3">
            <a href={homeSectionPath('quiz')} className="sp-card sp-card--link">
              <span className="sp-card-emoji" aria-hidden="true">✦</span>
              <h3>Match My Stay</h3>
              <p>Five questions. Homes that fit how you travel.</p>
            </a>
            <a href={partnerPath()} className="sp-card sp-card--link">
              <span className="sp-card-emoji" aria-hidden="true">🏡</span>
              <h3>Partner with us</h3>
              <p>List a homestay that deserves curated guests.</p>
            </a>
            <a href={shopPath()} className="sp-card sp-card--link">
              <span className="sp-card-emoji" aria-hidden="true">🛍️</span>
              <h3>Shop With Us</h3>
              <p>NGO products and stories from the hills.</p>
            </a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
