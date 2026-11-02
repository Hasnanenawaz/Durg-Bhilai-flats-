import { db } from '@/lib/db';
import { CITIES, LISTING_TYPES, LANDMARKS } from '@/lib/locations';
import { abs } from '@/lib/site';

export const revalidate = 3600;

// Split sitemaps so Search Console reports indexing per section. The index lives at /sitemap.xml (app/sitemap.xml/route.js).
export const SITEMAP_IDS = ['pages', 'listings', 'blog'];

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

const absImage = (u) => (u?.startsWith('http') ? u : abs(u));

export default async function sitemap({ id }) {
  if (id === 'listings') {
    const props = await db.find('properties', { eq: { status: 'approved' }, order: ['updated_at', false], limit: 45000 });
    return props.map((p) => ({
      url: abs(`/property/${p.slug}`),
      lastModified: new Date(p.updated_at || p.created_at),
      changeFrequency: 'weekly',
      priority: 0.6,
      ...(p.images?.length ? { images: p.images.map((i) => absImage(i.url)) } : {}),
    }));
  }
  if (id === 'blog') {
    const posts = await db.find('blogs', { eq: { status: 'published' }, limit: 5000 });
    return [
      { url: abs('/blog'), lastModified: posts.length ? new Date(Math.max(...posts.map((b) => new Date(b.updated_at || b.published_at)))) : undefined, changeFrequency: 'weekly', priority: 0.6 },
      ...posts.map((b) => ({
        url: abs(`/blog/${b.slug}`),
        lastModified: new Date(b.updated_at || b.published_at),
        changeFrequency: 'monthly',
        priority: 0.6,
        ...(b.cover_image ? { images: [absImage(b.cover_image)] } : {}),
      })),
    ];
  }
  const now = new Date();
  const fixed = [
    { url: abs('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: abs('/list-your-property'), changeFrequency: 'monthly', priority: 0.7 },
    { url: abs('/about'), changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/faq'), changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/privacy'), changeFrequency: 'yearly', priority: 0.2 },
    { url: abs('/terms'), changeFrequency: 'yearly', priority: 0.2 },
  ];
  const cities = CITIES.flatMap((c) => [
    { url: abs(`/rent/${c.slug}`), lastModified: now, changeFrequency: 'daily', priority: c.primary ? 0.9 : 0.7 },
    ...LISTING_TYPES.map((t) => ({ url: abs(`/rent/${c.slug}/${t.slug}`), lastModified: now, changeFrequency: 'daily', priority: c.primary ? 0.8 : 0.6 })),
  ]);
  const landmarks = LANDMARKS.map((l) => ({ url: abs(`/near/${l.slug}`), changeFrequency: 'weekly', priority: 0.7 }));
  return [...fixed, ...cities, ...landmarks];
}
