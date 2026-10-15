'use client';
import { useState } from 'react';
import { prettyPhone, waLink } from '@/lib/phone';

export default function ContactOwner({ propertyId, loggedIn, title, slug, rented }) {
  const [state, setState] = useState({ busy: false, data: null, error: '' });
  async function reveal() {
    if (!loggedIn) {
      window.location.href = `/login?next=${encodeURIComponent(`/property/${slug}?contact=1`)}`;
      return;
    }
    setState({ busy: true, data: null, error: '' });
    const r = await fetch(`/api/properties/${propertyId}/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    const d = await r.json().catch(() => ({}));
    setState({ busy: false, data: r.ok ? d : null, error: r.ok ? '' : d.error || 'Could not load the number.' });
  }
  if (rented) return <p className="notice notice-warn">This place has been rented out. Look at similar places below.</p>;
  if (state.data) {
    const msg = `Hi${state.data.name ? ' ' + state.data.name : ''}, I saw your listing "${title}" on Durg Bhilai Flats & Flatmates. Is it still available?`;
    return (
      <div className="stack">
        <div className="notice notice-ok">
          <div className="small">{state.data.name || 'Owner'}</div>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.4rem' }} className="kbd-num">{prettyPhone(state.data.phone)}</div>
        </div>
        <div className="grid-2" style={{ gap: 8 }}>
          <a className="btn btn-primary" href={`tel:+91${state.data.phone}`}>Call</a>
          <a className="btn btn-ghost" href={waLink(state.data.whatsapp, msg)} rel="noopener" target="_blank">WhatsApp</a>
        </div>
        <p className="xs muted">Visit before you pay anything. Never send a token amount for a place you haven’t seen.</p>
      </div>
    );
  }
  return (
    <div className="stack">
      <button className="btn btn-primary btn-block btn-lg" onClick={reveal} disabled={state.busy}>
        {state.busy ? 'Loading…' : 'Show owner’s number'}
      </button>
      {!loggedIn && <p className="xs muted center">Log in with your phone (OTP) to see the number. It’s free.</p>}
      {state.error && <p className="notice notice-err">{state.error}</p>}
    </div>
  );
}
