import SiteChrome from './SiteChrome';
import Typewriter from './Typewriter';
import { NGO_STORIES, SHOP_PRODUCTS } from '../data/sitePages';
import { whatsappChatUrl } from '../utils/whatsapp';
import { contactPath } from '../utils/paths';

function productWa(name) {
  return whatsappChatUrl(
    `Hi! I'd like to order "${name}" from Shop With Us on Ezy Escape. Could you help with availability and shipping?`
  );
}

export default function ShopPage() {
  return (
    <SiteChrome title="Shop With Us — Ezy Escape">
      <section className="sp-hero sp-hero--shop">
        <div className="sp-hero-veil" aria-hidden="true" />
        <div className="container sp-hero-inner">
          <p className="sp-eyebrow">Shop with us</p>
          <h1 className="sp-title">
            <span className="sp-title-line">Bring a piece of the hills home.</span>
            <br />
            <span className="sp-title-script">
              <Typewriter text="Support the people behind them." className="typewriter-cursor" speed={90} />
            </span>
          </h1>
          <p className="sp-lead">
            Handcrafted goods and pantry staples from NGO partners and village collectives.
            Every order funds livelihoods, classrooms, and seed banks across Kumaon.
          </p>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <div className="sp-section-head">
            <p className="sp-eyebrow">From our partners</p>
            <h2>Products with a purpose</h2>
          </div>
          <div className="sp-product-grid">
            {SHOP_PRODUCTS.map((p) => (
              <article key={p.id} className="sp-product">
                <div className="sp-product-img" style={{ backgroundImage: `url('${p.img}')` }}>
                  <span className="sp-product-tag">{p.tag}</span>
                </div>
                <div className="sp-product-body">
                  <p className="sp-product-ngo">{p.ngo}</p>
                  <h3>{p.name}</h3>
                  <p>{p.desc}</p>
                  <div className="sp-product-foot">
                    <strong>₹{p.price}</strong>
                    <a href={productWa(p.name)} className="sp-product-buy" target="_blank" rel="noopener noreferrer">
                      Order on WhatsApp →
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="sp-section sp-section--alt">
        <div className="container">
          <div className="sp-section-head">
            <p className="sp-eyebrow">NGO stories</p>
            <h2>Who your purchase supports</h2>
          </div>
          <div className="sp-ngo-grid">
            {NGO_STORIES.map((n) => (
              <article key={n.id} className="sp-ngo-card">
                <div className="sp-ngo-img" style={{ backgroundImage: `url('${n.img}')` }} />
                <div className="sp-ngo-body">
                  <span className="sp-tag">{n.focus}</span>
                  <p className="sp-product-ngo">{n.ngo}</p>
                  <h3>{n.title}</h3>
                  <p>{n.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="sp-shop-note">
            Shipping across India where possible. For bulk or gifting,{' '}
            <a href={contactPath()}>reach the team</a>.
          </p>
        </div>
      </section>
    </SiteChrome>
  );
}
