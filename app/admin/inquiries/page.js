import { db } from '@/lib/db';
import { prettyPhone } from '@/lib/phone';
import { relTime } from '@/lib/site';
import { requireAdmin } from '@/lib/auth';

export default async function AdminInquiries() {
  await requireAdmin();
  const inq = await db.find('inquiries', { order: ['created_at', false], limit: 300 });
  const owners = inq.length ? await db.find('users', { in: { id: [...new Set(inq.map((i) => i.owner_id))] } }) : [];
  const byId = Object.fromEntries(owners.map((o) => [o.id, o]));
  return (
    <>
      <div className="dash-head"><div><span className="eyebrow">Inquiries</span><h1>Who contacted which owner</h1><p className="muted small" style={{ margin: '6px 0 0' }}>A row is added every time a guest reveals an owner’s number. Latest 300.</p></div></div>
      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>Guest</th><th>Listing</th><th>Owner</th><th>When</th></tr></thead>
          <tbody>{inq.map((i) => (
            <tr key={i.id}>
              <td><b>{i.guest_name || '—'}</b><div className="mono xs"><a href={`tel:+91${i.guest_phone}`}>{prettyPhone(i.guest_phone)}</a></div></td>
              <td className="small">{i.property_title}</td>
              <td className="small">{byId[i.owner_id]?.name || '—'}<div className="mono xs">{prettyPhone(byId[i.owner_id]?.phone)}</div></td>
              <td className="xs muted">{relTime(i.created_at)}</td>
            </tr>
          ))}</tbody>
        </table>
        {!inq.length && <p className="panel-body muted small">No inquiries yet.</p>}
      </div>
    </>
  );
}
