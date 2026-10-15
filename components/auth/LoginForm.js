'use client';
import { useEffect, useRef, useState } from 'react';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const valid = (p) => /^[6-9]\d{9}$/.test(p);

export default function LoginForm({ next = '/', mode = '', firebase, devOtp }) {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [devCode, setDevCode] = useState('');
  const [wait, setWait] = useState(0);
  const fb = useRef({});
  const codeRef = useRef(null);

  useEffect(() => {
    if (!wait) return;
    const t = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);
  useEffect(() => { if (step === 'code') codeRef.current?.focus(); }, [step]);

  async function firebaseAuth() {
    if (!fb.current.auth) {
      const [{ initializeApp, getApps }, authMod] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
      const app = getApps()[0] || initializeApp(firebaseConfig);
      const auth = authMod.getAuth(app);
      auth.languageCode = 'en';
      fb.current = { auth, authMod };
    }
    return fb.current;
  }

  async function sendCode(e) {
    e?.preventDefault();
    setError('');
    if (!valid(phone)) return setError('Enter your 10-digit mobile number.');
    setBusy(true);
    try {
      if (firebase) {
        const { auth, authMod } = await firebaseAuth();
        if (!fb.current.verifier) fb.current.verifier = new authMod.RecaptchaVerifier(auth, 'recaptcha', { size: 'invisible' });
        fb.current.confirm = await authMod.signInWithPhoneNumber(auth, `+91${phone}`, fb.current.verifier);
      } else if (devOtp) {
        const r = await fetch('/api/auth/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone }) });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setDevCode(d.devCode || '');
      } else {
        throw new Error('Login is not set up yet.');
      }
      setStep('code');
      setWait(30);
    } catch (err) {
      setError(friendly(err));
      try { fb.current.verifier?.clear(); fb.current.verifier = null; } catch {}
    } finally {
      setBusy(false);
    }
  }

  async function verify(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) return setError('Enter the 6-digit code.');
    setBusy(true);
    try {
      let payload = { phone, code, mode, source: document.referrer ? new URL(document.referrer).hostname : 'direct' };
      if (firebase) {
        const cred = await fb.current.confirm.confirm(code);
        payload = { ...payload, idToken: await cred.user.getIdToken() };
      }
      const r = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      const dest = d.needsProfile ? `/onboarding?next=${encodeURIComponent(next)}${mode ? `&mode=${mode}` : ''}` : next;
      window.location.href = dest;
    } catch (err) {
      setError(friendly(err));
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      {step === 'phone' ? (
        <form onSubmit={sendCode} className="stack">
          <label className="field">
            <span>Mobile number</span>
            <div className="phone-input">
              <span className="prefix">+91</span>
              <input className="input" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} autoFocus />
            </div>
          </label>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Sending…' : 'Send OTP'}</button>
          <p className="xs muted center">We’ll send a 6-digit code by SMS. Same number works for both guest and host.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="stack">
          <p className="small" style={{ margin: 0 }}>Code sent to <b>+91 {phone}</b>. <button type="button" className="linkbtn" onClick={() => { setStep('phone'); setCode(''); setError(''); }}>Change</button></p>
          {devCode && <p className="notice notice-warn small">Dev mode (no SMS sent). Your code is <span className="dev-code">{devCode}</span></p>}
          <label className="field">
            <span>Enter OTP</span>
            <input ref={codeRef} className="input otp-input" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
          </label>
          <button className="btn btn-primary btn-block btn-lg" disabled={busy}>{busy ? 'Checking…' : 'Verify & continue'}</button>
          <p className="xs muted center">
            {wait > 0 ? `Resend code in ${wait}s` : <button type="button" className="linkbtn" onClick={sendCode}>Resend code</button>}
          </p>
        </form>
      )}
      {error && <p className="notice notice-err" role="alert">{error}</p>}
      <div id="recaptcha" />
    </div>
  );
}

function friendly(err) {
  const c = err?.code || '';
  if (c.includes('invalid-verification-code')) return 'That code is wrong. Please check and try again.';
  if (c.includes('code-expired')) return 'The code expired. Please ask for a new one.';
  if (c.includes('too-many-requests')) return 'Too many attempts. Please wait a few minutes and try again.';
  if (c.includes('invalid-phone-number')) return 'That phone number looks wrong.';
  if (c.includes('captcha')) return 'Security check failed. Please refresh the page and try again.';
  return err?.message || 'Something went wrong. Please try again.';
}
