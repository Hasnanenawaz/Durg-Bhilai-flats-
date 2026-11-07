import 'server-only';
import crypto from 'crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { db } from './db';

// ── Real OTP: MSG91 ──────────────────────────────────────────────
// Takes over from Firebase as soon as both variables are set; remove them to go back.
// MSG91 generates, sends and checks the code. The server calls it, so the authkey never reaches the browser.
const MSG91_AUTHKEY = (process.env.MSG91_AUTHKEY || '').trim();
const MSG91_TEMPLATE = (process.env.MSG91_OTP_TEMPLATE_ID || '').trim();
const MSG91_API = process.env.MSG91_API_URL || 'https://control.msg91.com/api/v5'; // overridden only by tests/msg91.mjs
const OTP_MINUTES = '10';

const MSG91_WIDGET_ID = (process.env.MSG91_WIDGET_ID || '').trim();
const MSG91_WIDGET_TOKEN = (process.env.MSG91_WIDGET_TOKEN || '').trim();

export const msg91Enabled = Boolean(MSG91_AUTHKEY && MSG91_TEMPLATE);
// The OTP API wins when its template is set: only there does this server limit how many codes are sent.
export const msg91WidgetEnabled = !msg91Enabled && Boolean(MSG91_AUTHKEY && MSG91_WIDGET_ID && MSG91_WIDGET_TOKEN);
// These two run in the visitor's browser by design, so they are not secrets. The authkey stays on the server.
export const msg91WidgetConfig = msg91WidgetEnabled ? { widgetId: MSG91_WIDGET_ID, tokenAuth: MSG91_WIDGET_TOKEN } : null;

// Limits live in the database because each serverless instance has its own memory.
// A correct code logs in as that number, admins included, so guesses must stay capped across instances.
const MIN = 60_000;
const LIMITS = {
  send: [
    { by: 'phone', windowMs: 0.5 * MIN, max: 1 },
    { by: 'phone', windowMs: 60 * MIN, max: 5 },
    { by: 'ip', windowMs: 60 * MIN, max: 20 },
  ],
  verify: [
    { by: 'phone', windowMs: 15 * MIN, max: 5 },
    { by: 'ip', windowMs: 15 * MIN, max: 30 },
  ],
};

// Records first and counts after, so simultaneous requests all see each other and can't slip past the cap.
async function overLimit(kind, phone, ip) {
  await db.insert('otp_events', { kind, phone, ip });
  const values = { phone, ip };
  const counts = await Promise.all(LIMITS[kind].map(({ by, windowMs }) => db.count('otp_events', {
    eq: { kind, [by]: values[by] },
    gte: { created_at: new Date(Date.now() - windowMs).toISOString() },
  })));
  return LIMITS[kind].some(({ max }, i) => counts[i] > max);
}

async function callMsg91(path, params, method) {
  const r = await fetch(`${MSG91_API}${path}?${new URLSearchParams(params)}`, {
    method,
    headers: { authkey: MSG91_AUTHKEY, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(10_000),
  });
  return r.json().catch(() => ({}));
}

/** Returns {} when the SMS was accepted, or { error, status }. */
export async function sendMsg91Otp(phone, ip) {
  if (await overLimit('send', phone, ip)) return { error: 'Too many codes requested. Please wait a while and try again.', status: 429 };
  await db.removeOlderThan('otp_events', new Date(Date.now() - 24 * 60 * MIN).toISOString()).catch(() => {});
  const d = await callMsg91('/otp', { template_id: MSG91_TEMPLATE, mobile: `91${phone}`, otp_length: '6', otp_expiry: OTP_MINUTES }, 'POST');
  if (d?.type === 'success') return {};
  console.error('msg91 send failed:', d?.message);
  return { error: 'Could not send the code. Please try again.', status: 502 };
}

/** Returns {} only when MSG91 confirms the code, or { error, status }. Anything unexpected counts as wrong. */
export async function checkMsg91Otp(phone, code, ip) {
  const wrong = { error: 'That code is wrong or expired.', status: 401 };
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return wrong;
  if (await overLimit('verify', phone, ip)) return { error: 'Too many attempts. Please wait a few minutes and try again.', status: 429 };
  const d = await callMsg91('/otp/verify', { otp: code, mobile: `91${phone}`, otp_expiry: OTP_MINUTES }, 'GET');
  return d?.message === 'OTP verified success' ? {} : wrong;
}

/**
 * Returns the number MSG91 verified, or null. The number must come from this reply and never from the browser,
 * or someone could verify their own phone and claim an admin's number. The token itself holds no number.
 * Rejections also arrive as HTTP 200, so only the body counts. Reply format seen on a live login, not documented by MSG91.
 */
export async function verifyMsg91WidgetToken(token) {
  if (typeof token !== 'string' || token.length > 4096 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) return null;
  const r = await fetch(`${MSG91_API}/widget/verifyAccessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authkey: MSG91_AUTHKEY, 'access-token': token }),
    signal: AbortSignal.timeout(10_000),
  });
  const d = await r.json().catch(() => ({}));
  const number = String(d?.message ?? '');
  if (d?.type === 'success' && /^91[6-9]\d{9}$/.test(number)) return number;
  console.error('msg91 widget verify rejected:', d?.type, d?.code); // never log message: it can hold a phone number
  return null;
}

// ── Real OTP: Firebase Phone Auth ────────────────────────────────
// The browser sends the SMS and confirms the code with Firebase, then posts
// the Firebase ID token here. We verify it against Google's public keys,
// so no Firebase service-account secret is needed on the server.
// All four are needed by the browser SDK; with only some set, login would break in the browser.
export const firebaseEnabled = !msg91Enabled && !msg91WidgetEnabled && Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && process.env.NEXT_PUBLIC_FIREBASE_APP_ID);

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
// Never active in production unless ALLOW_DEV_OTP=true (for a private staging site or a local test run).
// The code is returned to the browser, so anyone could log in as any number, admins included:
// it is always off on Vercel's production environment, whatever ALLOW_DEV_OTP says.
export const devOtpEnabled = !msg91Enabled && !msg91WidgetEnabled && !firebaseEnabled && process.env.VERCEL_ENV !== 'production'
  && (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_OTP === 'true');

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
