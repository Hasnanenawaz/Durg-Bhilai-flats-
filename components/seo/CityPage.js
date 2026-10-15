import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import Faq from '@/components/Faq';
import JsonLd from '@/components/JsonLd';
import { TypeIcon } from '@/components/PropertyCard';
import Filters from '@/components/listing/Filters';
import Results from '@/components/listing/Results';
import { searchProperties, rentStats } from '@/lib/models';
import { CITIES, LISTING_TYPES, LANDMARKS, typeByValue } from '@/lib/locations';
import { cityFaq } from '@/lib/faqs';
import { rupees, abs } from '@/lib/site';

const PER_PAGE = 20;

/** Landing page for "flats in Bhilai", "PG in Durg" etc. Answer-first for AEO/GEO. */
export default async function CityPage({ city, type, sp = {} }) {
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const f = { city: city.slug, type: type?.value || '', q: sp.q || '', min: sp.min || '', max: sp.max || '', tenant: sp.tenant || '', bhk: sp.bhk || '', furnishing: sp.furnishing || '', sort: sp.sort || '' };
  const [{ rows, total }, stats] = await Promise.all([
    searchProperties(f, { limit: PER_PAGE, offset: (page - 1) * PER_PAGE }),
    rentStats(city.slug, type?.value),
  ]);
  const what = type ? type.plural : 'Flats, PGs & rooms';
  const whatLower = type ? type.plural.toLowerCase() : 'flats, PGs and rooms';
  const path = `/rent/${city.slug}${type ? `/${type.slug}` : ''}`;
  const landmarks = LANDMARKS.filter((l) => l.city === city.slug);
  const faq = cityFaq(city.slug, stats);
  const others = CITIES.filter((c) => c.slug !== city.slug).slice(0, 6);

  return (
    <div className="wrap">
      <Breadcrumbs items={[{ name: city.name, href: `/rent/${city.slug}` }, ...(type ? [{ name: type.plural, href: path }] : [])]} />
      <header style={{ padding: '24px 0 8px' }}>
        <span className="eyebrow">{city.name} · {city.hindi} · Chhattisgarh</span>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>{what} on rent in {city.name}</h1>
        <div className="answer">
          <p>
            {stats
              ? <>There {stats.count === 1 ? 'is' : 'are'} <b>{stats.count} {type ? type.plural.toLowerCase() : 'places'}</b> listed by owners in {city.name} right now, with rent from <b>{rupees(stats.min)}</b> to <b>{rupees(stats.max)}</b> a month (typical: <b>{rupees(stats.median)}</b>). </>
              : <>Owners in {city.name} list {whatLower} here for free, and new places are added every week. </>}
            You contact the owner directly, so there is <b>no brokerage</b>. {city.blurb}
          </p>
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          <nav className="type-tabs" aria-label="Listing type">
            <Link href={`/rent/${city.slug}`} className="t-all" aria-current={!type ? 'page' : undefined}>All</Link>
            {LISTING_TYPES.map((t) => (
              <Link key={t.slug} href={`/rent/${city.slug}/${t.slug}`} className={`t-${t.value}`} aria-current={type?.slug === t.slug ? 'page' : undefined}><TypeIcon type={t.value} size={16} />{t.plural}</Link>
            ))}
          </nav>
        </div>
      </header>

      {stats && Object.keys(stats.typeMedians).length > 1 && !type && (
        <section className="section-tight">
          <h2 style={{ fontSize: '1.2rem' }}>Typical rent in {city.name}</h2>
          <div className="stats reveal reveal-stagger">
            {Object.entries(stats.typeMedians).map(([t, m]) => (
              <div key={t} className="stat"><b>{rupees(m)}</b><span>{typeByValue(t)?.label} · median per month</span></div>
            ))}
          </div>
          <p className="xs muted" style={{ marginTop: 8 }}>Worked out live from the listings on this site.</p>
        </section>
      )}

      <div className="search-layout">
        <aside><Filters f={f} action={path} lockCity lockType={Boolean(type)} /></aside>
        <section>
          <p className="muted small" style={{ marginBottom: 14 }}>{total} {total === 1 ? 'place' : 'places'} · newest first</p>
          <Results rows={rows} total={total} page={page} perPage={PER_PAGE} basePath={path} baseQuery={Object.fromEntries(Object.entries(sp).filter(([k, v]) => k !== 'page' && typeof v === 'string' && v))} emptyCity={city.name} />
        </section>
      </div>

      <section className="section" style={{ paddingTop: 8 }}>
        <div className="grid-2" style={{ gap: 40, alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Popular areas in {city.name}</h2>
            <div className="taglinks">
              {(stats?.topLocalities?.length ? stats.topLocalities.map((l) => l.name) : city.localities.slice(0, 14)).map((l) => (
                <Link key={l} href={`${path}?q=${encodeURIComponent(l)}`}>{l}</Link>
              ))}
            </div>
            {landmarks.length > 0 && (
              <>
                <h2 style={{ fontSize: '1.3rem', marginTop: 28 }}>Near colleges & workplaces</h2>
                <div className="taglinks">{landmarks.map((l) => <Link key={l.slug} href={`/near/${l.slug}`}>{type ? type.plural : 'Rooms'} near {l.name}</Link>)}</div>
              </>
            )}
            <h2 style={{ fontSize: '1.3rem', marginTop: 28 }}>Other cities</h2>
            <div className="taglinks">{others.map((c) => <Link key={c.slug} href={`/rent/${c.slug}${type ? `/${type.slug}` : ''}`}>{type ? type.plural : 'Rent'} in {c.name}</Link>)}</div>
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem' }}>Renting in {city.name}: quick answers</h2>
            <Faq items={faq} />
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: 40 }}>
        <div className="cta-band">
          <div><h2>Own a place in {city.name}?</h2><p>List it free. Tenants call you directly, no broker in between.</p></div>
          <Link href="/list-your-property" className="btn btn-primary btn-lg">List your place free</Link>
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${what} on rent in ${city.name}`, url: abs(path),
        about: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'State', name: 'Chhattisgarh' } },
        mainEntity: { '@type': 'ItemList', numberOfItems: total, itemListElement: rows.slice(0, 10).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(`/property/${p.slug}`), name: p.title })) },
      }} />
    </div>
  );
}
