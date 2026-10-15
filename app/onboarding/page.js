import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import OnboardingForm from '@/components/auth/OnboardingForm';

export const metadata = { title: 'Set up your account', robots: { index: false } };

export default async function Onboarding({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const next = typeof sp.next === 'string' && sp.next.startsWith('/') && !sp.next.startsWith('//') ? sp.next : '/';
  if (user.name) redirect(next);
  return (
    <div className="auth-wrap">
      <span className="eyebrow">Almost done</span>
      <h1 style={{ fontSize: '2rem' }}>Tell us your name</h1>
      <p className="muted">Owners and tenants see this when you contact them.</p>
      <div className="card" style={{ marginTop: 20 }}><OnboardingForm next={next} initialMode={sp.mode === 'host' ? 'host' : user.active_mode} /></div>
    </div>
  );
}
