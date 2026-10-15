import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';
import { cleanBlog } from '@/lib/blog';

export async function POST(req) {
  return withUser(req, async () => {
    const b = cleanBlog(await body(req));
    if (b.title.length < 5) return fail('Add a title.');
    if (await db.getBy('blogs', 'slug', b.slug)) return fail('Another post already uses this URL slug.');
    const row = await db.insert('blogs', { ...b, published_at: b.status === 'published' ? new Date().toISOString() : null });
    return json({ ok: true, blog: row });
  }, { admin: true });
}
