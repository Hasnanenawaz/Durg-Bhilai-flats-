import Link from 'next/link';
import { db, usingSupabase } from '@/lib/db';
import { firebaseEnabled } from '@/lib/otp';
import { prettyPhone } from '@/lib/phone';
import { relTime } from '@/lib/site';
import { cityBySlug } from '@/lib/locations';
import { requireAdmin } from '@/lib/auth';

export default async function AdminHome() {
  await requireAdmin();
  const [users, props, inq] = await Promise.all([
    db.find('users', { order: ['created_at', false], limit: 100000 }),
    db.find('properties', { limit: 100000 }),
    db.find('inquiries', { limit: 100000 }),
  ]);
  const since = (d, days) => Date.now() - new Date(d) < days * 864e5;
  const newUsers = users.filter((u) => since(u.created_at, 7)).length;
  const hosts = users.filter((u) => u.is_host).length;
  const byStatus = (s) => props.filter((p) => p.status === s).length;
  const cityCount = {};
  for (const p of props) if (p.status === 'approved') cityCount[p.city] = (cityCount[p.city] || 0) + 1;
  const uncalled = users.filter((u) => u.lead_status === 'new').length;

  return (
    <>
      <div className="dash-head"><div><span className="eyebrow">Overview</span><h1>Today at a glance</h1></div>
        <a className="btn btn-ghost btn-sm" href="/api/admin/users/export">Download all phone numbers (CSV)</a></div>
      {(!usingSupabase || !firebaseEnabled) && (
        <p className="notice notice-warn" style={{ marginBottom: 20 }}>
          Setup: {!usingSupabase && 'running on local JSON storage (add Supabase keys before going live). '}{!firebaseEnabled && 'OTP is in dev mode (add Firebase keys to send real SMS).'}
        </p>
      )}
      <div className="stats">
        <div className="stat"><b>{users.length}</b><span>accounts ({newUsers} this week)</span></div>
        <div className="stat"><b>{hosts}</b><span>hosts</span></div>
        <div className="stat"><b>{byStatus('approved')}</b><span>live listings</span></div>
        <div className="stat"><b>{inq.filter((i) => since(i.created_at, 7)).length}</b><span>owner contacts this week</span></div>
      </div>
      <div className="grid-2" style={{ marginTop: 24, gap: 20, alignItems: 'start' }}>
        <section className="panel">
          <div className="panel-head"><h2 style={{ fontSize: '1.05rem', margin: 0 }}>Newest sign-ups</h2><Link className="small" href="/admin/users">{uncalled} not called yet →</Link></div>
          {users.slice(0, 8).map((u) => (
            <div key={u.id} className="hrow" style={{ gridTemplateColumns: '1fr auto' }}>
              <div><b>{u.name || 'No name yet'}</b> <span className="badge">{u.active_mode}</span><div className="small mono"><a href={`tel:+91${u.phone}`}>{prettyPhone(u.phone)}</a></div></div>
              <span className="xs muted">{relTime(u.created_at)}</span>
            </div>
          ))}
          {!users.length && <div className="panel-body muted small">No sign-ups yet.</div>}
        </section>
        <section className="panel">
          <div className="panel-head"><h2 style={{ fontSize: '1.05rem', margin: 0 }}>Listings</h2><Link className="small" href="/admin/listings?status=pending">Review pending →</Link></div>
          <div className="panel-body">
            <div className="stats" style={{ gridTemplateColumns: 'repeat(2,1fr)' }}>
              <div className="stat"><b>{byStatus('pending')}</b><span>waiting for review</span></div>
              <div className="stat"><b>{byStatus('rented')}</b><span>marked rented</span></div>
            </div>
            <h3 style={{ fontSize: '0.95rem', marginTop: 18 }}>Live listings by city</h3>
            {Object.entries(cityCount).sort((a, b) => b[1] - a[1]).map(([c, n]) => (
              <div key={c} className="row between small" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)' }}><span>{cityBySlug(c)?.name || c}</span><b className="mono">{n}</b></div>
            ))}
            {!Object.keys(cityCount).length && <p className="small muted">No live listings yet.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
