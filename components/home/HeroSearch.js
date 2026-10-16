// Pill search bar: city · type · area, with a yellow Search button. Works without JavaScript.
const Pin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>
);
const Home = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
);
const Search = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

export default function HeroSearch({ cities, city = 'bhilai', plain = false }) {
  return (
    <div className="hero-search">
      <form className={`searchbar${plain ? ' searchbar-plain' : ''}`} action="/search" method="get" role="search">
        <label className="sb-field">
          <Pin /><span className="sr-only">City</span>
          <select name="city" className="input" defaultValue={city}>
            <option value="">All Chhattisgarh</option>
            {cities.map((c) => <option key={c.slug} value={c.slug}>{c.slug === 'bhilai' || c.slug === 'durg' ? `${c.name}` : c.name}</option>)}
          </select>
        </label>
        <label className="sb-field">
          <Home /><span className="sr-only">Type</span>
          <select name="type" className="input" defaultValue="">
            <option value="">Any type</option>
            <option value="flat">Flats</option>
            <option value="pg">PG</option>
            <option value="room">Rooms</option>
            <option value="flatmate">Flatmates</option>
          </select>
        </label>
        <label className="sb-field">
          <Search /><span className="sr-only">Area or landmark</span>
          <input name="q" className="input" placeholder="Area or college, e.g. Supela, IIT Bhilai" />
        </label>
        <button className="btn sb-btn btn-shine" type="submit">Search</button>
      </form>
    </div>
  );
}
