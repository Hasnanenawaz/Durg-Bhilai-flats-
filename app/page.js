import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import Faq from '@/components/Faq';
import HeroSearch from '@/components/home/HeroSearch';
import SkyHero from '@/components/home/SkyHero';
import Scene from '@/components/art/Scene';
import Tabs from '@/components/ui/Tabs';
import CountUp from '@/components/ui/CountUp';
import RotatingWord from '@/components/ui/RotatingWord';
import { db } from '@/lib/db';
import { CITIES, LANDMARKS, LISTING_TYPES } from '@/lib/locations';
import { GENERAL_FAQ } from '@/lib/faqs';
import { shortDate } from '@/lib/site';

export const revalidate = 300;

export const metadata = {
  title: { absolute: 'Flats, PG & Rooms on Rent in Durg-Bhilai | Zero Brokerage | Durg Bhilai Flats & Flatmates' },
  description: 'Looking for a flat, PG, room or flatmate in Durg-Bhilai? See listings posted by owners and call them directly. Free to list, free to search, ₹0 brokerage.',
  alternates: { canonical: '/' },
};

const WORDS = [{ text: 'flat', color: 'flat' }, { text: 'PG', color: 'pg' }, { text: 'room', color: 'room' }, { text: 'flatmate', color: 'flatmate' }];

const CATS = [
  { v: 'flat', title: 'Flats', sub: '1, 2 & 3 BHK for families' },
  { v: 'pg', title: 'PG', sub: 'Meals, Wi-Fi, no hassle' },
  { v: 'room', title: 'Rooms', sub: 'Stay within budget' },
  { v: 'flatmate', title: 'Flatmates', sub: 'Share rent, make friends' },
];

const GUEST_STEPS = [
  ['Search by area or college', 'Filter Supela, Nehru Nagar, Smriti Nagar or “near IIT Bhilai” by rent, type and who it’s for.', '🔎'],
  ['Log in with your phone', 'One OTP and you’re in. No passwords, no long forms.', '📱'],
  ['Call or WhatsApp the owner', 'The number is right there. Visit first, pay later, never pay a broker.', '🤝'],
];
const HOST_STEPS = [
  ['Switch to Host', 'Same account, one tap. Guest and Host live side by side.', '🔁'],
  ['Add rent, area and a few photos', 'Flat, PG, single room, or “flatmate wanted” if you already rent.', '📸'],
  ['Get calls from real tenants', 'See who asked about your place, then mark it rented when it’s gone.', '📞'],
];

function Steps({ items, cta }) {
  return (
    <>
      <div className="steps-row">
        {items.map(([t, d, ic]) => <div key={t} className="step"><span className="step-ic" aria-hidden="true">{ic}</span><h3>{t}</h3><p>{d}</p></div>)}
      </div>
      <div className="center" style={{ marginTop: 22 }}>{cta}</div>
    </>
  );
}

export default async function Home() {
  const [recent, all, posts] = await Promise.all([
    db.find('properties', { eq: { status: 'approved' }, order: ['created_at', false], limit: 40 }),
    db.find('properties', { eq: { status: 'approved' }, limit: 2000 }),
    db.find('blogs', { eq: { status: 'published' }, order: ['published_at', false], limit: 3 }),
  ]);
  const perCity = {};
  const perType = {};
  for (const p of all) {
    perCity[p.city] = (perCity[p.city] || 0) + 1;
    perType[p.listing_type] = (perType[p.listing_type] || 0) + 1;
  }
  const owners = new Set(all.map((p) => p.owner_id)).size;
  const live = all.length;
  const cityCount = Object.keys(perCity).length;

  const byType = (v) => recent.filter((p) => !v || p.listing_type === v).slice(0, 6);
  const listingTabs = [
    { id: 'all', label: 'All', color: 'all', content: byType('') },
    ...LISTING_TYPES.map((t) => ({ id: t.value, label: t.value === 'flatmate' ? 'Flatmates' : t.plural, color: t.value, count: perType[t.value] || 0, content: byType(t.value) })),
  ].map((t) => ({
    ...t,
    content: t.content.length
      ? <div className="listings cols-2">{t.content.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      : <div className="empty"><h3>No {t.label.toLowerCase()} listed yet</h3><p>Be the first. Listing is free.</p><Link className="btn btn-amber btn-sm" href="/list-your-property">List your place</Link></div>,
  }));
  const localities = [...CITIES[0].localities.slice(0, 14).map((l) => ['bhilai', l]), ...CITIES[1].localities.slice(0, 10).map((l) => ['durg', l])];

  return (
    <>
      <SkyHero>
        <span className="eyebrow reveal">Durg · Bhilai · Chhattisgarh</span>
        <h1 className="reveal d1">Find your <RotatingWord words={WORDS} /> in <span className="y">Durg-Bhilai</span></h1>
        <p className="lead reveal d2">Flats, PGs, rooms and flatmates listed straight by owners. Call them directly and keep your money: <b style={{ color: '#fff' }}>₹0 brokerage.</b></p>
        <div className="reveal d3"><HeroSearch cities={CITIES} /></div>
        <div className="hero-trust reveal d3">
          <span><i>✓</i> No broker, ever</span>
          <span><i>✓</i> OTP-verified owners</span>
          <span><i>✓</i> Free to list</span>
        </div>
      </SkyHero>

      <div className="cat-row">
        <div className="wrap">
          <div className="cat-grid reveal reveal-stagger">
            {CATS.map((c) => (
              <Link key={c.v} href={`/search?type=${c.v}`} className={`cat-card t-${c.v}`}>
                <div className="cat-art">
                  <Scene kind={c.v} uid={`cat-${c.v}`} />
                  {perType[c.v] > 0 && <span className="cat-count">{perType[c.v]} live</span>}
                </div>
                <div className="cat-body">
                  <div><b>{c.title}</b><span>{c.sub}</span></div>
                  <span className="cat-arrow" aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="marquee" aria-label="Popular areas">
        <div className="marquee-track">
          {[...localities, ...localities].map(([c, l], i) => (
            <Link key={i} href={`/rent/${c}?q=${encodeURIComponent(l)}`} tabIndex={i >= localities.length ? -1 : undefined} aria-hidden={i >= localities.length ? true : undefined}>
              <i className={`dot t-${['flat', 'pg', 'room', 'flatmate'][i % 4]}`} />{l}<span className="xs muted">{c === 'durg' ? 'Durg' : 'Bhilai'}</span>
            </Link>
          ))}
        </div>
      </div>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="wrap">
          <div className="center reveal" style={{ marginBottom: 26 }}>
            <span className="eyebrow">How it works</span>
            <h2>Simple for both sides</h2>
          </div>
          <div className="reveal d1">
            <Tabs variant="segment" className="tabs-center" tabs={[
              { id: 'guest', label: '🏠 I’m looking for a place', content: <Steps items={GUEST_STEPS} cta={<Link className="btn btn-primary btn-lg" href="/search">Find a place</Link>} /> },
              { id: 'host', label: '🔑 I own a place', content: <Steps items={HOST_STEPS} cta={<Link className="btn btn-amber btn-lg" href="/list-your-property">List your place free</Link>} /> },
            ]} />
          </div>
        </div>
      </section>

      {live > 0 && (
        <section className="band-navy section-tight" style={{ padding: '44px 0' }}>
          <div className="wrap">
            <div className="stats reveal reveal-stagger">
              <div className="stat"><b><CountUp to={live} /></b><span>live listings</span></div>
              <div className="stat"><b><CountUp to={owners} /></b><span>{owners === 1 ? 'owner' : 'owners'} listing directly</span></div>
              <div className="stat"><b><CountUp to={cityCount} /></b><span>{cityCount === 1 ? 'city' : 'cities'} in Chhattisgarh</span></div>
              <div className="stat"><b>₹0</b><span>commission, ever</span></div>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="row between reveal" style={{ marginBottom: 18 }}>
            <div><span className="eyebrow">Fresh today</span><h2 style={{ margin: 0 }}>Just listed</h2></div>
            <Link href="/search" className="btn btn-ghost btn-sm">See all listings →</Link>
          </div>
          <div className="reveal d1"><Tabs tabs={listingTabs} /></div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="reveal" style={{ marginBottom: 16 }}>
            <span className="eyebrow">Across Chhattisgarh</span><h2 style={{ margin: 0 }}>Browse by city</h2>
          </div>
          <div className="citygrid reveal reveal-stagger">
            {CITIES.slice(0, 10).map((c) => (
              <Link key={c.slug} href={`/rent/${c.slug}`} className="citylink">
                <b>{c.name}</b>
                <span>{perCity[c.slug] ? `${perCity[c.slug]} listing${perCity[c.slug] > 1 ? 's' : ''}` : c.hindi}</span>
              </Link>
            ))}
          </div>
          <div className="taglinks reveal" style={{ marginTop: 18 }}>
            {LANDMARKS.slice(0, 8).map((l) => <Link key={l.slug} href={`/near/${l.slug}`}>📍 Near {l.name}</Link>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta-band reveal">
            <div>
              <h2>Your flat is empty. <span className="y">A broker wants a month’s rent.</span></h2>
              <p>List it here instead. Tenants call you directly, and you keep the full rent.</p>
            </div>
            <Link href="/list-your-property" className="btn btn-amber btn-lg btn-shine">List your place free</Link>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-2" style={{ gap: 40, alignItems: 'start' }}>
          <div className="reveal">
            <span className="eyebrow">Questions</span>
            <h2>What people ask before renting</h2>
            <p className="muted">Short answers. More in the <Link href="/faq">FAQ</Link>.</p>
          </div>
          <div className="reveal d1"><Faq items={GENERAL_FAQ} /></div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="row between reveal" style={{ marginBottom: 8 }}>
              <div><span className="eyebrow">Blog</span><h2 style={{ margin: 0 }}>Renting guides</h2></div>
              <Link href="/blog" className="btn btn-ghost btn-sm">All posts →</Link>
            </div>
            <div className="posts reveal reveal-stagger">
              {posts.map((b) => (
                <Link key={b.id} href={`/blog/${b.slug}`} className="post-row">
                  <span className="small muted">{shortDate(b.published_at)}</span>
                  <div><h3>{b.title}</h3><p className="muted small" style={{ margin: 0 }}>{b.excerpt}</p></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
