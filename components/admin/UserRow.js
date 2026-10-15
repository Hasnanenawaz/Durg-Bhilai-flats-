'use client';
import { useState } from 'react';
import { prettyPhone, waLink } from '@/lib/phone';

const STATUSES = [['new', 'New'], ['called', 'Called'], ['interested', 'Interested'], ['not_interested', 'Not interested'], ['converted', 'Converted']];

export default function UserRow({ u, listings, asked }) {
  const [status, setStatus] = useState(u.lead_status);
  const [notes, setNotes] = useState(u.admin_notes || '');
  const [blocked, setBlocked] = useState(u.is_blocked);
  const [saved, setSaved] = useState('');
  async function patch(body) {
    const r = await fetch(`/api/admin/users/${u.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaved(r.ok ? '✓' : '!');
    setTimeout(() => setSaved(''), 1500);
    return r.ok;
  }
  return (
    <tr style={blocked ? { opacity: 0.55 } : undefined}>
      <td><b>{u.name || '—'}</b><div className="xs muted">{u.signup_city || ''}</div></td>
      <td className="mono">
        <a href={`tel:+91${u.phone}`}>{prettyPhone(u.phone)}</a>
        <div className="row" style={{ gap: 6, marginTop: 4 }}>
          <a className="btn btn-soft btn-sm" href={`tel:+91${u.phone}`}>Call</a>
          <a className="btn btn-ghost btn-sm" href={waLink(u.whatsapp || u.phone, `Hi ${u.name || ''}, this is the Durg Bhilai Flats & Flatmates team.`)} target="_blank" rel="noopener">WA</a>
        </div>
      </td>
      <td><span className="badge">{u.active_mode}</span>{u.is_host && <div className="xs muted" style={{ marginTop: 4 }}>{listings} listing{listings === 1 ? '' : 's'}</div>}</td>
      <td className="mono small">{asked}</td>
      <td>
        <select className="input" value={status} onChange={(e) => { setStatus(e.target.value); patch({ lead_status: e.target.value }); }} aria-label="Lead status">
          {STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </td>
      <td style={{ minWidth: 200 }}>
        <textarea className="input" style={{ minHeight: 40 }} value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== (u.admin_notes || '') && patch({ admin_notes: notes })} placeholder="Call notes" aria-label="Notes" />
      </td>
      <td className="xs muted mono">{new Date(u.created_at).toLocaleDateString('en-IN')}<br />{saved}</td>
      <td><button className="linkbtn xs" style={{ color: blocked ? 'var(--accent)' : 'var(--danger)' }} onClick={async () => { if (await patch({ is_blocked: !blocked })) setBlocked(!blocked); }}>{blocked ? 'Unblock' : 'Block'}</button></td>
    </tr>
  );
}
