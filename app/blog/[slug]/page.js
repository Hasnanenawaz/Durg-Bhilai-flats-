import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import PropertyCard from '@/components/PropertyCard';
import { renderMarkdown, headingsOf, readingMinutes } from '@/lib/blog';
import { cityBySlug } from '@/lib/locations';
import { abs, shortDate, SITE_NAME } from '@/lib/site';
import { getCurrentUser } from '@/lib/auth';

export const revalidate = 600;

async function load(slug) {
  return db.getBy('blogs', 'slug', slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const b = await load(slug);
  if (!b || b.status !== 'published') return { title: 'Post not found', robots: { index: false } };
  const title = b.seo_title || b.title;
  const description = b.seo_description || b.excerpt;
  return {
    title, description,
    alternates: { canonical: `/blog/${b.slug}` },
    openGraph: { type: 'article', title, description, url: abs(`/blog/${b.slug}`), publishedTime: b.published_at, modifiedTime: b.updated_at, images: b.cover_image ? [{ url: b.cover_image }] : undefined },
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const b = await load(slug);
  if (!b) notFound();
  if (b.status !== 'published') {
    const u = await getCurrentUser();
    if (!u?.is_admin) notFound();
  }
  const city = cityBySlug(b.city);
  const toc = headingsOf(b.content);
  const listings = await db.find('properties', { eq: { status: 'approved', ...(city ? { city: city.slug } : {}) }, order: ['created_at', false], limit: 4 });
  const ld = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    headline: b.title, description: b.excerpt, datePublished: b.published_at, dateModified: b.updated_at,
    author: { '@type': 'Organization', name: b.author || SITE_NAME }, publisher: { '@id': abs('/#org') },
    mainEntityOfPage: abs(`/blog/${b.slug}`), inLanguage: 'en-IN', keywords: (b.tags || []).join(', '),
    ...(b.cover_image ? { image: b.cover_image } : {}),
    ...(city ? { about: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: 'Chhattisgarh' } } } : {}),
  };
  return (
    <div className="wrap" style={{ paddingBottom: 64 }}>
      {b.status !== 'published' && <p className="notice notice-warn" style={{ marginTop: 20 }}>Draft preview, only admins can see this.</p>}
      <Breadcrumbs items={[{ name: 'Blog', href: '/blog' }, { name: b.title, href: `/blog/${b.slug}` }]} />
      <article style={{ marginTop: 24 }}>
        <header style={{ maxWidth: '70ch' }}>
          {b.tags?.[0] && <span className="eyebrow">{b.tags[0]}</span>}
          <h1 style={{ fontSize: 'clamp(1.9rem, 4.2vw, 2.8rem)' }}>{b.title}</h1>
          <p className="small muted">{b.author} · <time dateTime={b.published_at}>{shortDate(b.published_at)}</time> · {readingMinutes(b.content)} min read{b.updated_at && b.published_at && new Date(b.updated_at) - new Date(b.published_at) > 864e5 ? ` · Updated ${shortDate(b.updated_at)}` : ''}</p>
        </header>
        {b.cover_image && /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.cover_image} alt="" style={{ borderRadius: 'var(--radius)', margin: '20px 0', maxHeight: 420, width: '100%', objectFit: 'cover', maxWidth: '70ch' }} />}
        {toc.length > 2 && (
          <nav className="toc" aria-label="In this post" style={{ margin: '20px 0' }}>
            <b className="small">In this post</b>
            <ol>{toc.map((h) => <li key={h.id}><a href={`#${h.id}`}>{h.text}</a></li>)}</ol>
          </nav>
        )}
        <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(b.content) }} />
        {b.faq?.length > 0 && (
          <section style={{ maxWidth: '70ch', marginTop: 40 }}>
            <h2>Frequently asked questions</h2>
            <Faq items={b.faq} />
          </section>
        )}
      </article>
      <div className="cta-band" style={{ marginTop: 48 }}>
        <div><h2>Looking for a place{city ? ` in ${city.name}` : ''}?</h2><p>Owner-listed flats, PGs and rooms. Call directly. ₹0 brokerage.</p></div>
        <Link className="btn btn-primary btn-lg" href={city ? `/rent/${city.slug}` : '/search'}>Find a place</Link>
      </div>
      {listings.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: '1.3rem' }}>Latest listings{city ? ` in ${city.name}` : ''}</h2>
          <div className="listings cols-2">{listings.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        </section>
      )}
      <JsonLd data={ld} />
    </div>
  );
}
