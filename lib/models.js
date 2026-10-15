import 'server-only';
import crypto from 'crypto';
import { db, storage } from './db';
import { normalizePhone } from './phone';
import { CITIES, LISTING_TYPES, AMENITIES, TENANT_PREFS, BHK, FURNISHING, cityBySlug, typeByValue } from './locations';

export const slugify = (s) =>
  String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 70);

const clampInt = (v, min = 0, max = 10_000_000) => {
  const n = Math.round(Number(String(v ?? '').replace(/[^\d.]/g, '')));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : 0;
};
const str = (v, max = 200) => (v == null ? '' : String(v).trim().slice(0, max));

// ───────────────────────── Users ─────────────────────────
export async function loginUser(phone, { source, city } = {}) {
  const existing = await db.getBy('users', 'phone', phone);
  if (existing) {
    return db.update('users', existing.id, { last_login_at: new Date().toISOString(), login_count: (existing.login_count || 0) + 1 });
  }
  return db.insert('users', {
    phone, name: null, email: null, whatsapp: phone, active_mode: 'guest', is_host: false, is_blocked: false,
    lead_status: 'new', admin_notes: null, signup_city: city || null, signup_source: source || null,
    login_count: 1, last_login_at: new Date().toISOString(),
  });
}

export function cleanProfile(input) {
  const out = {};
  if ('name' in input) out.name = str(input.name, 80) || null;
  if ('email' in input) out.email = /^\S+@\S+\.\S+$/.test(str(input.email, 120)) ? str(input.email, 120) : null;
  if ('whatsapp' in input) out.whatsapp = normalizePhone(input.whatsapp);
  if ('active_mode' in input && ['guest', 'host'].includes(input.active_mode)) out.active_mode = input.active_mode;
  if ('signup_city' in input) out.signup_city = cityBySlug(input.signup_city) ? input.signup_city : null;
  return out;
}

// ───────────────────────── Properties ─────────────────────────
/** Keeps only photos this listing may use: real stored paths that `allowed(path)` accepts. URLs are rebuilt server-side. */
function pickImages(list, allowed) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list
    .map((i) => i?.path)
    .filter((p) => storage.isValidPath(p) && p.startsWith('properties/') && allowed(p) && !seen.has(p) && seen.add(p))
    .slice(0, 10)
    .map((p) => ({ url: storage.urlFor(p), path: p }));
}

export function cleanProperty(input, allowImage = () => false) {
  const type = typeByValue(input.listing_type) ? input.listing_type : 'flat';
  const city = cityBySlug(input.city) ? input.city : 'bhilai';
  const images = pickImages(input.images, allowImage);
  return {
    listing_type: type,
    title: str(input.title, 120),
    description: str(input.description, 3000),
    bhk: BHK.includes(input.bhk) ? input.bhk : null,
    furnishing: FURNISHING.includes(input.furnishing) ? input.furnishing : null,
    tenant_pref: TENANT_PREFS.some((t) => t.value === input.tenant_pref) ? input.tenant_pref : 'any',
    rent: clampInt(input.rent, 0, 500000),
    deposit: clampInt(input.deposit, 0, 5000000),
    maintenance: clampInt(input.maintenance, 0, 100000),
    food_included: Boolean(input.food_included),
    available_from: /^\d{4}-\d{2}-\d{2}$/.test(input.available_from || '') ? input.available_from : null,
    city,
    locality: str(input.locality, 80),
    address: str(input.address, 300),
    landmark: str(input.landmark, 120),
    pincode: /^\d{6}$/.test(str(input.pincode)) ? str(input.pincode) : null,
    lat: Number.isFinite(Number(input.lat)) && input.lat !== '' && input.lat != null ? Number(input.lat) : null,
    lng: Number.isFinite(Number(input.lng)) && input.lng !== '' && input.lng != null ? Number(input.lng) : null,
    amenities: Array.isArray(input.amenities) ? input.amenities.filter((a) => AMENITIES.includes(a)) : [],
    images,
    contact_name: str(input.contact_name, 80),
    contact_phone: normalizePhone(input.contact_phone),
    whatsapp: normalizePhone(input.whatsapp),
  };
}

export function validateProperty(p) {
  const errors = [];
  if (p.title.length < 8) errors.push('Give the listing a clear title (at least 8 characters).');
  if (!p.rent) errors.push('Enter the monthly rent.');
  if (!p.locality) errors.push('Choose or type the locality.');
  if (!p.contact_phone) errors.push('Enter a valid 10-digit contact number.');
  return errors;
}

export async function createProperty(owner, input) {
  const clean = cleanProperty(input, (p) => p.startsWith(`properties/${owner.id}/`));
  const errors = validateProperty(clean);
  if (errors.length) return { errors };
  const base = slugify(`${clean.bhk || typeByValue(clean.listing_type).label} ${clean.listing_type === 'pg' ? 'pg' : ''} ${clean.locality} ${cityBySlug(clean.city).name}`);
  const slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  const row = await db.insert('properties', {
    ...clean, slug, owner_id: owner.id,
    status: process.env.LISTING_AUTO_APPROVE === 'true' ? 'approved' : 'pending',
    approved_at: process.env.LISTING_AUTO_APPROVE === 'true' ? new Date().toISOString() : null,
    featured: false, verified: false, views: 0,
  });
  if (!owner.is_host) await db.update('users', owner.id, { is_host: true });
  return { property: row };
}

export async function updateProperty(prop, input, { byAdmin = false, actorId } = {}) {
  const existing = new Set((prop.images || []).map((i) => i.path));
  const allowImage = (p) => existing.has(p) || p.startsWith(`properties/${prop.owner_id}/`) || (actorId && p.startsWith(`properties/${actorId}/`));
  const clean = cleanProperty({ ...prop, ...input }, allowImage);
  const errors = validateProperty(clean);
  if (errors.length) return { errors };
  const patch = { ...clean };
  // An owner editing an approved listing keeps it live; a rejected one goes back to review.
  if (!byAdmin && prop.status === 'rejected') patch.status = 'pending';
  const property = await db.update('properties', prop.id, patch);
  // Only after a successful save: delete stored photos the edit removed.
  const kept = new Set(property.images.map((i) => i.path));
  for (const p of existing) if (!kept.has(p)) await storage.remove(p);
  return { property };
}

export const PUBLIC_STATUSES = ['approved', 'rented'];

export async function searchProperties(f = {}, { limit = 24, offset = 0 } = {}) {
  const query = { eq: { status: 'approved' }, gte: {}, lte: {}, order: ['created_at', false] };
  if (f.city && cityBySlug(f.city)) query.eq.city = f.city;
  if (f.type && typeByValue(f.type)) query.eq.listing_type = f.type;
  if (f.tenant && f.tenant !== 'any') query.in = { tenant_pref: [f.tenant, 'any'] };
  if (f.furnishing) query.eq.furnishing = f.furnishing;
  if (f.bhk) query.eq.bhk = f.bhk;
  if (f.min) query.gte.rent = clampInt(f.min);
  if (f.max) query.lte.rent = clampInt(f.max);
  if (f.locality) query.eq.locality = f.locality;
  if (f.q) query.search = { cols: ['title', 'locality', 'landmark', 'description'], term: str(f.q, 60) };
  if (f.sort === 'rent_asc') query.order = ['rent', true];
  if (f.sort === 'rent_desc') query.order = ['rent', false];
  const [rows, total] = await Promise.all([db.find('properties', { ...query, limit, offset }), db.count('properties', query)]);
  // Featured listings float to the top of the current page.
  rows.sort((a, b) => Number(b.featured) - Number(a.featured));
  return { rows, total };
}

/** Live rent numbers per city, used on city pages (AEO: answer-first facts). */
export async function rentStats(city, type) {
  const eq = { status: 'approved' };
  if (city) eq.city = city;
  if (type) eq.listing_type = type;
  const rows = await db.find('properties', { eq, limit: 1000 });
  if (!rows.length) return null;
  const rents = rows.map((r) => r.rent).filter(Boolean).sort((a, b) => a - b);
  const median = rents[Math.floor(rents.length / 2)];
  const byType = {};
  for (const r of rows) (byType[r.listing_type] ||= []).push(r.rent);
  const typeMedians = Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, v.sort((a, b) => a - b)[Math.floor(v.length / 2)]]));
  const localities = {};
  for (const r of rows) if (r.locality) localities[r.locality] = (localities[r.locality] || 0) + 1;
  return {
    count: rows.length, min: rents[0], max: rents[rents.length - 1], median, typeMedians,
    topLocalities: Object.entries(localities).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, n]) => ({ name, n })),
  };
}

export async function ownerOf(prop) {
  return prop ? db.get('users', prop.owner_id) : null;
}

export const isPublic = (p) => p && PUBLIC_STATUSES.includes(p.status);

export function propertyHeadline(p) {
  const t = typeByValue(p.listing_type);
  const c = cityBySlug(p.city);
  const what = p.listing_type === 'flat' ? `${p.bhk || ''} flat` : p.listing_type === 'flatmate' ? 'Flatmate wanted' : t.label;
  return `${what.trim()} in ${p.locality ? p.locality + ', ' : ''}${c?.name || ''}`;
}

export { CITIES, LISTING_TYPES };
