import Link from 'next/link';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/site';

export default async function AdminBlog() {
  const posts = await db.find('blogs', { order: ['updated_at', false], limit: 500 });
  return (
    <>
      <div className="dash-head"><div><span className="eyebrow">Blog</span><h1>Posts</h1></div><Link className="btn btn-primary" href="/admin/blog/new">+ New post</Link></div>
      <div className="panel">
        {posts.map((p) => (
          <div key={p.id} className="hrow">
            <div><Link href={`/admin/blog/${p.id}`} style={{ fontWeight: 600 }}>{p.title}</Link><div className="xs muted">/blog/{p.slug}</div></div>
            <span className={`badge ${p.status === 'published' ? 'badge-green' : ''}`}>{p.status}</span>
            <span className="xs muted">{p.published_at ? `Published ${shortDate(p.published_at)}` : `Edited ${shortDate(p.updated_at)}`}</span>
          </div>
        ))}
        {!posts.length && <div className="panel-body muted small">No posts yet. Write your first renting guide.</div>}
      </div>
    </>
  );
}
