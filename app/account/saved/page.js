import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import AccountTabs from '@/components/account/AccountTabs';
import PropertyCard from '@/components/PropertyCard';

export const metadata = { title: 'Saved places', robots: { index: false } };

export default async function Saved() {
  const user = await requireUser('/account/saved');
  const favs = await db.find('favorites', { eq: { user_id: user.id }, order: ['created_at', false] });
  const props = favs.length ? await db.find('properties', { in: { id: favs.map((f) => f.property_id), status: ['approved', 'rented'] } }) : [];
  return (
    <div className="wrap dash">
      <div className="dash-head"><div><span className="eyebrow">Account</span><h1>Saved places</h1></div></div>
      <AccountTabs current="/account/saved" />
      {props.length ? <div className="listings cols-2">{props.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        : <div className="empty"><h3>No saved places yet</h3><p>Tap “♡ Save” on any listing to shortlist it here.</p><Link className="btn btn-primary btn-sm" href="/search">Find a place</Link></div>}
    </div>
  );
}
