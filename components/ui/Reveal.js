'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// One observer for the whole site: any element with .reveal fades/slides in when it scrolls into view.
export default function Reveal() {
  const path = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((e) => e.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      for (const en of entries) if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }, { rootMargin: '0px 0px 10% 0px', threshold: 0 });
    els.forEach((e) => io.observe(e));
    document.documentElement.classList.add('js-reveal');
    return () => io.disconnect();
  }, [path]);
  return null;
}
