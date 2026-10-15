import 'server-only';
import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';

export const json = (data, status = 200) => NextResponse.json(data, { status });
export const fail = (error, status = 400) => NextResponse.json({ error }, { status });

/** Blocks cross-site form posts on top of SameSite=lax cookies. */
export function sameOrigin(req) {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.get('host'); } catch { return false; }
}

export async function withUser(req, fn, { admin = false } = {}) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  const user = await getCurrentUser();
  if (!user) return fail('Please log in first.', 401);
  if (admin && !user.is_admin) return fail('Admins only.', 403);
  try {
    return await fn(user);
  } catch (e) {
    console.error(e);
    return fail('Something went wrong. Please try again.', 500);
  }
}

export async function body(req) {
  try { return await req.json(); } catch { return {}; }
}
