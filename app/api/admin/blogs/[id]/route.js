import { json, fail, body, withUser } from '@/lib/api';
import { db } from '@/lib/db';
import { cleanBlog } from '@/lib/blog';
import { revalidatePath } from 'next/cache';

export async function PATCH(req, { params }) {
  const { id } = await params;
  return withUser(req, async () => {
    const cur = await db.get('blogs', id);
    if (!cur) return fail('Post not found.', 404);
    const b = cleanBlog({ ...cur, ...(await body(req)) });
    if (b.title.length < 5) return fail('Add a title.');
    const clash = await db.getBy('blogs', 'slug', b.slug);
    if (clash && clash.id !== id) return fail('Another post already uses this URL slug.');
    const published_at = b.status === 'published' ? cur.published_at || new Date().toISOString() : cur.published_at;
    const row = await db.update('blogs', id, { ...b, published_at });
    revalidatePath('/blog'); revalidatePath(`/blog/${row.slug}`);
    return json({ ok: true, blog: row });
  }, { admin: true });
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  return withUser(req, async () => {
    await db.remove('blogs', id);
    revalidatePath('/blog');
    return json({ ok: true });
  }, { admin: true });
}
