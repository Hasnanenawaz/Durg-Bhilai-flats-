import { cityBySlug } from '@/lib/locations';
import { ogCard, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Flats, PGs and rooms on rent, zero brokerage';

export default async function OG({ params }) {
  const { city } = await params;
  const c = cityBySlug(city);
  return ogCard({
    eyebrow: c ? `${c.name} · Chhattisgarh` : 'Chhattisgarh',
    title: `Flats, PGs & rooms on rent in ${c?.name || 'Chhattisgarh'}`,
    accent: 'Call the owner. No broker.',
    footer: c?.localities.slice(0, 4),
  });
}
