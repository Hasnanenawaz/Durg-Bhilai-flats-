import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';

export async function POST(req) {
  return withUser(req, async (user) => {
    const { propertyId } = await body(req);
    if (!propertyId || !(await db.get('properties', propertyId))) return fail('Listing not found.', 404);
    const [existing] = await db.find('favorites', { eq: { user_id: user.id, property_id: propertyId }, limit: 1 });
    if (existing) {
      await db.remove('favorites', existing.id);
      return json({ ok: true, saved: false });
    }
    await db.insert('favorites', { user_id: user.id, property_id: propertyId });
    return json({ ok: true, saved: true });
  });
}
