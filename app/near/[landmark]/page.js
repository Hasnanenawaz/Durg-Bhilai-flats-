import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import PropertyCard from '@/components/PropertyCard';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { db } from '@/lib/db';
import { landmarkBySlug, cityBySlug, LANDMARKS } from '@/lib/locations';
import { rupees, abs } from '@/lib/site';

const KIND = { college: 'students', workplace: 'employees', hospital: 'doctors, nurses and patients’ families', transit: 'people who travel often' };

async function nearby(l) {
  const [byLocality, byText] = await Promise.all([
    db.find('properties', { eq: { status: 'approved' }, in: { locality: l.localities }, order: ['created_at', false], limit: 40 }),
    db.find('properties', { eq: { status: 'approved' }, search: { cols: ['landmark', 'title', 'description'], term: l.name.split(',')[0] }, order: ['created_at', false], limit: 40 }),
  ]);
  const seen = new Set();
  return [...byText, ...byLocality].filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
}

export async function generateMetadata({ params }) {
  const { landmark } = await params;
  const l = landmarkBySlug(landmark);
  if (!l) return {};
  return {
    title: `PG, Rooms & Flats near ${l.name} – No Brokerage`,
    description: `Find PGs, rooms and flats on rent near ${l.name} in ${cityBySlug(l.city).name}. Listings in ${l.localities.join(', ')}. Call owners directly, zero brokerage.`,
    alternates: { canonical: `/near/${l.slug}` },
  };
}

export default async function NearPage({ params }) {
  const { landmark } = await params;
  const l = landmarkBySlug(landmark);
  if (!l) notFound();
  const c = cityBySlug(l.city);
  const rows = await nearby(l);
  const rents = rows.map((r) => r.rent).sort((a, b) => a - b);
  const faq = [
    { q: `Which areas are close to ${l.name}?`, a: `People renting near ${l.name} usually look in ${l.localities.join(', ')}. These areas keep daily travel short.` },
    { q: `How do I find a PG near ${l.name} without a broker?`, a: `Open a listing on this page, log in with your phone number (OTP) and tap “Show owner’s number”. You speak to the owner directly and pay no brokerage.` },
    ...(rents.length ? [{ q: `What is the rent near ${l.name}?`, a: `Listings near ${l.name} currently range from ${rupees(rents[0])} to ${rupees(rents[rents.length - 1])} per month, based on ${rents.length} live listing${rents.length > 1 ? 's' : ''}.` }] : []),
  ];
  return (
    <div className="wrap" style={{ paddingBottom: 48 }}>
      <Breadcrumbs items={[{ name: c.name, href: `/rent/${c.slug}` }, { name: `Near ${l.name}`, href: `/near/${l.slug}` }]} />
      <header style={{ padding: '24px 0' }}>
        <span className="eyebrow">{c.name} · Chhattisgarh</span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>PG, rooms & flats near {l.name}</h1>
        <div className="answer"><p>
          {rows.length ? <>We have <b>{rows.length}</b> owner-listed place{rows.length > 1 ? 's' : ''} near {l.name}, from <b>{rupees(rents[0])}</b> a month. </> : <>Owners near {l.name} list rooms here for free. </>}
          Most {KIND[l.kind] || 'people'} rent in {l.localities.join(', ')}. Contact owners directly, with no brokerage.
        </p></div>
      </header>
      {rows.length ? <div className="listings cols-2">{rows.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
        : <div className="empty"><h3>No listings near {l.name} yet</h3><p>See everything in {c.name}, or check back soon.</p><Link className="btn btn-primary btn-sm" href={`/rent/${c.slug}`}>Places in {c.name}</Link></div>}
      <section className="section">
        <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Other places people search near</h2>
            <div className="taglinks">{LANDMARKS.filter((x) => x.slug !== l.slug).map((x) => <Link key={x.slug} href={`/near/${x.slug}`}>{x.name}</Link>)}</div>
          </div>
          <div><h2 style={{ fontSize: '1.3rem' }}>Quick answers</h2><Faq items={faq} /></div>
        </div>
      </section>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: `Rentals near ${l.name}`, url: abs(`/near/${l.slug}`), about: { '@type': l.kind === 'college' ? 'CollegeOrUniversity' : 'Place', name: l.name, address: { '@type': 'PostalAddress', addressLocality: c.name, addressRegion: 'Chhattisgarh', addressCountry: 'IN' } } }} />
    </div>
  );
}
