import { json, fail, body, sameOrigin } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';
import { loginUser } from '@/lib/models';
import { db } from '@/lib/db';
import { setSessionCookie, adminPhones, adminPasscodeSet, checkAdminPasscode } from '@/lib/auth';

// Admin login by a shared passcode, no OTP (the owner's choice).
// Anyone who knows ADMIN_PASSCODE gets in, as the first number in ADMIN_PHONES.
export async function POST(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  const phone = normalizePhone(adminPhones()[0]);
  if (!adminPasscodeSet() || !phone) return fail('Admin login is not set up yet.', 503);
  if (!checkAdminPasscode((await body(req)).passcode)) return fail('That passcode is wrong.', 403);
  let user = await loginUser(phone, { source: 'admin-login' });
  if (user.is_blocked) return fail('This account is blocked.', 403);
  if (!user.name) user = await db.update('users', user.id, { name: 'Admin' });
  await setSessionCookie(user.id);
  return json({ ok: true });
}
