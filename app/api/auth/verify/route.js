import { json, fail, body, sameOrigin } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';
import { firebaseEnabled, verifyFirebaseToken, devOtpEnabled, checkDevOtp } from '@/lib/otp';
import { loginUser } from '@/lib/models';
import { db } from '@/lib/db';
import { setSessionCookie, isAdmin } from '@/lib/auth';

export async function POST(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  const b = await body(req);
  let phone;
  try {
    if (firebaseEnabled) {
      if (!b.idToken) return fail('Missing verification token.');
      phone = normalizePhone(await verifyFirebaseToken(b.idToken));
    } else if (devOtpEnabled) {
      phone = normalizePhone(b.phone);
      if (!phone || !checkDevOtp(phone, b.code)) return fail('That code is wrong or expired.', 401);
    } else {
      return fail('Login is not configured yet. Add Firebase keys.', 503);
    }
  } catch (e) {
    console.error('verify', e);
    return fail('Could not verify the code. Please try again.', 401);
  }
  if (!phone) return fail('Only Indian mobile numbers are supported.', 400);

  let user = await loginUser(phone, { source: String(b.source || '').slice(0, 60), city: b.city });
  if (user.is_blocked) return fail('This account is blocked. Contact support.', 403);
  // Someone who came in through "List your place" lands in host mode.
  if (b.mode === 'host' && user.active_mode !== 'host') {
    user = await db.update('users', user.id, { active_mode: 'host', is_host: true });
  }
  await setSessionCookie(user.id);
  return json({ ok: true, needsProfile: !user.name, mode: user.active_mode, admin: isAdmin(user) });
}
