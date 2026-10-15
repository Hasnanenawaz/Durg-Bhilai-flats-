import { notFound } from 'next/navigation';
import CityPage from '@/components/seo/CityPage';
import { cityBySlug, typeBySlug } from '@/lib/locations';

const COPY = {
  flats: (c) => [`Flats on Rent in ${c} – 1, 2 & 3 BHK, No Brokerage`, `1 BHK, 2 BHK and 3 BHK flats for rent in ${c}, listed by owners. Compare rent and deposit, then call the owner directly. Zero brokerage.`],
  pg: (c) => [`PG in ${c} for Boys & Girls – With Food, No Brokerage`, `PG accommodation in ${c} for students and working professionals, with or without food. Owner-listed, call directly, no brokerage.`],
  rooms: (c) => [`Single Rooms on Rent in ${c} – No Brokerage`, `Single and shared rooms for rent in ${c} for students, bachelors and working people. Contact owners directly, zero brokerage.`],
  flatmates: (c) => [`Find Flatmates & Roommates in ${c}`, `Looking for a flatmate or a shared flat in ${c}? See "flatmate wanted" posts from people already renting and contact them directly.`],
};

export async function generateMetadata({ params, searchParams }) {
  const { city, type } = await params;
  const sp = await searchParams;
  const c = cityBySlug(city);
  const t = typeBySlug(type);
  if (!c || !t) return {};
  const [title, description] = COPY[t.slug](c.name);
  return {
    title, description,
    alternates: { canonical: `/rent/${c.slug}/${t.slug}` },
    robots: Object.keys(sp).some((k) => k !== 'page') ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ params, searchParams }) {
  const { city, type } = await params;
  const c = cityBySlug(city);
  const t = typeBySlug(type);
  if (!c || !t) notFound();
  return <CityPage city={c} type={t} sp={await searchParams} />;
}
