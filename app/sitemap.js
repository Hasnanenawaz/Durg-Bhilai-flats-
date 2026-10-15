import { db } from '@/lib/db';
import { CITIES, LISTING_TYPES, LANDMARKS } from '@/lib/locations';
import { abs } from '@/lib/site';

export const revalidate = 3600;

export default async function sitemap() {
  const [props, posts] = await Promise.all([
    db.find('properties', { eq: { status: 'approved' }, order: ['updated_at', false], limit: 45000 }),
    db.find('blogs', { eq: { status: 'published' }, limit: 5000 }),
  ]);
  const now = new Date();
  const fixed = ['/', '/list-your-property', '/blog', '/about', '/faq'].map((p) => ({ url: abs(p), lastModified: now, changeFrequency: 'daily', priority: p === '/' ? 1 : 0.6 }));
  const cities = CITIES.flatMap((c) => [
    { url: abs(`/rent/${c.slug}`), lastModified: now, changeFrequency: 'daily', priority: c.primary ? 0.9 : 0.7 },
    ...LISTING_TYPES.map((t) => ({ url: abs(`/rent/${c.slug}/${t.slug}`), lastModified: now, changeFrequency: 'daily', priority: c.primary ? 0.8 : 0.6 })),
  ]);
  const landmarks = LANDMARKS.map((l) => ({ url: abs(`/near/${l.slug}`), lastModified: now, changeFrequency: 'weekly', priority: 0.7 }));
  const listings = props.map((p) => ({ url: abs(`/property/${p.slug}`), lastModified: new Date(p.updated_at || p.created_at), changeFrequency: 'weekly', priority: 0.6 }));
  const blog = posts.map((b) => ({ url: abs(`/blog/${b.slug}`), lastModified: new Date(b.updated_at || b.published_at), changeFrequency: 'monthly', priority: 0.6 }));
  return [...fixed, ...cities, ...landmarks, ...listings, ...blog];
}
