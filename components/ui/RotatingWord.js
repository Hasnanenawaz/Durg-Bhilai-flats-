'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

// Cycles through words; the box resizes to the current word so there is no awkward gap.
export default function RotatingWord({ words, interval = 2200 }) {
  const [i, setI] = useState(0);
  const [w, setW] = useState(undefined);
  const refs = useRef([]);
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  useLayoutEffect(() => {
    const measure = () => refs.current[i] && setW(refs.current[i].offsetWidth);
    measure();
    document.fonts?.ready?.then(measure);
  }, [i]);
  return (
    <span className="rotator" style={w ? { width: w } : undefined}>
      <span className="sr-only">{words.map((x) => x.text).join(', ')}</span>
      {words.map((x, k) => (
        <span key={x.text} ref={(el) => (refs.current[k] = el)} aria-hidden="true" className={`rotator-word t-${x.color}${k === i ? ' on' : ''}`}>{x.text}</span>
      ))}
    </span>
  );
}
