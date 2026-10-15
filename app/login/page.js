import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { getCurrentUser } from '@/lib/auth';
import { firebaseEnabled, devOtpEnabled } from '@/lib/otp';

export const metadata = { title: 'Log in with OTP', robots: { index: false } };

const safeNext = (n) => (typeof n === 'string' && n.startsWith('/') && !n.startsWith('//') ? n : '/');

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const next = safeNext(sp.next);
  const mode = sp.mode === 'host' ? 'host' : '';
  const user = await getCurrentUser();
  if (user) redirect(user.name ? next : `/onboarding?next=${encodeURIComponent(next)}`);
  return (
    <div className="auth-wrap">
      <span className="eyebrow">{mode === 'host' ? 'List your place free' : 'Welcome'}</span>
      <h1 style={{ fontSize: '2rem' }}>{mode === 'host' ? 'Start with your phone number' : 'Log in or sign up'}</h1>
      <p className="muted">One account for everything. Look for a place as a guest, or switch to host and list yours.</p>
      <div className="card" style={{ marginTop: 20 }}>
        <LoginForm next={next} mode={mode} firebase={firebaseEnabled} devOtp={devOtpEnabled} />
      </div>
      <p className="xs muted" style={{ marginTop: 16 }}>By continuing you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>. Your number is shared with an owner only when you ask for theirs.</p>
    </div>
  );
}
