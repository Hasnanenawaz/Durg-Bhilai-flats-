import { json, fail, body, withUser } from '@/lib/api';
import { db, storage } from '@/lib/db';
import { updateProperty } from '@/lib/models';

async function owned(user, id) {
  const p = await db.get('properties', id);
  if (!p) return null;
  return p.owner_id === user.id || user.is_admin ? p : null;
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  return withUser(req, async (user) => {
    const p = await owned(user, id);
    if (!p) return fail('Listing not found.', 404);
    const b = await body(req);
    // Quick status actions from the host dashboard.
    if (b.action) {
      if (p.status === 'rejected' && !user.is_admin) return fail('This listing was rejected. Edit it to send it for review again.');
      if (p.admin_hidden && !user.is_admin) return fail('Our team has hidden this listing. Contact us to get it back online.');
      // Relisting goes straight live only if an admin approved it before.
      const relisted = p.approved_at || process.env.LISTING_AUTO_APPROVE === 'true' ? 'approved' : 'pending';
      const map = { rented: 'rented', hide: 'hidden', relist: relisted };
      if (!map[b.action]) return fail('Unknown action.');
      if (b.action !== 'relist' && p.status === 'pending') return fail('This listing is still under review.');
      const next = await db.update('properties', p.id, { status: map[b.action] });
      return json({ ok: true, property: next });
    }
    // updateProperty validates photo paths and deletes removed photos only after the save succeeds.
    const r = await updateProperty(p, b, { byAdmin: user.is_admin, actorId: user.id });
    if (r.errors) return fail(r.errors.join(' '));
    return json({ ok: true, property: r.property });
  });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  return withUser(req, async (user) => {
    const p = await owned(user, id);
    if (!p) return fail('Listing not found.', 404);
    for (const img of p.images || []) await storage.remove(img.path);
    await db.remove('properties', p.id);
    return json({ ok: true });
  });
}
