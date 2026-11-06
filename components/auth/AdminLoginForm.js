'use client';
import { useState } from 'react';

export default function AdminLoginForm() {
  const [passcode, setPasscode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await fetch('/api/auth/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passcode }) });
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
        <span>Admin passcode</span>
        <input className="input" type="password" autoComplete="current-password" value={passcode}
          onChange={(e) => setPasscode(e.target.value)} required autoFocus />
      </label>
      <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Opening…' : 'Open admin panel'}</button>
      {error && <p className="notice notice-err" role="alert">{error}</p>}
    </form>
  );
}
