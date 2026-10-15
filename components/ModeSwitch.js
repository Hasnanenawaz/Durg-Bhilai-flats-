'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ModeSwitch({ mode }) {
  const router = useRouter();
  const [cur, setCur] = useState(mode);
  const [busy, setBusy] = useState(false);
  async function pick(m) {
    if (m === cur || busy) return;
    setBusy(true);
    setCur(m);
    const r = await fetch('/api/me', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active_mode: m }) });
    setBusy(false);
    if (!r.ok) return setCur(cur);
    router.push(m === 'host' ? '/host' : '/search');
    router.refresh();
  }
  return (
    <div className="mode-switch" role="group" aria-label="Switch between guest and host">
      <button type="button" aria-pressed={cur === 'guest'} onClick={() => pick('guest')}>Guest</button>
      <button type="button" aria-pressed={cur === 'host'} onClick={() => pick('host')}>Host</button>
    </div>
  );
}
