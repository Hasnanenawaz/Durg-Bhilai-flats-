import { cityBySlug, typeBySlug } from '@/lib/locations';
import { ogCard, OG_SIZE, TYPE_TONE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Owner-listed rentals, zero brokerage';

export default async function OG({ params }) {
  const { city, type } = await params;
  const c = cityBySlug(city);
  const t = typeBySlug(type);
  const name = c?.name || 'Chhattisgarh';
  return ogCard({
    eyebrow: `${name} · Chhattisgarh`,
    tone: TYPE_TONE[t?.value],
    title: t?.slug === 'flatmates' ? `Find flatmates in ${name}` : `${t?.plural || 'Rentals'} on rent in ${name}`,
    accent: 'Call the owner. No broker.',
    footer: c?.localities.slice(0, 4),
  });
}
