'use client';
import { useState } from 'react';

const TYPES = [
  { v: '', label: 'All', color: 'all' },
  { v: 'flat', label: 'Flats', color: 'flat' },
  { v: 'pg', label: 'PG', color: 'pg' },
  { v: 'room', label: 'Rooms', color: 'room' },
  { v: 'flatmate', label: 'Flatmates', color: 'flatmate' },
];
const HINTS = { '': 'Area or landmark, e.g. Supela, IIT Bhilai', flat: 'e.g. 2 BHK in Smriti Nagar', pg: 'e.g. girls PG near BIT Durg', room: 'e.g. single room in Nehru Nagar', flatmate: 'e.g. flatmate in Kohka' };

export default function HeroSearch({ cities }) {
  const [type, setType] = useState('');
  return (
    <div className="hero-search">
      <div className="hs-tabs" role="tablist" aria-label="What are you looking for">
        {TYPES.map((t) => (
          <button key={t.v} type="button" role="tab" aria-selected={type === t.v} className={`hs-tab t-${t.color}`} onClick={() => setType(t.v)}>{t.label}</button>
        ))}
      </div>
      <form className="searchbar" action="/search" method="get" role="search">
        <input type="hidden" name="type" value={type} />
        <label className="sr-only" htmlFor="hs-city">City</label>
        <select id="hs-city" name="city" className="input" defaultValue="bhilai">
          <option value="">All Chhattisgarh</option>
          {cities.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <label className="sr-only" htmlFor="hs-q">Area or landmark</label>
        <input id="hs-q" name="q" className="input" placeholder={HINTS[type]} />
        <button className="btn btn-primary btn-shine" type="submit">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          Search
        </button>
      </form>
    </div>
  );
}
