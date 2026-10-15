import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';

const STATUSES = ['pending', 'approved', 'hidden', 'rented', 'rejected'];

export async function PATCH(req, { params }) {
  const { id } = await params;
  return withUser(req, async () => {
    const p = await db.get('properties', id);
    if (!p) return fail('Listing not found.', 404);
    const b = await body(req);
    const patch = {};
    if (STATUSES.includes(b.status)) {
      patch.status = b.status;
      // A listing hidden by an admin stays down until an admin brings it back; the owner can't relist it.
      patch.admin_hidden = b.status === 'hidden';
      if (b.status === 'approved' && !p.approved_at) patch.approved_at = new Date().toISOString();
    }
    if ('featured' in b) patch.featured = Boolean(b.featured);
    if ('verified' in b) patch.verified = Boolean(b.verified);
    return json({ ok: true, property: await db.update('properties', id, patch) });
  }, { admin: true });
}
