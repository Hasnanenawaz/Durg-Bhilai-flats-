'use client';
import { useState } from 'react';
export default function ResolveButton({ id, resolved }) {
  const [r, setR] = useState(resolved);
  return <button className={`btn btn-sm ${r ? 'btn-ghost' : 'btn-soft'}`} onClick={async () => { const res = await fetch(`/api/admin/reports/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: !r }) }); if (res.ok) setR(!r); }}>{r ? 'Reopen' : 'Mark resolved'}</button>;
}
