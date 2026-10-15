'use client';
import { useState } from 'react';

export default function SaveButton({ propertyId, saved: initial, loggedIn, slug }) {
  const [saved, setSaved] = useState(initial);
  async function toggle() {
    if (!loggedIn) { window.location.href = `/login?next=/property/${slug}`; return; }
    setSaved(!saved);
    const r = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId }) });
    if (r.ok) setSaved((await r.json()).saved); else setSaved(saved);
  }
  return (
    <button type="button" className="btn btn-ghost btn-sm" onClick={toggle} aria-pressed={saved}>
      {saved ? '♥ Saved' : '♡ Save'}
    </button>
  );
}
