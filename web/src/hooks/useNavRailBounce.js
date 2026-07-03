import { useCallback, useEffect, useRef } from 'react';
import { bounceNavRail } from '../utils/navRailBounce';

const TOP_THRESHOLD = 12;
const SCROLL_AWAY = 80;
const COOLDOWN_MS = 2200;

export default function useNavRailBounce() {
  const railRef = useRef(null);
  const wasScrolledDown = useRef(false);
  const lastBounceAt = useRef(0);

  const bounce = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const now = Date.now();
    if (now - lastBounceAt.current < COOLDOWN_MS) return;

    if (bounceNavRail(rail)) {
      lastBounceAt.current = now;
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      if (y > SCROLL_AWAY) {
        wasScrolledDown.current = true;
        return;
      }

      if (wasScrolledDown.current && y <= TOP_THRESHOLD) {
        wasScrolledDown.current = false;
        bounce();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [bounce]);

  useEffect(() => {
    const onPageReady = () => {
      window.setTimeout(bounce, 450);
    };

    window.addEventListener('ezyescape:page-ready', onPageReady);
    return () => window.removeEventListener('ezyescape:page-ready', onPageReady);
  }, [bounce]);

  return railRef;
}
