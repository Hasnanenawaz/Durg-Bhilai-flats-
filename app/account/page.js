import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import ProfileForm from '@/components/account/ProfileForm';
import AccountTabs from '@/components/account/AccountTabs';
import ModeSwitch from '@/components/ModeSwitch';
import LogoutButton from '@/components/LogoutButton';
import { relTime } from '@/lib/site';

export const metadata = { title: 'My account', robots: { index: false } };

export default async function Account() {
  const user = await requireUser('/account');
  const asked = await db.find('inquiries', { eq: { guest_id: user.id }, order: ['created_at', false], limit: 50 });
  const props = asked.length ? await db.find('properties', { in: { id: asked.map((a) => a.property_id) } }) : [];
  const byId = Object.fromEntries(props.map((p) => [p.id, p]));
  return (
    <div className="wrap dash">
      <div className="dash-head">
        <div><span className="eyebrow">Account</span><h1>Hi, {user.name.split(' ')[0]}</h1></div>
        <div className="row"><ModeSwitch mode={user.active_mode} /><LogoutButton /></div>
      </div>
      <AccountTabs current="/account" />
      <div className="grid-2" style={{ gap: 24, alignItems: 'start' }}>
        <section className="panel"><div className="panel-head"><h2 style={{ fontSize: '1.05rem', margin: 0 }}>Profile</h2></div><div className="panel-body"><ProfileForm user={user} /></div></section>
        <section className="panel">
          <div className="panel-head"><h2 style={{ fontSize: '1.05rem', margin: 0 }}>Owners you contacted</h2><span className="badge">{asked.length}</span></div>
          {asked.length ? asked.map((a) => (
            <div key={a.id} className="hrow" style={{ gridTemplateColumns: '1fr auto' }}>
              <div>{byId[a.property_id] ? <Link href={`/property/${byId[a.property_id].slug}`}>{a.property_title}</Link> : a.property_title}</div>
              <span className="xs muted">{relTime(a.created_at)}</span>
            </div>
          )) : <div className="panel-body"><p className="muted small" style={{ margin: 0 }}>Nothing yet. <Link href="/search">Find a place</Link> and tap “Show owner’s number”.</p></div>}
        </section>
      </div>
      {!user.is_host && (
        <div className="card-flat row between" style={{ marginTop: 24 }}>
          <div><b>Have a place to rent, or need a flatmate?</b><p className="small muted" style={{ margin: 0 }}>Switch to Host and list it free.</p></div>
          <Link className="btn btn-soft" href="/host/new">List your place</Link>
        </div>
      )}
    </div>
  );
}
