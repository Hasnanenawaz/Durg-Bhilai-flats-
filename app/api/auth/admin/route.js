import { json, fail, body, sameOrigin } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';
import { loginUser } from '@/lib/models';
import { db } from '@/lib/db';
import { setSessionCookie, adminPhones } from '@/lib/auth';

// Admin login by phone number alone, no OTP (the owner's choice).
// Anyone who knows a number in ADMIN_PHONES can log in as admin.
export async function POST(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  const phone = normalizePhone((await body(req)).phone);
  if (!phone || !adminPhones().includes(phone)) return fail('This number does not have admin access.', 403);
  let user = await loginUser(phone, { source: 'admin-login' });
  if (user.is_blocked) return fail('This account is blocked.', 403);
  if (!user.name) user = await db.update('users', user.id, { name: 'Admin' });
  await setSessionCookie(user.id);
  return json({ ok: true });
}
