import { json, withUser, body } from '@/lib/api';
import { db } from '@/lib/db';
export async function PATCH(req, { params }) {
  const { id } = await params;
  return withUser(req, async () => json({ ok: true, report: await db.update('reports', id, { resolved: Boolean((await body(req)).resolved) }) }), { admin: true });
}
