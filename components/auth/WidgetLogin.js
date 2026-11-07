'use client';
import { useEffect, useState } from 'react';

const SCRIPT = 'https://verify.msg91.com/otp-provider.js';

// MSG91's own pop-up collects the number and the code, then hands back a token for the server to confirm.
export default function WidgetLogin({ next = '/', mode = '', config }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (window.initSendOTP) return setReady(true);
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => setReady(true);
    s.onerror = () => setError('Could not load the login. Please check your connection and refresh.');
    document.head.appendChild(s);
  }, []);

  async function finish(result) {
    setBusy(true);
    setError('');
    try {
      const source = document.referrer ? new URL(document.referrer).hostname : 'direct';
      const r = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ widgetToken: result?.message, mode, source }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      window.location.href = d.needsProfile ? `/onboarding?next=${encodeURIComponent(next)}${mode ? `&mode=${mode}` : ''}` : next;
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  function start() {
    setError('');
    try {
      window.initSendOTP({
        ...config,
        success: finish,
        failure: () => setError('Could not verify your number. Please try again.'),
      });
    } catch {
      setError('Could not open the login. Please refresh and try again.');
    }
  }

  return (
    <div className="stack">
      <button type="button" className="btn btn-primary btn-block btn-lg" disabled={!ready || busy} onClick={start}>
        {busy ? 'Logging in…' : 'Continue with mobile number'}
      </button>
      <p className="xs muted center">We’ll send a 6-digit code by SMS. Same number works for both guest and host.</p>
      {error && <p className="notice notice-err" role="alert">{error}</p>}
    </div>
  );
}
