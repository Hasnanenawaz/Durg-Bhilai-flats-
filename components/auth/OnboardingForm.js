'use client';
import { useState } from 'react';
import { CITIES } from '@/lib/locations';

export default function OnboardingForm({ next, initialMode }) {
  const [name, setName] = useState('');
  const [mode, setMode] = useState(initialMode || 'guest');
  const [city, setCity] = useState('bhilai');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    if (name.trim().length < 2) return setError('Please enter your name.');
    setBusy(true);
    const r = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, active_mode: mode, signup_city: city }) });
    if (!r.ok) { setBusy(false); return setError((await r.json()).error); }
    window.location.href = next && next !== '/' ? next : mode === 'host' ? '/host/new' : `/search?city=${city}`;
  }
  return (
    <form onSubmit={submit} className="stack">
      <label className="field"><span>Your name</span><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus autoComplete="name" placeholder="e.g. Rahul Sahu" /></label>
      <div className="field">
        <span className="label">What brings you here?</span>
        <div className="grid-2" style={{ gap: 8 }}>
          {[['guest', 'I’m looking for a place', 'Flat, PG, room or flatmate'], ['host', 'I want to list a place', 'Owner, or need a flatmate']].map(([v, t, s]) => (
            <label key={v} className="card" style={{ padding: 14, cursor: 'pointer', borderColor: mode === v ? 'var(--accent)' : undefined, background: mode === v ? 'var(--accent-soft)' : undefined }}>
              <input type="radio" name="mode" value={v} checked={mode === v} onChange={() => setMode(v)} className="sr-only" />
              <b style={{ display: 'block', fontSize: '0.95rem' }}>{t}</b><span className="xs muted">{s}</span>
            </label>
          ))}
        </div>
        <p className="hint">You can switch between Guest and Host any time.</p>
      </div>
      <label className="field"><span>City</span>
        <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
      </label>
      {error && <p className="notice notice-err">{error}</p>}
      <button className="btn btn-primary btn-lg btn-block" disabled={busy}>{busy ? 'Saving…' : 'Continue'}</button>
    </form>
  );
}
