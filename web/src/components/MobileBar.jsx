import { useEffect, useState } from 'react';

export default function MobileBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`mobile-bar${show ? ' show' : ''}`} aria-hidden={!show}>
      <a href="#quiz" className="mobile-bar-cta">
        Match My Stay <span aria-hidden="true">→</span>
      </a>
      <a href="#" className="mobile-bar-wa" aria-label="WhatsApp us">💬</a>
    </div>
  );
}
