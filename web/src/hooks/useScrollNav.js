import { useEffect } from 'react';

export default function useScrollNav(threshold = 60) {
  useEffect(() => {
    const onScroll = () => {
      document.getElementById('mainNav')?.classList.toggle('solid', window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
}
