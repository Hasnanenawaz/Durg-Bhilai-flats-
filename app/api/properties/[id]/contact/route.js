import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';
import { isPublic, propertyHeadline } from '@/lib/models';

// Reveals the owner's number to a logged-in guest and logs the inquiry,
// so the owner and the admin both know who reached out.
export async function POST(req, { params }) {
  const { id } = await params;
  return withUser(req, async (user) => {
    const p = await db.get('properties', id);
    if (!p || !isPublic(p)) return fail('Listing not found.', 404);
    const b = await body(req);
    const recent = await db.find('inquiries', { eq: { property_id: p.id, guest_id: user.id }, limit: 1 });
    if (!recent.length && p.owner_id !== user.id) {
      await db.insert('inquiries', {
        property_id: p.id, guest_id: user.id, owner_id: p.owner_id,
        guest_name: user.name, guest_phone: user.phone,
        property_title: p.title || propertyHeadline(p), message: String(b.message || '').slice(0, 500) || null,
      });
    }
    return json({ ok: true, name: p.contact_name, phone: p.contact_phone, whatsapp: p.whatsapp || p.contact_phone });
  });
}
