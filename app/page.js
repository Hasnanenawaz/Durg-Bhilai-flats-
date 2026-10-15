import Link from 'next/link';
import { db } from '@/lib/db';
import HeroSearch from '@/components/home/HeroSearch';
import RotatingWord from '@/components/ui/RotatingWord';
import CountUp from '@/components/ui/CountUp';
import PropertyCard, { headline, TypeIcon } from '@/components/PropertyCard';
import Faq from '@/components/Faq';
import { CITIES, LANDMARKS, LISTING_TYPES, cityBySlug, typeByValue } from '@/lib/locations';
import { GENERAL_FAQ } from '@/lib/faqs';
import { rupees } from '@/lib/site';

export const metadata = { alternates: { canonical: '/' } };

const WORDS = [
  { text: 'flat', color: 'flat' },
  { text: 'PG', color: 'pg' },
  { text: 'room', color: 'room' },
  { text: 'flatmate', color: 'flatmate' },
];

export default async function Home() {
  const [latest, live] = await Promise.all([
    db.find('properties', { eq: { status: 'approved' }, order: ['created_at', false], limit: 6 }),
    db.count('properties', { eq: { status: 'approved' } }),
  ]);
  const preview = latest.slice(0, 3);
  const primary = CITIES.filter((c) => c.primary);
  const areas = primary.flatMap((c) => c.localities.slice(0, 12).map((l) => ({ city: c, name: l })));

  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true"><span className="blob blob-1" /><span className="blob blob-2" /><span className="blob blob-3" /></div>
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">Durg · Bhilai · Chhattisgarh</span>
            <h1>Find a <RotatingWord words={WORDS} /> <em>without a broker.</em></h1>
            <p className="lead">Owners list flats, PGs and rooms for free. You call them directly and pay ₹0 brokerage.</p>
            <HeroSearch cities={CITIES.map(({ slug, name }) => ({ slug, name }))} />
            <div className="trust-row">
              <span><i>✓</i> Owner-listed</span>
              <span><i>✓</i> OTP-verified accounts</span>
              <span><i>✓</i> Listings checked by people</span>
            </div>
          </div>
          {preview.length > 0 && (
            <div className="hero-visual" aria-hidden="true">
              {preview.map((p, i) => (
                <div key={p.id} className={`pcard pcard-${i + 1} t-${p.listing_type}`}>
                  <span className="ptype"><TypeIcon type={p.listing_type} size={14} />{typeByValue(p.listing_type)?.label}</span>
                  <h4>{p.title || headline(p)}</h4>
                  <p>{p.locality}, {cityBySlug(p.city)?.name}</p>
                  <span className="rent">{rupees(p.rent)}<small>/mo</small></span>
                </div>
              ))}
              <div className="zero-badge"><div><b>₹0</b><small>brokerage</small></div></div>
            </div>
          )}
        </div>
      </section>

      <div className="marquee" aria-label="Popular areas">
        <div className="marquee-track">
          {[...areas, ...areas].map((a, i) => (
            <Link key={i} href={`/search?city=${a.city.slug}&q=${encodeURIComponent(a.name)}`} tabIndex={i >= areas.length ? -1 : undefined} aria-hidden={i >= areas.length || undefined}>
              {a.name} <span className="xs muted">{a.city.name}</span>
            </Link>
          ))}
        </div>
      </div>

      <section className="section-tight">
        <div className="wrap">
          <div className="stats reveal reveal-stagger">
            <div className="stat"><b><CountUp to={live} /></b><span>live listings</span></div>
            <div className="stat"><b>₹0</b><span>brokerage, for tenants and owners</span></div>
            <div className="stat"><b><CountUp to={CITIES.length} /></b><span>cities in Chhattisgarh</span></div>
            <div className="stat"><b><CountUp to={LANDMARKS.length} /></b><span>colleges and workplaces mapped</span></div>
          </div>
        </div>
      </section>

      {latest.length > 0 && (
        <section className="section">
          <div className="wrap">
            <div className="row between"><h2>Just listed</h2><Link href="/search">See all places →</Link></div>
            <div className="listings cols-2" style={{ marginTop: 16 }}>{latest.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <h2>How it works</h2>
          <div className="steps-row reveal reveal-stagger" style={{ marginTop: 20 }}>
            <div className="step"><h3>Search your area</h3><p>Filter by city, locality, rent, type and who it’s for.</p></div>
            <div className="step"><h3>Log in with OTP</h3><p>Just your mobile number and a 6-digit code. No password.</p></div>
            <div className="step"><h3>Call the owner</h3><p>Tap “Show owner’s number”, then call or WhatsApp. Nobody in between.</p></div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2>Browse by city</h2>
          <div className="citygrid" style={{ marginTop: 16 }}>
            {CITIES.map((c) => <Link key={c.slug} href={`/rent/${c.slug}`} className="citylink"><b>{c.name}</b><span>{c.hindi}</span></Link>)}
          </div>
          <div className="taglinks" style={{ marginTop: 20 }}>
            {primary.flatMap((c) => LISTING_TYPES.map((t) => <Link key={`${c.slug}-${t.slug}`} href={`/rent/${c.slug}/${t.slug}`}>{t.plural} in {c.name}</Link>))}
            {LANDMARKS.slice(0, 6).map((l) => <Link key={l.slug} href={`/near/${l.slug}`}>Near {l.name}</Link>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-2" style={{ gap: 40, alignItems: 'start' }}>
          <div><h2>Questions people ask</h2><p className="muted">Short answers about renting and listing here.</p><Link href="/faq">All FAQs →</Link></div>
          <Faq items={GENERAL_FAQ} />
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div className="cta-band">
          <div><h2>Have a flat, PG or room to rent?</h2><p>List it free. Tenants call you directly, no broker in between.</p></div>
          <Link href="/list-your-property" className="btn btn-warm btn-lg">List your place free</Link>
        </div>
      </section>
    </>
  );
}
