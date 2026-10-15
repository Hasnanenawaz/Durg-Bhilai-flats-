import { json, fail, body, sameOrigin } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';
import { devOtpEnabled, issueDevOtp } from '@/lib/otp';

// Dev-mode only. With Firebase configured the browser sends the SMS itself.
export async function POST(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  if (!devOtpEnabled) return fail('OTP is sent by Firebase on this site.', 400);
  const phone = normalizePhone((await body(req)).phone);
  if (!phone) return fail('Enter a valid 10-digit mobile number.');
  const r = issueDevOtp(phone);
  if (r.error) return fail(r.error, 429);
  console.log(`[dev OTP] ${phone}: ${r.code}`);
  return json({ ok: true, devCode: r.code });
}
