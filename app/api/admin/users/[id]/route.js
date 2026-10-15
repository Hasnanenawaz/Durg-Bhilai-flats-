import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';

const STATUSES = ['new', 'called', 'interested', 'not_interested', 'converted'];

export async function PATCH(req, { params }) {
  const { id } = await params;
  return withUser(req, async (admin) => {
    const u = await db.get('users', id);
    if (!u) return fail('User not found.', 404);
    const b = await body(req);
    const patch = {};
    if (STATUSES.includes(b.lead_status)) patch.lead_status = b.lead_status;
    if ('admin_notes' in b) patch.admin_notes = String(b.admin_notes || '').slice(0, 2000);
    if ('is_blocked' in b) {
      if (u.id === admin.id) return fail("You can't block yourself.");
      patch.is_blocked = Boolean(b.is_blocked);
    }
    return json({ ok: true, user: await db.update('users', id, patch) });
  }, { admin: true });
}
