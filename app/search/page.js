import Filters from '@/components/listing/Filters';
import Results from '@/components/listing/Results';
import { searchProperties } from '@/lib/models';
import { cityBySlug, typeByValue } from '@/lib/locations';

const PER_PAGE = 20;
const KEYS = ['city', 'type', 'q', 'min', 'max', 'tenant', 'bhk', 'furnishing', 'sort'];

export async function generateMetadata({ searchParams }) {
  const sp = await searchParams;
  const c = cityBySlug(sp.city);
  const t = typeByValue(sp.type);
  const what = t ? t.plural : 'Flats, PGs & rooms';
  return {
    title: `${what} on rent${c ? ` in ${c.name}` : ' in Chhattisgarh'}${sp.q ? ` near ${sp.q}` : ''}`,
    description: `Search ${what.toLowerCase()} on rent${c ? ` in ${c.name}` : ' across Durg, Bhilai and Chhattisgarh'}. Owner-listed, zero brokerage.`,
    // Filtered search pages stay out of the index; city/type pages under /rent are the indexable versions.
    robots: { index: false, follow: true },
    alternates: { canonical: c ? `/rent/${c.slug}${t ? `/${t.slug}` : ''}` : '/search' },
  };
}

export default async function SearchPage({ searchParams }) {
  const sp = await searchParams;
  const f = Object.fromEntries(KEYS.map((k) => [k, typeof sp[k] === 'string' ? sp[k] : '']));
  const page = Math.max(1, parseInt(sp.page || '1', 10) || 1);
  const { rows, total } = await searchProperties(f, { limit: PER_PAGE, offset: (page - 1) * PER_PAGE });
  const c = cityBySlug(f.city);
  const t = typeByValue(f.type);
  return (
    <div className="wrap">
      <div className="search-layout">
        <aside><Filters f={f} /></aside>
        <section aria-live="polite">
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 4 }}>
            {t ? t.plural : 'Flats, PGs & rooms'} {c ? `in ${c.name}` : 'in Chhattisgarh'}
          </h1>
          <p className="muted small" style={{ marginBottom: 18 }}>{total} place{total === 1 ? '' : 's'} · all listed by owners · ₹0 brokerage</p>
          <Results rows={rows} total={total} page={page} perPage={PER_PAGE} baseQuery={Object.fromEntries(Object.entries(f).filter(([, v]) => v))} emptyCity={c?.name} />
        </section>
      </div>
    </div>
  );
}
