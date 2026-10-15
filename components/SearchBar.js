import { CITIES, LISTING_TYPES } from '@/lib/locations';

export default function SearchBar({ city = 'bhilai', type = '', q = '' }) {
  return (
    <form className="searchbar" action="/search" method="get" role="search">
      <label className="sr-only" htmlFor="sb-city">City</label>
      <select id="sb-city" name="city" className="input" defaultValue={city}>
        <option value="">All Chhattisgarh</option>
        {CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
      </select>
      <label className="sr-only" htmlFor="sb-type">What are you looking for</label>
      <select id="sb-type" name="type" className="input" defaultValue={type}>
        <option value="">Flat, PG or room</option>
        {LISTING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.plural}</option>)}
      </select>
      <label className="sr-only" htmlFor="sb-q">Area or landmark</label>
      <input id="sb-q" name="q" className="input" defaultValue={q} placeholder="Area or landmark, e.g. Supela, IIT Bhilai" />
      <button className="btn btn-primary" type="submit">Search</button>
    </form>
  );
}
