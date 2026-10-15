import { json, fail, sameOrigin } from '@/lib/api';
import { clearSessionCookie } from '@/lib/auth';
export async function POST(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  await clearSessionCookie();
  return json({ ok: true });
}
