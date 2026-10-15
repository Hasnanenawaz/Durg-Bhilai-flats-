import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';
import { createProperty } from '@/lib/models';

export async function POST(req) {
  return withUser(req, async (user) => {
    const open = await db.count('properties', { eq: { owner_id: user.id }, in: { status: ['pending', 'approved'] } });
    if (open >= 25 && !user.is_admin) return fail('You have reached 25 active listings. Contact us to add more.');
    const r = await createProperty(user, await body(req));
    if (r.errors) return fail(r.errors.join(' '));
    if (user.active_mode !== 'host') await db.update('users', user.id, { active_mode: 'host' });
    return json({ ok: true, property: r.property });
  });
}
