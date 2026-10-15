import { json } from '@/lib/api';
import { clearSessionCookie } from '@/lib/auth';
export async function POST() {
  await clearSessionCookie();
  return json({ ok: true });
}
