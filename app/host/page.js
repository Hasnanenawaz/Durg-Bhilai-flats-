import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import HostTabs from '@/components/host/HostTabs';
import HostActions from '@/components/host/HostActions';
import ModeSwitch from '@/components/ModeSwitch';
import { headline } from '@/components/PropertyCard';
import { cityBySlug } from '@/lib/locations';
import { rupees, relTime } from '@/lib/site';

export const metadata = { title: 'My listings', robots: { index: false } };

const STATUS = {
  pending: ['badge-warn', 'Under review'],
  approved: ['badge-green', 'Live'],
  hidden: ['', 'Paused'],
  rented: ['badge-dark', 'Rented'],
  rejected: ['badge-red', 'Rejected — edit and resubmit'],
};

export default async function HostHome({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser('/host');
  const [props, inq] = await Promise.all([
    db.find('properties', { eq: { owner_id: user.id }, order: ['created_at', false] }),
    db.find('inquiries', { eq: { owner_id: user.id }, limit: 2000 }),
  ]);
  const perProp = {};
  for (const i of inq) perProp[i.property_id] = (perProp[i.property_id] || 0) + 1;
  const week = inq.filter((i) => Date.now() - new Date(i.created_at) < 7 * 864e5).length;
  const views = props.reduce((s, p) => s + (p.views || 0), 0);
  const live = props.filter((p) => p.status === 'approved').length;

  return (
    <div className="wrap dash">
      <div className="dash-head">
        <div><span className="eyebrow">Host</span><h1>Your listings</h1></div>
        <div className="row"><ModeSwitch mode={user.active_mode} /><Link className="btn btn-primary" href="/host/new">+ Add listing</Link></div>
      </div>
      <HostTabs current="/host" newCount={week} />
      {sp.saved && <p className="notice notice-ok" style={{ marginBottom: 18 }}>Saved. {process.env.LISTING_AUTO_APPROVE === 'true' ? 'Your listing is live.' : 'New listings go live after a quick check by our team, usually within a day.'}</p>}

      <div className="stats" style={{ marginBottom: 24 }}>
        <div className="stat"><b>{live}</b><span>live listings</span></div>
        <div className="stat"><b>{views}</b><span>total views</span></div>
        <div className="stat"><b>{inq.length}</b><span>people asked for your number</span></div>
        <div className="stat"><b>{week}</b><span>inquiries this week</span></div>
      </div>

      {props.length ? (
        <div className="panel">
          {props.map((p) => {
            const [cls, label] = STATUS[p.status] || ['', p.status];
            return (
              <div key={p.id} className="hrow">
                <div>
                  <div className="row" style={{ gap: 8, marginBottom: 4 }}><span className={`badge ${cls}`}>{label}</span><span className="xs muted">Updated {relTime(p.updated_at)}</span></div>
                  <Link href={`/property/${p.slug}`} style={{ fontWeight: 600 }}>{p.title || headline(p)}</Link>
                  <div className="small muted">{headline(p)} · {p.locality}, {cityBySlug(p.city)?.name}</div>
                </div>
                <div className="small mono" style={{ textAlign: 'right' }}>
                  <div className="rent" style={{ fontSize: '1.1rem' }}>{rupees(p.rent)}</div>
                  <div className="muted xs">{p.views || 0} views · {perProp[p.id] || 0} inquiries</div>
                </div>
                <HostActions p={p} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty">
          <h3>No listings yet</h3>
          <p>Add your flat, PG or room. It takes about five minutes and costs nothing.</p>
          <Link className="btn btn-primary" href="/host/new">Add your first listing</Link>
        </div>
      )}
    </div>
  );
}
