'use client';
import { useEffect, useRef, useState } from 'react';

export default function CountUp({ to, prefix = '', suffix = '', duration = 1100 }) {
  const [n, setN] = useState(to);
  const ref = useRef(null);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !to) return;
    setN(0);
    let raf, start;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const step = (t) => {
        start ??= t;
        const p = Math.min(1, (t - start) / duration);
        setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    if (ref.current) io.observe(ref.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref} className="kbd-num">{prefix}{new Intl.NumberFormat('en-IN').format(n)}{suffix}</span>;
}
