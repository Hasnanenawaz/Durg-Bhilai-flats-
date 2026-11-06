import { json, fail, body, sameOrigin, clientIp } from '@/lib/api';
import { normalizePhone } from '@/lib/phone';
import { msg91Enabled, sendMsg91Otp, devOtpEnabled, issueDevOtp } from '@/lib/otp';

// Sends the code for MSG91 and dev mode. With Firebase the browser sends the SMS itself.
export async function POST(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  if (!msg91Enabled && !devOtpEnabled) return fail('OTP is sent by Firebase on this site.', 400);
  const phone = normalizePhone((await body(req)).phone);
  if (!phone) return fail('Enter a valid 10-digit mobile number.');
  if (msg91Enabled) {
    try {
      const r = await sendMsg91Otp(phone, clientIp(req));
      return r.error ? fail(r.error, r.status) : json({ ok: true });
    } catch (e) {
      console.error('otp send', e);
      return fail('Could not send the code. Please try again.', 502);
    }
  }
  const r = issueDevOtp(phone);
  if (r.error) return fail(r.error, 429);
  console.log(`[dev OTP] ${phone}: ${r.code}`);
  return json({ ok: true, devCode: r.code });
}
