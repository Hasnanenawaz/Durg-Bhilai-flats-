'use client';
import { useState } from 'react';

export default function HostActions({ p }) {
  const [busy, setBusy] = useState(false);
  async function act(action) {
    setBusy(true);
    const r = await fetch(`/api/properties/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    if (!r.ok) alert((await r.json()).error);
    window.location.reload();
  }
  async function del() {
    if (!confirm('Delete this listing and its photos? This cannot be undone.')) return;
    setBusy(true);
    await fetch(`/api/properties/${p.id}`, { method: 'DELETE' });
    window.location.reload();
  }
  return (
    <div className="row" style={{ gap: 6 }}>
      <a className="btn btn-ghost btn-sm" href={`/host/${p.id}/edit`}>Edit</a>
      {p.status === 'approved' && <button className="btn btn-soft btn-sm" disabled={busy} onClick={() => act('rented')}>Mark rented</button>}
      {p.status === 'approved' && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => act('hide')}>Pause</button>}
      {(p.status === 'rented' || p.status === 'hidden') && <button className="btn btn-soft btn-sm" disabled={busy} onClick={() => act('relist')}>Relist</button>}
      <button className="btn btn-danger btn-sm" disabled={busy} onClick={del}>Delete</button>
    </div>
  );
}
