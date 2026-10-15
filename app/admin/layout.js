import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import AdminNav from '@/components/admin/AdminNav';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }) {
  await requireAdmin();
  const [pending, reports] = await Promise.all([
    db.count('properties', { eq: { status: 'pending' } }),
    db.count('reports', { eq: { resolved: false } }),
  ]);
  return (
    <div className="admin">
      <AdminNav pending={pending} reports={reports} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
