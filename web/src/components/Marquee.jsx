import { MARQUEE_ITEMS } from '../data/stays';

export default function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="marquee-wrap">
      <div className="marquee-track">
        {items.map((t, i) => (
          <div key={`${t}-${i}`} className="marquee-item">
            <div className="marquee-dot" />
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
