const MOBILE_MQ = '(max-width: 768px)';
const MIN_NUDGE = 8;
const MAX_NUDGE = 48;
const DURATION = 900;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

export function bounceNavRail(rail) {
  if (!rail || !window.matchMedia(MOBILE_MQ).matches) return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;

  const maxScroll = rail.scrollWidth - rail.clientWidth;
  if (maxScroll < MIN_NUDGE) return false;

  const start = rail.scrollLeft;
  const peak = Math.min(MAX_NUDGE, maxScroll);
  const t0 = performance.now();

  const frame = (now) => {
    const t = Math.min((now - t0) / DURATION, 1);

    let offset;
    if (t < 0.42) {
      offset = peak * easeOutCubic(t / 0.42);
    } else {
      const p = (t - 0.42) / 0.58;
      offset = peak * (1 - easeOutCubic(p));
    }

    rail.scrollLeft = start + offset;
    if (t < 1) requestAnimationFrame(frame);
    else rail.scrollLeft = start;
  };

  requestAnimationFrame(frame);
  return true;
}
