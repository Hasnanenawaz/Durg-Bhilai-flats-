import { landmarkBySlug, cityBySlug } from '@/lib/locations';
import { ogCard, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'PGs, rooms and flats near colleges and workplaces, zero brokerage';

export default async function OG({ params }) {
  const { landmark } = await params;
  const l = landmarkBySlug(landmark);
  return ogCard({
    eyebrow: l ? cityBySlug(l.city)?.name : 'Chhattisgarh',
    title: `PGs, rooms & flats near ${l?.name || 'your college'}`,
    accent: 'Call the owner. No broker.',
    footer: l?.localities,
  });
}
