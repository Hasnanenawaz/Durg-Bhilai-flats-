import 'server-only';
import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';

// ── Real OTP: Firebase Phone Auth ────────────────────────────────
// The browser sends the SMS and confirms the code with Firebase, then posts
// the Firebase ID token here. We verify it against Google's public keys,
// so no Firebase service-account secret is needed on the server.
export const firebaseEnabled = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'));

export async function verifyFirebaseToken(idToken) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.phone_number) throw new Error('Token has no phone number');
  return payload.phone_number; // "+919876543210"
}

// ── Dev OTP: for local work before Firebase is set up ─────────────
// Never active in production unless ALLOW_DEV_OTP=true (for a private staging site).
export const devOtpEnabled = !firebaseEnabled && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_OTP === 'true');

const store = (globalThis.__devOtp ||= new Map());

export function issueDevOtp(phone) {
  const prev = store.get(phone);
  if (prev && Date.now() - prev.sentAt < 30_000) return { error: 'Please wait 30 seconds before asking for a new code.' };
  const code = String(crypto.randomInt(100000, 1000000));
  store.set(phone, { code, sentAt: Date.now(), expires: Date.now() + 10 * 60_000, tries: 0 });
  return { code };
}

export function checkDevOtp(phone, code) {
  const e = store.get(phone);
  if (!e || Date.now() > e.expires) return false;
  e.tries += 1;
  if (e.tries > 5) { store.delete(phone); return false; }
  const ok = crypto.timingSafeEqual(Buffer.from(e.code), Buffer.from(String(code).padEnd(6).slice(0, 6)));
  if (ok) store.delete(phone);
  return ok;
}
