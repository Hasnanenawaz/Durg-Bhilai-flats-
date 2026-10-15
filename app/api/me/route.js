import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';
import { cleanProfile } from '@/lib/models';

export async function PATCH(req) {
  return withUser(req, async (user) => {
    const patch = cleanProfile(await body(req));
    if ('name' in patch && !patch.name) return fail('Please enter your name.');
    if (patch.active_mode === 'host' && !user.is_host) patch.is_host = true;
    const u = await db.update('users', user.id, patch);
    return json({ ok: true, user: { name: u.name, active_mode: u.active_mode } });
  });
}
