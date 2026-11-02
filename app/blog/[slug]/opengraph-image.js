import { db } from '@/lib/db';
import { ogCard, photoData, clip, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Renting guide from Durg Bhilai Flats & Flatmates';

export default async function OG({ params }) {
  const { slug } = await params;
  const b = await db.getBy('blogs', 'slug', slug);
  if (!b || b.status !== 'published') return ogCard({ eyebrow: 'Guides', title: 'Renting guides for Durg, Bhilai & Chhattisgarh', footer: ['Zero brokerage'] });
  return ogCard({
    eyebrow: 'Renting guide',
    title: clip(b.title, 90),
    footer: [b.author, 'Durg · Bhilai · Chhattisgarh'],
    photo: await photoData(b.cover_image),
  });
}
