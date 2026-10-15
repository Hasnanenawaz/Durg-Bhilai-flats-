'use client';
import { useState } from 'react';

export default function ProfileForm({ user }) {
  const [f, setF] = useState({ name: user.name || '', email: user.email || '', whatsapp: user.whatsapp || '' });
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  async function save(e) {
    e.preventDefault();
    const r = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
    const d = await r.json();
    setMsg(r.ok ? { ok: true, t: 'Saved.' } : { ok: false, t: d.error });
  }
  return (
    <form onSubmit={save} className="stack">
      <div className="grid-2">
        <label className="field"><span>Name</span><input className="input" value={f.name} onChange={set('name')} /></label>
        <label className="field"><span>Phone (login)</span><input className="input" value={`+91 ${user.phone}`} disabled /></label>
        <label className="field"><span>WhatsApp number</span><input className="input" inputMode="numeric" value={f.whatsapp} onChange={set('whatsapp')} placeholder="Same as phone" /></label>
        <label className="field"><span>Email (optional)</span><input className="input" type="email" value={f.email} onChange={set('email')} /></label>
      </div>
      <div className="row"><button className="btn btn-primary">Save profile</button>{msg && <span className={`small ${msg.ok ? '' : 'notice-err'}`}>{msg.t}</span>}</div>
    </form>
  );
}
