import Skyline from '@/components/art/Skyline';

// Dark hero with the animated Bhilai skyline behind it.
export default function SkyHero({ children, tag = true }) {
  return (
    <section className="hero-dark">
      <Skyline />
      {tag && (
        <div className="hero-tag" aria-hidden="true">
          Naya shehar,<br />apna ghar
          <svg width="150" height="22" viewBox="0 0 150 22"><path d="M4 14 C 40 4, 90 4, 146 12 M128 4 l18 8 -16 8" stroke="#ffc21a" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      )}
      <div className="wrap" style={{ position: 'relative' }}>{children}</div>
    </section>
  );
}
