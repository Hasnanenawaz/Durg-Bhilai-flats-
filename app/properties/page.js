import Link from 'next/link';
import { redirect } from 'next/navigation';
import LocationSearch from '@/components/LocationSearch';
import FilterDrawer from '@/components/listing/FilterDrawer';
import Filters from '@/components/listing/Filters';
import Results from '@/components/listing/Results';
import { CITIES, STATE, cityBySlug, typeByValue } from '@/lib/locations';
import { filterChips, noticeText, readParams, runSearch } from '@/lib/search';
import { canonicalParams, propertiesHref, resolveLocation } from '@/lib/search-parse';

const PER_PAGE = 20;
const placeWords = (place) => (place ? `${place.kind === 'landmark' ? 'near' : 'in'} ${place.name}` : `in ${STATE}`);

export async function generateMetadata({ searchParams }) {
  const p = readParams(await searchParams);
  const loc = resolveLocation(p.location, p.city);
  const t = typeByValue(p.type);
  const what = t ? t.plural : 'Flats, PGs & rooms';
  const c = loc?.kind === 'city' ? cityBySlug(loc.city) : null;
  return {
    title: `${what} on rent ${placeWords(loc)}`,
    description: `Search ${what.toLowerCase()} on rent ${loc ? placeWords(loc) : 'across Durg, Bhilai and Chhattisgarh'}. Owner-listed, zero brokerage.`,
    // Search pages stay out of the index; the city and type pages under /rent are the indexable versions.
    robots: { index: false, follow: true },
    alternates: { canonical: c ? `/rent/${c.slug}${t ? `/${t.slug}` : ''}` : '/properties' },
  };
}

function CityLinks() {
  return (
    <div className="row" style={{ justifyContent: 'center' }}>
      {CITIES.slice(0, 4).map((c) => <Link key={c.slug} className="btn btn-ghost btn-sm" href={propertiesHref({ location: c.name, city: c.slug })}>{c.name}</Link>)}
    </div>
  );
}

function EmptyState({ result, params, clearHref }) {
  const name = result.place?.name;
  if (result.state === 'outside') {
    return <div className="empty"><h3>We don’t list places in {params.location || 'that area'}</h3><p>This site covers {STATE} only. Try one of these cities.</p><CityLinks /></div>;
  }
  if (result.state === 'no-match') {
    return <div className="empty"><h3>We couldn’t find “{name}”</h3><p>Check the spelling, or try a nearby city.</p><CityLinks /></div>;
  }
  if (result.state === 'filtered-empty') {
    return (
      <div className="empty">
        <h3>Nothing matches these filters {name ? placeWords(result.place) : ''}</h3>
        <p>There are places here, just none that fit all of this. Remove a filter or clear them all.</p>
        <Link className="btn btn-primary btn-sm" href={clearHref}>Clear filters</Link>
      </div>
    );
  }
  if (result.state === 'error') {
    return <div className="empty"><h3>Search isn’t working right now</h3><p>This is a problem on our side. Please try again in a moment.</p><Link className="btn btn-primary btn-sm" href={propertiesHref(params)}>Try again</Link></div>;
  }
  return (
    <div className="empty">
      <h3>No listings {name ? placeWords(result.place) : ''} yet</h3>
      <p>New places come in every week. Try a nearby city, or list your own for free.</p>
      <div className="row" style={{ justifyContent: 'center' }}>
        <Link className="btn btn-ghost btn-sm" href="/properties">See all listings</Link>
        <Link className="btn btn-soft btn-sm" href="/list-your-property">Have a place? List it free</Link>
      </div>
    </div>
  );
}

export default async function PropertiesPage({ searchParams }) {
  const sp = await searchParams;
  const params = readParams(sp);
  const canonical = canonicalParams(params);
  if (canonical) redirect(propertiesHref(canonical));

  const result = await runSearch(params, Math.max(1, parseInt(sp.page || '1', 10) || 1), PER_PAGE);
  const { state, place, rows, total, page } = result;
  const hasRows = rows.length > 0;
  const chips = filterChips(params);
  const here = { location: params.location, city: params.city, outside: params.outside };
  const clearHref = propertiesHref(here);
  const baseQuery = Object.fromEntries(Object.entries(params).filter(([, v]) => v));
  const searched = resolveLocation(params.location, params.city);
  const cityForAreas = searched?.kind === 'city' ? cityBySlug(searched.city) : null;
  const t = typeByValue(params.type);
  const showFilters = hasRows || state === 'filtered-empty';
  const keep = Object.fromEntries(['type', 'bhk', 'furnishing', 'tenant', 'min', 'max', 'sort'].map((k) => [k, params[k]]));

  const body = (
    <section aria-live="polite">
      <h1 className="res-title">{t ? t.plural : 'Flats, PGs & rooms'} {params.outside ? '' : placeWords(place)}</h1>
      {hasRows && <p className="muted small" style={{ marginBottom: 12 }}>{total} place{total === 1 ? '' : 's'} · all listed by owners · ₹0 brokerage</p>}
      {params.notice && hasRows && <p className="res-note">{noticeText(params.notice)}</p>}
      {state === 'fallback' && <p className="res-note">No listings in {params.location} yet, so here is everything in {place.name}.</p>}
      {chips.length > 0 && (
        <div className="res-chips" aria-label="Active filters">
          {chips.map((c) => <Link key={c.key} className="res-chip" href={c.href} aria-label={`Remove filter: ${c.label}`}>{c.label}<span aria-hidden="true">×</span></Link>)}
          <Link className="small" href={clearHref}>Clear all</Link>
        </div>
      )}
      {hasRows
        ? <Results grid rows={rows} total={total} page={page} perPage={PER_PAGE} baseQuery={baseQuery} />
        : <EmptyState result={result} params={params} clearHref={clearHref} />}
    </section>
  );

  return (
    <div className="wrap">
      <div className="res-search">
        <LocationSearch key={`${params.location}|${params.city}`} plain defaultValue={params.location || cityBySlug(params.city)?.name || ''} keep={keep} />
      </div>
      {showFilters ? (
        <div className="search-layout">
          <FilterDrawer count={chips.length}>
            <Filters f={params} simple hidden={{ ...here, q: params.q }} localities={cityForAreas?.localities} clearHref={clearHref} />
          </FilterDrawer>
          {body}
        </div>
      ) : <div className="search-layout-solo">{body}</div>}
    </div>
  );
}
