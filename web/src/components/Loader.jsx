import { useEffect, useState } from 'react';
import { animateLogoToHero } from '../utils/mobileLogoFly';
import assetUrl from '../utils/assetUrl';

let loaderFinishCalled = false;

function notifyPageReady() {
  window.dispatchEvent(new CustomEvent('ezyescape:page-ready'));
}

export default function Loader({ onHeroReady, onDone }) {
  const [reveal, setReveal] = useState(false);
  const [done, setDone] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setReveal(true), 50);
    const iv = setInterval(() => {
      setPct((p) => Math.min(p + Math.random() * 18, 99));
    }, 120);

    const finish = () => {
      if (loaderFinishCalled) return;
      loaderFinishCalled = true;
      clearInterval(iv);
      clearTimeout(fallback);
      window.removeEventListener('load', finish);
      setPct(100);
      setTimeout(() => {
        animateLogoToHero({
          onStart: onHeroReady,
          onComplete: () => {
            setDone(true);
            onDone?.();
            notifyPageReady();
          },
        });
      }, 350);
    };

    window.addEventListener('load', finish);
    const fallback = setTimeout(finish, 2800);

    return () => {
      clearTimeout(t1);
      clearInterval(iv);
      clearTimeout(fallback);
      window.removeEventListener('load', finish);
    };
  }, [onHeroReady, onDone]);

  return (
    <div id="loader" className={`${reveal ? 'reveal' : ''}${done ? ' done' : ''}`}>
      <div className="loader-logo">
        <img src={assetUrl('images/logo.png')} alt="Ezy Escape" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span>Ezy<em style="font-style:italic;color:#F5A623">Escape</em></span>'; }} />
      </div>
      <div className="loader-bar-wrap">
        <div className="loader-bar" style={reveal ? { width: `${pct}%` } : undefined} />
      </div>
      <div className="loader-pct">{Math.round(pct)}%</div>
    </div>
  );
}
