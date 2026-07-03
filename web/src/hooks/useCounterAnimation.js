import { useEffect } from 'react';

export default function useCounterAnimation() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.querySelectorAll('.i-num[data-count]').forEach((el) => {
            if (el.dataset.counted) return;
            el.dataset.counted = '1';
            const target = parseInt(el.dataset.count, 10);
            const suf = el.dataset.suf || '';
            const start = performance.now();
            const dur = 1800;
            function tick(now) {
              const p = Math.min((now - start) / dur, 1);
              const ease = 1 - (1 - p) ** 4;
              el.textContent = `${Math.round(ease * target)}${suf}`;
              if (p < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
          });
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.3 }
    );
    const sec = document.querySelector('.impact-section');
    if (sec) obs.observe(sec);
    return () => obs.disconnect();
  }, []);
}
