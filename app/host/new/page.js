import { requireUser } from '@/lib/auth';
import PropertyForm from '@/components/host/PropertyForm';
import HostTabs from '@/components/host/HostTabs';

export const metadata = { title: 'Add a listing', robots: { index: false } };

export default async function NewListing() {
  const user = await requireUser('/host/new');
  return (
    <div className="wrap dash" style={{ maxWidth: 860 }}>
      <div className="dash-head"><div><span className="eyebrow">Host · free listing</span><h1>Add your place</h1></div></div>
      <HostTabs current="/host/new" />
      <PropertyForm user={user} />
    </div>
  );
}
