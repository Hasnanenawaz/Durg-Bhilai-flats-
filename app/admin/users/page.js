import { db } from '@/lib/db';
import UserRow from '@/components/admin/UserRow';

const PER = 50;

export default async function AdminUsers({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q || '').trim();
  const query = { order: ['created_at', false], eq: {} };
  if (['guest', 'host'].includes(sp.mode)) query.eq.active_mode = sp.mode;
  if (sp.status) query.eq.lead_status = sp.status;
  if (q) query.search = { cols: ['name', 'phone', 'email'], term: q.replace(/\D/g, '').length >= 4 ? q.replace(/\D/g, '').slice(-10) : q };
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const [users, total, props, inq] = await Promise.all([
    db.find('users', { ...query, limit: PER, offset: (page - 1) * PER }),
    db.count('users', query),
    db.find('properties', { limit: 100000 }),
    db.find('inquiries', { limit: 100000 }),
  ]);
  const listings = {}; for (const p of props) listings[p.owner_id] = (listings[p.owner_id] || 0) + 1;
  const asked = {}; for (const i of inq) asked[i.guest_id] = (asked[i.guest_id] || 0) + 1;
  const qs = (p) => new URLSearchParams({ ...sp, page: String(p) }).toString();
  return (
    <>
      <div className="dash-head">
        <div><span className="eyebrow">Users</span><h1>Everyone who signed up</h1><p className="muted small" style={{ margin: '6px 0 0' }}>Every verified phone number, with call and WhatsApp buttons. Track who you’ve called.</p></div>
        <a className="btn btn-primary btn-sm" href="/api/admin/users/export">Export CSV</a>
      </div>
      <form className="row" style={{ marginBottom: 16 }} method="get">
        <input className="input" name="q" defaultValue={q} placeholder="Search name or phone" style={{ maxWidth: 260 }} />
        <select className="input" name="mode" defaultValue={sp.mode || ''} style={{ maxWidth: 150 }}><option value="">Guests & hosts</option><option value="guest">Guests</option><option value="host">Hosts</option></select>
        <select className="input" name="status" defaultValue={sp.status || ''} style={{ maxWidth: 170 }}>
          <option value="">Any lead status</option><option value="new">New</option><option value="called">Called</option><option value="interested">Interested</option><option value="not_interested">Not interested</option><option value="converted">Converted</option>
        </select>
        <button className="btn btn-ghost btn-sm">Filter</button>
        <span className="small muted">{total} users</span>
      </form>
      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Phone</th><th>Mode</th><th>Owners contacted</th><th>Lead status</th><th>Notes</th><th>Joined</th><th></th></tr></thead>
          <tbody>{users.map((u) => <UserRow key={u.id} u={u} listings={listings[u.id] || 0} asked={asked[u.id] || 0} />)}</tbody>
        </table>
        {!users.length && <p className="panel-body muted small">No users match.</p>}
      </div>
      {total > PER && (
        <div className="pager">
          {page > 1 && <a className="btn btn-ghost btn-sm" href={`?${qs(page - 1)}`}>← Prev</a>}
          <span className="small muted">Page {page} of {Math.ceil(total / PER)}</span>
          {page * PER < total && <a className="btn btn-ghost btn-sm" href={`?${qs(page + 1)}`}>Next →</a>}
        </div>
      )}
    </>
  );
}
