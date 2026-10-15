'use client';
import { useState } from 'react';

const REASONS = ['Already rented', 'Broker posing as owner', 'Wrong details or photos', 'Asked for advance payment', 'Other'];

export default function ReportButton({ propertyId, loggedIn, slug }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState('');
  if (done) return <p className="xs muted">{done}</p>;
  if (!open) return <button type="button" className="linkbtn xs" style={{ color: 'var(--muted)' }} onClick={() => (loggedIn ? setOpen(true) : (window.location.href = `/login?next=/property/${slug}`))}>Report this listing</button>;
  return (
    <form className="stack card" onSubmit={async (e) => {
      e.preventDefault();
      const r = await fetch('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ propertyId, reason, details }) });
      setDone(r.ok ? 'Thanks. We’ll check this listing.' : 'Could not send the report.');
    }}>
      <label className="field"><span>What’s wrong?</span>
        <select className="input" required value={reason} onChange={(e) => setReason(e.target.value)}>
          <option value="">Choose a reason</option>
          {REASONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>
      <textarea className="input" style={{ minHeight: 70 }} placeholder="Anything else (optional)" value={details} onChange={(e) => setDetails(e.target.value)} />
      <div className="row"><button className="btn btn-sm btn-primary">Send report</button><button type="button" className="linkbtn small" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}
