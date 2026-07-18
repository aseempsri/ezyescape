import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import assetUrl from '../utils/assetUrl';
import AuthButton from './AuthButton';
import WalletNav from './WalletNav';
import {
  appPath,
  staysIndexPath,
  storiesPath,
  shopPath,
  partnerPath,
  contactPath,
  goHome,
} from '../utils/paths';

const links = [
  { href: staysIndexPath(), label: 'Homestays', short: 'Stays' },
  { href: storiesPath(), label: 'Stories', short: 'Stories' },
  { href: shopPath(), label: 'Shop', short: 'Shop' },
  { href: partnerPath(), label: 'Partner', short: 'Partner' },
  { href: contactPath(), label: 'Contact', short: 'Contact' },
];

function isOnHome() {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  let path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (base && base !== '/' && path.startsWith(base)) {
    path = path.slice(base.length) || '/';
  }
  return path === '/' || path === '';
}

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);

    // Overflow-only lock — preserves current scroll (no top→down jump on close).
    const html = document.documentElement;
    const { body } = document;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.classList.add('nav-menu-scroll-lock');

    const allowTouchScroll = (target) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest('.nav-drawer'));
    };

    const onTouchMove = (e) => {
      if (!allowTouchScroll(e.target)) e.preventDefault();
    };
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('touchmove', onTouchMove);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.classList.remove('nav-menu-scroll-lock');
    };
  }, [menuOpen]);

  function handleLogoHome(e) {
    setMenuOpen(false);
    if (isOnHome()) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    e.preventDefault();
    goHome();
  }

  const drawer = (
    <>
      <div
        className={`nav-drawer-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />

      <div
        id="navMobileMenu"
        className={`nav-drawer${menuOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div className="nav-drawer-head">
          <a href={appPath()} className="nav-drawer-brand" onClick={() => setMenuOpen(false)}>
            <img
              className="nav-drawer-mark"
              src={assetUrl('images/nav-mark.png')}
              alt=""
              width={36}
              height={36}
              decoding="async"
            />
            <span>Ezy Escape</span>
          </a>
          <button
            type="button"
            className="nav-drawer-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            ×
          </button>
        </div>
        <ul className="nav-drawer-links">
          {links.map(({ href, label }) => (
            <li key={href}>
              <a href={href} onClick={() => setMenuOpen(false)}>{label}</a>
            </li>
          ))}
        </ul>
        <a
          href={appPath()}
          className="nav-drawer-home"
          onClick={(e) => {
            setMenuOpen(false);
            if (isOnHome()) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          Back to home →
        </a>
      </div>
    </>
  );

  return (
    <>
      <nav id="mainNav" className={menuOpen ? 'nav-menu-open' : undefined}>
        <div className="nav-shell">
          <div className="nav-inner">
            <div className="nav-left">
              <div className="nav-e-cluster">
                <a
                  href={appPath()}
                  className="nav-e-home"
                  aria-label="Go to top of home"
                  onClick={handleLogoHome}
                >
                  <img
                    className="nav-e-logo"
                    src={assetUrl('images/nav-mark.png')}
                    alt="Ezy Escape"
                    width={40}
                    height={40}
                    decoding="async"
                  />
                </a>
                <button
                  type="button"
                  className={`nav-e-menu${menuOpen ? ' is-open' : ''}`}
                  aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={menuOpen}
                  aria-controls="navMobileMenu"
                  onClick={() => setMenuOpen((v) => !v)}
                >
                  <span className="nav-e-bars" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>

              <a href={appPath()} className="logo nav-logo-desktop">
                <img
                  src={assetUrl('images/logo.png')}
                  alt="Ezy Escape"
                  onError={(e) => { e.target.outerHTML = 'Ezy<em>Escape</em>'; }}
                />
              </a>
            </div>

            <ul className="nav-links nav-desktop">
              {links.map(({ href, label }) => (
                <li key={href}><a href={href}>{label}</a></li>
              ))}
              <li className="nav-wallet"><WalletNav /></li>
              <li className="nav-auth"><AuthButton /></li>
            </ul>

            <div className="nav-actions">
              <WalletNav />
              <AuthButton compact hideSignOut />
            </div>
          </div>
        </div>
      </nav>

      {typeof document !== 'undefined' ? createPortal(drawer, document.body) : null}
    </>
  );
}
