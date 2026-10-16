import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import Tabs from '@/components/ui/Tabs';
import Scene from '@/components/art/Scene';
import PropertyCard, { headline } from '@/components/PropertyCard';
import ContactOwner from '@/components/listing/ContactOwner';
import SaveButton from '@/components/listing/SaveButton';
import ReportButton from '@/components/listing/ReportButton';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { isPublic } from '@/lib/models';
import { cityBySlug, typeByValue, tenantLabel } from '@/lib/locations';
import { rupees, shortDate, abs, relTime } from '@/lib/site';

async function load(slug) {
  return db.getBy('properties', 'slug', slug);
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await load(slug);
  if (!p || !isPublic(p)) return { title: 'Listing not found', robots: { index: false } };
  const c = cityBySlug(p.city);
  const t = `${headline(p)} for rent in ${p.locality}, ${c.name} – ${rupees(p.rent)}/month`;
  const d = `${headline(p)} in ${p.locality}, ${c.name}${p.furnishing ? `, ${p.furnishing.toLowerCase()}` : ''}${p.tenant_pref !== 'any' ? `, for ${tenantLabel(p.tenant_pref).toLowerCase()}` : ''}. Rent ${rupees(p.rent)}/month${p.deposit ? `, deposit ${rupees(p.deposit)}` : ''}. Contact the owner directly. No brokerage.`;
  return {
    title: t,
    description: d,
    alternates: { canonical: `/property/${p.slug}` },
    openGraph: { title: t, description: d, url: abs(`/property/${p.slug}`), images: p.images?.[0]?.url ? [{ url: p.images[0].url }] : undefined },
    robots: p.status === 'rented' ? { index: false, follow: true } : undefined,
  };
}

export default async function PropertyPage({ params }) {
  const { slug } = await params;
  const [p, user] = await Promise.all([load(slug), getCurrentUser()]);
  if (!p) notFound();
  const mine = user && (user.id === p.owner_id || user.is_admin);
  if (!isPublic(p) && !mine) notFound();

  if (!mine) db.update('properties', p.id, { views: (p.views || 0) + 1 }).catch(() => {});

  const c = cityBySlug(p.city);
  const near = p.landmark ? p.landmark.replace(/^near\s+/i, '') : '';
  const t = typeByValue(p.listing_type);
  const [fav] = user ? await db.find('favorites', { eq: { user_id: user.id, property_id: p.id }, limit: 1 }) : [];
  const similar = (await db.find('properties', { eq: { status: 'approved', city: p.city, listing_type: p.listing_type }, order: ['created_at', false], limit: 5 })).filter((x) => x.id !== p.id).slice(0, 4);
  const mapQuery = p.lat && p.lng ? `${p.lat},${p.lng}` : `${p.landmark ? p.landmark + ', ' : ''}${p.locality}, ${c.name}, Chhattisgarh`;

  const facts = [
    ['Monthly rent', rupees(p.rent)],
    ['Deposit', p.deposit ? rupees(p.deposit) : 'Ask owner'],
    p.maintenance ? ['Maintenance', `${rupees(p.maintenance)}/mo`] : null,
    ['Type', p.listing_type === 'flat' ? `${p.bhk || ''} Flat`.trim() : t.label + (p.bhk ? ` · ${p.bhk}` : '')],
    ['Furnishing', p.furnishing || '—'],
    ['Preferred tenant', tenantLabel(p.tenant_pref)],
    ['Available from', p.available_from ? shortDate(p.available_from) : 'Now'],
    p.listing_type === 'pg' || p.food_included ? ['Food', p.food_included ? 'Included' : 'Not included'] : null,
    ['Listed', relTime(p.created_at)],
  ].filter(Boolean);

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: p.title || headline(p),
    url: abs(`/property/${p.slug}`),
    price: p.rent,
    priceCurrency: 'INR',
    priceSpecification: { '@type': 'UnitPriceSpecification', price: p.rent, priceCurrency: 'INR', unitText: 'MONTH', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
    availability: p.status === 'rented' ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    businessFunction: 'http://purl.org/goodrelations/v1#LeaseOut',
    datePosted: p.created_at,
    itemOffered: {
      '@type': p.listing_type === 'flat' ? 'Apartment' : p.listing_type === 'pg' ? 'Accommodation' : 'Room',
      name: headline(p),
      description: p.description?.slice(0, 500),
      ...(p.bhk && /\d/.test(p.bhk) ? { numberOfRooms: parseInt(p.bhk, 10) } : {}),
      amenityFeature: (p.amenities || []).map((a) => ({ '@type': 'LocationFeatureSpecification', name: a, value: true })),
      address: { '@type': 'PostalAddress', addressLocality: p.locality, addressRegion: 'Chhattisgarh', addressCountry: 'IN', ...(p.pincode ? { postalCode: p.pincode } : {}) },
      ...(p.lat && p.lng ? { geo: { '@type': 'GeoCoordinates', latitude: p.lat, longitude: p.lng } } : {}),
      ...(p.images?.length ? { image: p.images.map((i) => i.url) } : {}),
    },
    areaServed: { '@type': 'City', name: c.name },
  };

  return (
    <div className="wrap">
      {!isPublic(p) && (
        <p className="notice notice-warn" style={{ marginTop: 20 }}>
          Only you can see this page. Status: <b>{p.status}</b>{p.status === 'pending' ? ' — it goes live once our team approves it (usually within a day).' : '.'}
          {' '}<Link href={`/host/${p.id}/edit`}>Edit listing</Link>
        </p>
      )}
      <Breadcrumbs items={[{ name: c.name, href: `/rent/${c.slug}` }, { name: t.plural, href: `/rent/${c.slug}/${t.slug}` }, { name: p.locality, href: `/property/${p.slug}` }]} />
      <div className={`prop-layout t-${p.listing_type}`}>
        <article className="stack" style={{ minWidth: 0 }}>
          <header>
            <div className="lmeta" style={{ marginBottom: 10 }}>
              <span className="badge badge-green">₹0 brokerage</span>
              {p.verified && <span className="badge badge-green">✓ Verified owner</span>}
              {p.status === 'rented' && <span className="badge badge-warn">Rented out</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3.4vw, 2.3rem)', marginBottom: 6 }}>{p.title || headline(p)}</h1>
            <p className="muted" style={{ margin: 0 }}>{headline(p)} · {p.locality}{near ? `, near ${near}` : ''}, {c.name}</p>
          </header>

          {p.images?.length > 0 ? (
            <div className="gallery">
              {p.images.map((img, i) => (
                <a key={i} href={img.url} target="_blank" rel="noopener">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={`${headline(p)} in ${p.locality}, photo ${i + 1}`} loading={i === 0 ? 'eager' : 'lazy'} />
                </a>
              ))}
            </div>
          ) : (
            <div className="prop-scene"><Scene kind={p.listing_type} uid={`p-${p.id}`} title={`Illustration of a ${t.label.toLowerCase()}`} /></div>
          )}

          <dl className="facts reveal" style={{ margin: '8px 0' }}>
            {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
          </dl>

          <div className="prop-tabs">
            <Tabs variant="line" tabs={[
              { id: 'about', label: 'About', content: p.description ? <p className="desc">{p.description}</p> : <p className="muted">The owner hasn’t added a description yet. Ask them on call.</p> },
              ...(p.amenities?.length ? [{ id: 'amen', label: `What’s included (${p.amenities.length})`, content: <ul className="amen">{p.amenities.map((a) => <li key={a}>✓ {a}</li>)}</ul> }] : []),
              { id: 'loc', label: 'Location', content: (
                <div className="map-card">
                  <span className="map-pin" aria-hidden="true" />
                  <div>
                    <b>{p.locality}{near ? `, near ${near}` : ''}</b>
                    <p className="muted small" style={{ margin: '2px 0 6px' }}>{c.name}, Chhattisgarh{p.pincode ? ` ${p.pincode}` : ''}. The owner shares the exact address on call.</p>
                    <a className="small" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`} target="_blank" rel="noopener">Open area in Google Maps →</a>
                  </div>
                </div>
              ) },
            ]} />
          </div>
        </article>

        <aside className="prop-side stack">
          <div className="card contact-card stack">
            <div><span className="rent">{rupees(p.rent)}</span> <span className="muted">/ month</span></div>
            {p.deposit > 0 && <p className="small muted" style={{ margin: 0 }}>Deposit {rupees(p.deposit)}{p.maintenance ? ` · Maintenance ${rupees(p.maintenance)}` : ''}</p>}
            <ContactOwner propertyId={p.id} loggedIn={Boolean(user)} title={p.title || headline(p)} slug={p.slug} rented={p.status === 'rented'} />
            <div className="row between">
              <SaveButton propertyId={p.id} saved={Boolean(fav)} loggedIn={Boolean(user)} slug={p.slug} />
              <span className="xs muted">{p.views || 0} views</span>
            </div>
          </div>
          <div className="card-flat small">
            <b>Renting safely</b>
            <p className="muted" style={{ margin: '6px 0 0' }}>Visit the place, meet the owner and check the agreement before paying any deposit. We never ask you for money.</p>
          </div>
          <ReportButton propertyId={p.id} loggedIn={Boolean(user)} slug={p.slug} />
        </aside>
      </div>

      {similar.length > 0 && (
        <section style={{ paddingBottom: 48 }}>
          <h2 style={{ fontSize: '1.3rem' }}>Similar {t.plural.toLowerCase()} in {c.name}</h2>
          <div className="listings cols-2">{similar.map((s) => <PropertyCard key={s.id} p={s} />)}</div>
        </section>
      )}
      {isPublic(p) && <JsonLd data={ld} />}
    </div>
  );
}
