import { useEffect } from 'react';

export default function useCustomCursor() {
  useEffect(() => {
    const dot = document.getElementById('cur');
    const ring = document.getElementById('cur-ring');
    if (!dot || !ring) return;

    document.body.classList.add('cursor-on');
    let mx = 0, my = 0, rx = 0, ry = 0;
    let rafId;

    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      rafId = requestAnimationFrame(loop);
    };

    const onOver = (e) => {
      const interactive = e.target.closest(
        'a, button, .stay-card, .homestay-card, .match-opt, .persona-card, .p-card, .maker-card, .q-opt, .filter-tab, .s-filter, .b-cell, .immersion-chip, .immersion-tile, .t-card, .compare-col, .cm-card, .faq-item, .form-input, .pt-card, .ms-card, .type-card, .mag, .stay-hero-thumb, .stay-photo-tile'
      );
      document.body.classList.toggle('hov', !!interactive);
      document.body.classList.toggle('hovering', !!interactive);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    rafId = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(rafId);
      document.body.classList.remove('cursor-on', 'hov', 'hovering');
    };
  }, []);
}
