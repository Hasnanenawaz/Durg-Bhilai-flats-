'use client';
import { useState } from 'react';

export default function AdminLoginForm() {
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/auth/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Could not log in.');
      window.location.href = '/admin';
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="stack">
      <label className="field">
        <span>Mobile number</span>
        <div className="phone-input">
          <span className="prefix">+91</span>
          <input className="input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required />
        </div>
      </label>
      <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Opening…' : 'Open admin panel'}</button>
      {error && <p className="notice notice-err" role="alert">{error}</p>}
    </form>
  );
}
