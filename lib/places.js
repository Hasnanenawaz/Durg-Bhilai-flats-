import 'server-only';

// Google Places API (New), called only from the server so the key never reaches the browser.
// Autocomplete calls plus one details call sharing a session token are billed as one session.
const KEY = (process.env.GOOGLE_PLACES_API_KEY || '').trim();
const API = process.env.GOOGLE_PLACES_API_URL || 'https://places.googleapis.com/v1'; // overridden only by tests/places.mjs

export const placesEnabled = Boolean(KEY);

// Prefers Chhattisgarh without hiding the rest of India, so "Nehru Nagar, Delhi" can be recognised as outside.
const CHHATTISGARH = { rectangle: { low: { latitude: 17.7, longitude: 80.2 }, high: { latitude: 24.2, longitude: 84.5 } } };

const validSession = (s) => (typeof s === 'string' && /^[\w-]{8,64}$/.test(s) ? s : undefined);
// The id goes into the request path, so nothing that could change the path gets through.
export const validPlaceId = (id) => typeof id === 'string' && /^[\w-]{10,300}$/.test(id);

async function google(path, init) {
  const r = await fetch(`${API}${path}`, { ...init, headers: { 'X-Goog-Api-Key': KEY, ...init.headers } });
  if (!r.ok) throw new Error(`Google Places replied ${r.status}`);
  return r.json();
}

export async function autocomplete(input, session) {
  const d = await google('/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat',
    },
    body: JSON.stringify({ input, sessionToken: validSession(session), includedRegionCodes: ['in'], locationBias: CHHATTISGARH, languageCode: 'en' }),
    signal: AbortSignal.timeout(3000),
  });
  return (d.suggestions || []).map((s) => s.placePrediction).filter((p) => p?.placeId).map((p) => ({
    id: p.placeId,
    main: p.structuredFormat?.mainText?.text || p.text?.text || '',
    secondary: p.structuredFormat?.secondaryText?.text || '',
  }));
}

/** addressComponents is in the cheaper Essentials tier. displayName is Pro, and the suggestion already gave us the name. */
export async function placeAddress(id, session) {
  const s = validSession(session);
  const d = await google(`/places/${id}?languageCode=en${s ? `&sessionToken=${s}` : ''}`, {
    method: 'GET',
    headers: { 'X-Goog-FieldMask': 'addressComponents' },
    signal: AbortSignal.timeout(5000),
  });
  const part = (...types) => {
    for (const t of types) {
      const hit = (d.addressComponents || []).find((c) => c.types?.includes(t));
      if (hit) return hit.longText || '';
    }
    return '';
  };
  return { city: part('locality'), district: part('administrative_area_level_3', 'administrative_area_level_2'), state: part('administrative_area_level_1') };
}

// Per IP and per server instance, because writing to the database on every keystroke is too heavy.
// It only stops one visitor hammering the box. The quota cap on the Google key is the real spending limit.
const hits = new Map();
export function overLimit(kind, ip, max) {
  const now = Date.now();
  const key = `${kind}|${ip}`;
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    if (hits.size > 5000) for (const [k, v] of hits) if (now > v.resetAt) hits.delete(k);
    hits.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > max;
}
