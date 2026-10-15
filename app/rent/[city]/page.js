import { notFound } from 'next/navigation';
import CityPage from '@/components/seo/CityPage';
import { cityBySlug } from '@/lib/locations';

export async function generateMetadata({ params, searchParams }) {
  const { city: slug } = await params;
  const sp = await searchParams;
  const c = cityBySlug(slug);
  if (!c) return {};
  const filtered = Object.keys(sp).some((k) => k !== 'page');
  return {
    title: `Flats, PG & Rooms on Rent in ${c.name} – No Brokerage`,
    description: `Find flats, PGs, rooms and flatmates on rent in ${c.name}, Chhattisgarh. Listings come straight from owners: call them directly and pay ₹0 brokerage.`,
    alternates: { canonical: `/rent/${c.slug}` },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ params, searchParams }) {
  const { city: slug } = await params;
  const c = cityBySlug(slug);
  if (!c) notFound();
  return <CityPage city={c} sp={await searchParams} />;
}
