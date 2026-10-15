'use client';
import { useState } from 'react';

export default function ListingActions({ p }) {
  const [s, setS] = useState(p);
  const [busy, setBusy] = useState(false);
  async function patch(body) {
    setBusy(true);
    const r = await fetch(`/api/admin/properties/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (r.ok) setS((await r.json()).property);
    setBusy(false);
  }
  async function del() {
    if (!confirm('Delete this listing permanently?')) return;
    await fetch(`/api/properties/${p.id}`, { method: 'DELETE' });
    window.location.reload();
  }
  return (
    <div className="stack" style={{ minWidth: 180 }}>
      <div className="row" style={{ gap: 6 }}>
        {s.status !== 'approved' && <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => patch({ status: 'approved' })}>Approve</button>}
        {s.status === 'pending' && <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => patch({ status: 'rejected' })}>Reject</button>}
        {s.status === 'approved' && <button className="btn btn-ghost btn-sm" disabled={busy} onClick={() => patch({ status: 'hidden' })}>Hide</button>}
      </div>
      <div className="row" style={{ gap: 12 }}>
        <label className="check xs"><input type="checkbox" checked={s.featured} disabled={busy} onChange={(e) => patch({ featured: e.target.checked })} /> Featured</label>
        <label className="check xs"><input type="checkbox" checked={s.verified} disabled={busy} onChange={(e) => patch({ verified: e.target.checked })} /> Verified</label>
      </div>
      <div className="row xs" style={{ gap: 10 }}>
        <span className={`badge ${s.status === 'approved' ? 'badge-green' : s.status === 'pending' ? 'badge-warn' : s.status === 'rejected' ? 'badge-red' : ''}`}>{s.status}</span>
        <a href={`/host/${p.id}/edit`}>Edit</a>
        <button className="linkbtn xs" style={{ color: 'var(--danger)' }} onClick={del}>Delete</button>
      </div>
    </div>
  );
}
