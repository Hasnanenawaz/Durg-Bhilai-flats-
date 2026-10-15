import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import BlogEditor from '@/components/admin/BlogEditor';
export default async function EditPost({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const post = await db.get('blogs', id);
  if (!post) notFound();
  return (<><div className="dash-head"><div><span className="eyebrow">Blog</span><h1>Edit post</h1></div></div>{sp.created && <p className="notice notice-ok" style={{ marginBottom: 16 }}>Post created.</p>}<BlogEditor initial={post} /></>);
}
