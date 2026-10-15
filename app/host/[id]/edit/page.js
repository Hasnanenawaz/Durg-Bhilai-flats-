import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import PropertyForm from '@/components/host/PropertyForm';

export const metadata = { title: 'Edit listing', robots: { index: false } };

export default async function EditListing({ params }) {
  const { id } = await params;
  const user = await requireUser(`/host/${id}/edit`);
  const p = await db.get('properties', id);
  if (!p || (p.owner_id !== user.id && !user.is_admin)) notFound();
  const initial = Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? '']));
  return (
    <div className="wrap dash" style={{ maxWidth: 860 }}>
      <div className="dash-head"><div><span className="eyebrow">Host</span><h1>Edit listing</h1></div><a className="small" href={`/property/${p.slug}`}>View listing →</a></div>
      {p.status === 'rejected' && <p className="notice notice-warn" style={{ marginBottom: 16 }}>This listing was rejected. Fix the details and save to send it for review again.</p>}
      <PropertyForm user={user} initial={initial} />
    </div>
  );
}
