import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';

const REASONS = ['Already rented', 'Broker posing as owner', 'Wrong details or photos', 'Asked for advance payment', 'Other'];

export async function POST(req) {
  return withUser(req, async (user) => {
    const b = await body(req);
    if (!REASONS.includes(b.reason)) return fail('Pick a reason.');
    if (!(await db.get('properties', b.propertyId))) return fail('Listing not found.', 404);
    await db.insert('reports', { property_id: b.propertyId, user_id: user.id, reason: b.reason, details: String(b.details || '').slice(0, 500), resolved: false });
    return json({ ok: true });
  });
}
