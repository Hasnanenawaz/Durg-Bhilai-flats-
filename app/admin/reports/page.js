import Link from 'next/link';
import { db } from '@/lib/db';
import ResolveButton from '@/components/admin/ResolveButton';
import { relTime } from '@/lib/site';
import { requireAdmin } from '@/lib/auth';

export default async function AdminReports() {
  await requireAdmin();
  const reports = await db.find('reports', { order: ['created_at', false], limit: 200 });
  const props = reports.length ? await db.find('properties', { in: { id: [...new Set(reports.map((r) => r.property_id).filter(Boolean))] } }) : [];
  const byId = Object.fromEntries(props.map((p) => [p.id, p]));
  return (
    <>
      <div className="dash-head"><div><span className="eyebrow">Reports</span><h1>Flagged listings</h1></div></div>
      <div className="panel">
        {reports.map((r) => (
          <div key={r.id} className="hrow">
            <div>
              <span className={`badge ${r.resolved ? '' : 'badge-red'}`}>{r.reason}</span>
              <div style={{ marginTop: 6 }}>{byId[r.property_id] ? <Link href={`/property/${byId[r.property_id].slug}`}>{byId[r.property_id].title}</Link> : 'Deleted listing'}</div>
              {r.details && <div className="small muted">{r.details}</div>}
            </div>
            <span className="xs muted">{relTime(r.created_at)}</span>
            <div className="row" style={{ gap: 6 }}>
              {byId[r.property_id] && <Link className="btn btn-ghost btn-sm" href={`/admin/listings?status=${byId[r.property_id].status}`}>Manage listing</Link>}
              <ResolveButton id={r.id} resolved={r.resolved} />
            </div>
          </div>
        ))}
        {!reports.length && <p className="panel-body muted small">No reports. 🎉</p>}
      </div>
    </>
  );
}
