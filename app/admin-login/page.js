import { redirect } from 'next/navigation';
import AdminLoginForm from '@/components/auth/AdminLoginForm';
import { getCurrentUser } from '@/lib/auth';

export const metadata = { title: 'Admin login', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user?.is_admin) redirect('/admin');
  return (
    <div className="auth-wrap">
      <span className="eyebrow">Admin</span>
      <h1 style={{ fontSize: '2rem' }}>Admin login</h1>
      <p className="muted">Enter an admin mobile number to open the admin panel.</p>
      <div className="card" style={{ marginTop: 20 }}>
        <AdminLoginForm />
      </div>
    </div>
  );
}
