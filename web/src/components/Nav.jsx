import useNavRailBounce from '../hooks/useNavRailBounce';
import assetUrl from '../utils/assetUrl';

const links = [
  { href: '#stays', label: 'Homestays', short: 'Stays' },
  { href: '#experiences', label: 'Experiences', short: 'Experiences' },
  { href: '#impact', label: 'Our Impact', short: 'Impact' },
  { href: '#stories', label: 'Stories', short: 'Stories' },
];

export default function Nav() {
  const railRef = useNavRailBounce();

  return (
    <nav id="mainNav">
      <div className="nav-shell">
        <div className="nav-inner">
          <a href="#" className="logo">
            <img
              src={assetUrl('images/logo.png')}
              alt="Ezy Escape"
              onError={(e) => { e.target.outerHTML = 'Ezy<em>Escape</em>'; }}
            />
          </a>

          <ul className="nav-links nav-desktop">
            {links.map(({ href, label }) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
            <li><a href="#quiz" className="nav-cta">Match My Stay</a></li>
          </ul>

          <a href="#quiz" className="nav-cta nav-cta-compact">Match →</a>
        </div>

        <div className="nav-rail" ref={railRef} aria-label="Page sections">
          <div className="nav-rail-track">
            {links.map(({ href, label, short }) => (
              <a key={href} href={href} className="nav-chip">
                <span className="nav-chip-dot" aria-hidden="true" />
                <span className="nav-chip-full">{label}</span>
                <span className="nav-chip-short">{short}</span>
              </a>
            ))}
            <a href="#quiz" className="nav-chip nav-chip--gold">
              <span className="nav-chip-dot" aria-hidden="true" />
              Match My Stay
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
