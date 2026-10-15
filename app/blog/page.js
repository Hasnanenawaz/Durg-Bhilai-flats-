import Link from 'next/link';
import { db } from '@/lib/db';
import { shortDate } from '@/lib/site';
import { readingMinutes } from '@/lib/blog';

export const revalidate = 600;
export const metadata = {
  title: 'Renting Guides for Durg, Bhilai & Chhattisgarh',
  description: 'Practical guides on finding flats, PGs, rooms and flatmates in Durg, Bhilai, Raipur and across Chhattisgarh, without paying a broker.',
  alternates: { canonical: '/blog' },
};

export default async function Blog({ searchParams }) {
  const sp = await searchParams;
  let posts = await db.find('blogs', { eq: { status: 'published' }, order: ['published_at', false], limit: 200 });
  const tags = [...new Set(posts.flatMap((p) => p.tags || []))].slice(0, 12);
  if (sp.tag) posts = posts.filter((p) => (p.tags || []).includes(sp.tag));
  return (
    <div className="wrap section">
      <span className="eyebrow">Blog</span>
      <h1>Renting guides for Chhattisgarh</h1>
      <p className="lead">Straight answers about rent, areas, deposits and flatmates in Durg-Bhilai, written by people who live here.</p>
      {tags.length > 0 && (
        <div className="taglinks" style={{ margin: '20px 0 28px' }}>
          <Link href="/blog" style={sp.tag ? undefined : { borderColor: 'var(--accent)', color: 'var(--accent)' }}>All</Link>
          {tags.map((t) => <Link key={t} href={`/blog?tag=${encodeURIComponent(t)}`} style={sp.tag === t ? { borderColor: 'var(--accent)', color: 'var(--accent)' } : undefined}>{t}</Link>)}
        </div>
      )}
      <div className="posts">
        {posts.map((b) => (
          <Link key={b.id} href={`/blog/${b.slug}`} className="post-row">
            <span className="small muted">{shortDate(b.published_at)}<br />{readingMinutes(b.content)} min read</span>
            <div><h2>{b.title}</h2><p className="muted" style={{ margin: 0 }}>{b.excerpt}</p></div>
          </Link>
        ))}
      </div>
      {!posts.length && <div className="empty"><h3>No posts yet</h3><p>Guides are on the way.</p></div>}
    </div>
  );
}
