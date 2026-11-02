import { db } from '@/lib/db';
import { isPublic } from '@/lib/models';
import { cityBySlug, typeByValue } from '@/lib/locations';
import { rupees } from '@/lib/site';
import { ogCard, photoData, clip, OG_SIZE, TYPE_TONE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Listing on Durg Bhilai Flats & Flatmates';

export default async function OG({ params }) {
  const { slug } = await params;
  const p = await db.getBy('properties', 'slug', slug);
  // Never put details of pending or hidden listings into a public image.
  if (!p || !isPublic(p)) return ogCard({ title: 'Flats, PGs & rooms on rent', accent: 'Zero brokerage.', footer: ['Durg · Bhilai · Chhattisgarh'] });
  return ogCard({
    eyebrow: `${typeByValue(p.listing_type)?.label || 'Listing'} · ${cityBySlug(p.city)?.name || ''}`,
    tone: TYPE_TONE[p.listing_type],
    title: clip(p.title, 80),
    accent: `${rupees(p.rent)}/month`,
    footer: [p.locality, p.bhk, p.furnishing, 'No brokerage'],
    photo: await photoData(p.images?.[0]?.url),
  });
}
