import { useRef } from 'react';

export default function Magnetic({ children, className = 'mag' }) {
  const wrapRef = useRef(null);

  const onMove = (e) => {
    const wrap = wrapRef.current;
    const btn = wrap?.querySelector('.btn');
    if (!wrap || !btn) return;
    const r = wrap.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.3;
    const y = (e.clientY - r.top - r.height / 2) * 0.3;
    btn.style.transform = `translate(${x}px,${y}px)`;
  };

  const onLeave = () => {
    const btn = wrapRef.current?.querySelector('.btn');
    if (btn) btn.style.transform = '';
  };

  return (
    <div ref={wrapRef} className={className} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}
