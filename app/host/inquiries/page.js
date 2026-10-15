import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import HostTabs from '@/components/host/HostTabs';
import { prettyPhone, waLink } from '@/lib/phone';
import { relTime } from '@/lib/site';

export const metadata = { title: 'Inquiries', robots: { index: false } };

export default async function Inquiries() {
  const user = await requireUser('/host/inquiries');
  const inq = await db.find('inquiries', { eq: { owner_id: user.id }, order: ['created_at', false], limit: 300 });
  const week = inq.filter((i) => Date.now() - new Date(i.created_at) < 7 * 864e5).length;
  return (
    <div className="wrap dash">
      <div className="dash-head"><div><span className="eyebrow">Host</span><h1>People who asked about your places</h1></div></div>
      <HostTabs current="/host/inquiries" newCount={week} />
      <p className="muted small">Each person here tapped “Show owner’s number” on your listing. Call them back if you missed their call.</p>
      {inq.length ? (
        <div className="panel">
          {inq.map((i) => (
            <div key={i.id} className="hrow">
              <div><b>{i.guest_name || 'Guest'}</b><div className="small muted">asked about {i.property_title}</div></div>
              <span className="xs muted">{relTime(i.created_at)}</span>
              <div className="row" style={{ gap: 6 }}>
                <a className="btn btn-soft btn-sm" href={`tel:+91${i.guest_phone}`}>{prettyPhone(i.guest_phone)}</a>
                <a className="btn btn-ghost btn-sm" href={waLink(i.guest_phone, `Hi ${i.guest_name || ''}, you asked about my listing "${i.property_title}" on Durg Bhilai Flats & Flatmates.`)} target="_blank" rel="noopener">WhatsApp</a>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="empty"><h3>No inquiries yet</h3><p>Once your listing is live, people who ask for your number show up here.</p><Link className="btn btn-ghost btn-sm" href="/host">Back to listings</Link></div>}
    </div>
  );
}
