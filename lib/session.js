import { SignJWT, jwtVerify } from 'jose';

// Edge-safe helpers (used by middleware and server code).
export const SESSION_COOKIE = 'dbf_session';
export const SESSION_DAYS = 30;

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET must be set (16+ chars)');
    return new TextEncoder().encode('dev-only-insecure-session-secret-change-me');
  }
  return new TextEncoder().encode(s);
}

export async function signSession(uid) {
  return new SignJWT({ uid })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(key());
}

export async function readSession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    return payload.uid ? { uid: payload.uid } : null;
  } catch {
    return null;
  }
}
