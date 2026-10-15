import Link from 'next/link';
import { db } from '@/lib/db';
import ListingActions from '@/components/admin/ListingActions';
import { headline } from '@/components/PropertyCard';
import { cityBySlug, CITIES } from '@/lib/locations';
import { prettyPhone } from '@/lib/phone';
import { rupees, relTime } from '@/lib/site';
import { requireAdmin } from '@/lib/auth';

const TABS = [['pending', 'Pending'], ['approved', 'Live'], ['rented', 'Rented'], ['hidden', 'Hidden'], ['rejected', 'Rejected'], ['', 'All']];

export default async function AdminListings({ searchParams }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = sp.status ?? 'pending';
  const query = { eq: {}, order: ['created_at', false], limit: 200 };
  if (status) query.eq.status = status;
  if (sp.city) query.eq.city = sp.city;
  const props = await db.find('properties', query);
  const owners = props.length ? await db.find('users', { in: { id: [...new Set(props.map((p) => p.owner_id))] } }) : [];
  const ownerById = Object.fromEntries(owners.map((o) => [o.id, o]));
  return (
    <>
      <div className="dash-head"><div><span className="eyebrow">Listings</span><h1>Review and manage listings</h1></div></div>
      <nav className="tabs">{TABS.map(([v, l]) => <Link key={v} href={`/admin/listings?status=${v}`} aria-current={status === v ? 'page' : undefined}>{l}</Link>)}</nav>
      <form className="row" method="get" style={{ marginBottom: 14 }}>
        <input type="hidden" name="status" value={status} />
        <select className="input" name="city" defaultValue={sp.city || ''} style={{ maxWidth: 200 }}><option value="">All cities</option>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
        <button className="btn btn-ghost btn-sm">Filter</button><span className="small muted">{props.length} shown</span>
      </form>
      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>Listing</th><th>Rent</th><th>Owner</th><th>Added</th><th>Actions</th></tr></thead>
          <tbody>
            {props.map((p) => {
              const o = ownerById[p.owner_id];
              return (
                <tr key={p.id}>
                  <td style={{ maxWidth: 340 }}>
                    <Link href={`/property/${p.slug}`} style={{ fontWeight: 600 }}>{p.title || headline(p)}</Link>
                    <div className="xs muted">{headline(p)} · {p.locality}, {cityBySlug(p.city)?.name} · {p.images?.length || 0} photos</div>
                    {p.address && <div className="xs muted">Address: {p.address}</div>}
                    {p.description && <div className="xs" style={{ marginTop: 4, color: 'var(--ink-2)' }}>{p.description.slice(0, 140)}{p.description.length > 140 ? '…' : ''}</div>}
                  </td>
                  <td className="mono">{rupees(p.rent)}<div className="xs muted">{p.views || 0} views</div></td>
                  <td className="small">{o?.name || '—'}<div className="mono xs"><a href={`tel:+91${p.contact_phone}`}>{prettyPhone(p.contact_phone)}</a></div></td>
                  <td className="xs muted">{relTime(p.created_at)}</td>
                  <td><ListingActions p={p} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!props.length && <p className="panel-body muted small">Nothing here.</p>}
      </div>
    </>
  );
}
