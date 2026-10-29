import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { readSession, signSession, SESSION_COOKIE, SESSION_DAYS } from './session';

export const adminPhones = () =>
  (process.env.ADMIN_PHONES || '').split(',').map((p) => p.replace(/\D/g, '').slice(-10)).filter(Boolean);

export const isAdmin = (user) => Boolean(user && adminPhones().includes(user.phone));

export async function getCurrentUser() {
  const jar = await cookies();
  const s = await readSession(jar.get(SESSION_COOKIE)?.value);
  if (!s) return null;
  const user = await db.get('users', s.uid);
  if (!user || user.is_blocked) return null;
  return { ...user, is_admin: isAdmin(user) };
}

/** For pages: redirect to login when signed out. */
export async function requireUser(next = '/') {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (!user.name) redirect(`/onboarding?next=${encodeURIComponent(next)}`);
  return user;
}
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.is_admin) redirect('/admin-login');
  return user;
}

export async function setSessionCookie(uid) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSession(uid), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DAYS * 24 * 3600,
  });
}
export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
