import { CITIES, LISTING_TYPES, TENANT_PREFS, FURNISHING, BHK, cityBySlug } from '@/lib/locations';

export default function Filters({ f, action = '/search', lockCity = false, lockType = false }) {
  const city = cityBySlug(f.city);
  return (
    <form className="filters" action={action} method="get" aria-label="Filter listings">
      {lockCity ? <input type="hidden" name="city" value={f.city} /> : (
        <label className="field"><span>City</span>
          <select name="city" className="input" defaultValue={f.city || ''}>
            <option value="">All Chhattisgarh</option>
            {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </label>
      )}
      {lockType ? <input type="hidden" name="type" value={f.type} /> : (
        <label className="field"><span>Type</span>
          <select name="type" className="input" defaultValue={f.type || ''}>
            <option value="">Any</option>
            {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.plural}</option>)}
          </select>
        </label>
      )}
      <label className="field"><span>Area or landmark</span>
        <input name="q" className="input" defaultValue={f.q || ''} list="loc-list" placeholder="e.g. Supela" />
        <datalist id="loc-list">{(city ? city.localities : CITIES.flatMap((c) => c.localities)).map((l) => <option key={l} value={l} />)}</datalist>
      </label>
      <div className="field"><span className="label">Rent per month (₹)</span>
        <div className="row" style={{ gap: 8, flexWrap: 'nowrap' }}>
          <input name="min" className="input" inputMode="numeric" placeholder="Min" defaultValue={f.min || ''} aria-label="Minimum rent" />
          <input name="max" className="input" inputMode="numeric" placeholder="Max" defaultValue={f.max || ''} aria-label="Maximum rent" />
        </div>
      </div>
      <label className="field"><span>For</span>
        <select name="tenant" className="input" defaultValue={f.tenant || ''}>
          <option value="">Anyone</option>
          {TENANT_PREFS.filter((t) => t.value !== 'any').map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </label>
      <label className="field"><span>Size</span>
        <select name="bhk" className="input" defaultValue={f.bhk || ''}>
          <option value="">Any</option>
          {BHK.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <label className="field"><span>Furnishing</span>
        <select name="furnishing" className="input" defaultValue={f.furnishing || ''}>
          <option value="">Any</option>
          {FURNISHING.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <label className="field"><span>Sort</span>
        <select name="sort" className="input" defaultValue={f.sort || ''}>
          <option value="">Newest first</option>
          <option value="rent_asc">Rent: low to high</option>
          <option value="rent_desc">Rent: high to low</option>
        </select>
      </label>
      <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 16 }}>Show places</button>
      <a href={action} className="small muted" style={{ display: 'block', textAlign: 'center', marginTop: 10 }}>Clear filters</a>
    </form>
  );
}
