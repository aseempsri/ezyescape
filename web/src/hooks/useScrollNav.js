import { useEffect } from 'react';

export default function useScrollNav(threshold = 60) {
  useEffect(() => {
    const nav = document.getElementById('mainNav');
    if (!nav) return undefined;

    const onScroll = () => {
      const solid = window.scrollY > threshold;
      nav.classList.toggle('solid', solid);
      nav.setAttribute('data-solid', solid ? 'true' : 'false');
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
}
