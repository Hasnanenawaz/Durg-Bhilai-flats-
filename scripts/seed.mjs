// Seeds starter blog posts (always) and demo listings (only with --demo).
//   npm run seed            → 2 starter guides
//   npm run seed -- --demo  → also adds sample listings (local testing only; delete before launch)
// Works with Supabase when its keys are in .env.local, otherwise writes .data/db.json.
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

async function loadEnv() {
  for (const f of ['.env.local', '.env']) {
    try {
      const txt = await fs.readFile(f, 'utf8');
      for (const line of txt.split('\n')) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    } catch {}
  }
}
await loadEnv();
const demo = process.argv.includes('--demo');
const now = () => new Date().toISOString();
const ago = (d) => new Date(Date.now() - d * 864e5).toISOString();

const BLOGS = [
  {
    slug: 'pg-vs-flat-in-bhilai-for-students',
    title: 'PG vs flat in Bhilai: which is better for students?',
    excerpt: 'A PG is simpler for your first year; a shared flat usually works out cheaper and freer once you have friends to split with. Here is how to decide.',
    tags: ['students', 'PG', 'Bhilai'], city: 'bhilai', status: 'published', author: 'Durg Bhilai Flats Team',
    content: `If you are new to Bhilai, **start with a PG**. Food, Wi-Fi and cleaning are usually included, and you only need one deposit. Once you know the city and have two or three friends to share with, **a shared flat is usually cheaper per person** and gives you more freedom.

## When a PG makes more sense

- You are in your first semester and don't know the city yet.
- You don't want to cook or buy furniture.
- Your parents want a warden, fixed timings and a known owner.
- You want to move in this week with one suitcase.

Popular PG areas for students are around **Kohka, Junwani and Smriti Nagar** (close to the Bhilai engineering colleges) and **Supela and Nehru Nagar** (markets, buses and coaching).

## When a shared flat makes more sense

- You have 2–3 friends you trust to share rent and bills.
- You want your own kitchen and no in-time.
- You plan to stay for a full year or more.

Remember the extra costs that a PG usually covers: electricity, gas cylinder, water, maid, Wi-Fi and basic furniture. Add them up before you compare.

## Questions to ask the owner before you pay

1. What exactly is included in the rent: food, electricity, Wi-Fi?
2. How much is the deposit, and when is it returned?
3. Is there a notice period or lock-in?
4. Are there in-time or guest rules?
5. Can I see the actual room, not a sample room?

## Never pay before you visit

Do not send a token amount for a room you haven't seen. Visit, meet the owner, check the water supply and the bathroom, and only then pay. On Durg Bhilai Flats & Flatmates you call owners directly, so there is no brokerage to pay at all.`,
    faq: [
      { q: 'Is a PG cheaper than a flat in Bhilai?', a: 'For one person, a PG is often cheaper once food, electricity and Wi-Fi are counted. For three or four friends sharing, a flat usually costs less per person.' },
      { q: 'Which areas in Bhilai are good for students?', a: 'Kohka, Junwani and Smriti Nagar are close to several engineering colleges, while Supela and Nehru Nagar have markets, buses and coaching centres.' },
    ],
  },
  {
    slug: 'how-to-rent-a-flat-in-durg-bhilai-without-a-broker',
    title: 'How to rent a flat in Durg-Bhilai without paying a broker',
    excerpt: 'Five practical steps to find a flat in Durg or Bhilai directly from the owner, check it properly and sign a fair agreement.',
    tags: ['flats', 'no brokerage', 'Durg'], city: 'durg', status: 'published', author: 'Durg Bhilai Flats Team',
    content: `You can rent a flat in Durg or Bhilai without a broker by **searching owner listings, calling owners directly, visiting in person and signing a written agreement**. Brokers often charge a full month's rent; dealing with the owner directly saves that money.

## 1. Decide your area first

Pick the area by your daily travel, not by rent alone. People working at the steel plant often look at the **Bhilai sectors** and **Civic Centre**; people working or studying in Durg look at **Padmanabhpur, Kasaridih and Shankar Nagar**.

## 2. Search owner listings

Filter by city, area, rent and size. Shortlist three to five places and save them so you can compare later.

## 3. Call and ask the right questions

Ask about rent, deposit, maintenance, electricity billing, water timing, parking and whether families, bachelors or students are allowed.

## 4. Visit before you pay anything

Check the water pressure, the electric meter, mobile network, and the road at night. Meet the owner, not a "manager".

## 5. Put it in writing

Get a simple rent agreement with the rent, deposit, notice period and what is included. Keep a copy of the owner's ID and the payment receipts.`,
    faq: [
      { q: 'How much brokerage do brokers charge in Durg-Bhilai?', a: 'Many brokers ask for around one month’s rent. Renting directly from the owner avoids this cost completely.' },
      { q: 'Do I need a rent agreement?', a: 'Yes. A written agreement with the rent, deposit and notice period protects both you and the owner if there is a disagreement later.' },
    ],
  },
];

const DEMO_LISTINGS = [
  { listing_type: 'pg', title: 'Girls PG with food near Smriti Nagar', bhk: 'Shared room', furnishing: 'Fully furnished', tenant_pref: 'girls', rent: 6500, deposit: 6500, food_included: true, city: 'bhilai', locality: 'Smriti Nagar', landmark: 'near Smriti Nagar market', amenities: ['Wi-Fi', 'Food / tiffin', 'RO water', 'CCTV', 'Housekeeping'], description: 'Two meals a day, 24x7 water, warden on site. 10 minutes to Junwani colleges.' },
  { listing_type: 'flat', title: '2 BHK semi-furnished flat in Supela', bhk: '2 BHK', furnishing: 'Semi-furnished', tenant_pref: 'family', rent: 11000, deposit: 22000, maintenance: 500, city: 'bhilai', locality: 'Supela', landmark: 'near Supela Chowk', amenities: ['Geyser', 'Parking (2-wheeler)', 'Power backup', 'Balcony'], description: 'Second floor, east facing, wardrobes in both rooms. Close to market and bus stop.' },
  { listing_type: 'room', title: 'Single room for working professional, Nehru Nagar', bhk: 'Single room', furnishing: 'Semi-furnished', tenant_pref: 'working', rent: 4500, deposit: 4500, city: 'bhilai', locality: 'Nehru Nagar', amenities: ['Attached bathroom', 'Separate entry', 'Cooler'], description: 'Independent room with attached bathroom on the first floor. Owner family lives downstairs.' },
  { listing_type: 'flat', title: '1 BHK flat near BIT Durg', bhk: '1 BHK', furnishing: 'Unfurnished', tenant_pref: 'any', rent: 7000, deposit: 14000, city: 'durg', locality: 'Padmanabhpur', landmark: 'BIT Durg', amenities: ['Parking (2-wheeler)', 'RO water'], description: 'Quiet lane, 5 minutes walk to BIT Durg. Water supply morning and evening.' },
  { listing_type: 'flatmate', title: 'Need 1 flatmate for 3 BHK in Kohka', bhk: 'Shared room', furnishing: 'Fully furnished', tenant_pref: 'boys', rent: 4000, deposit: 4000, city: 'bhilai', locality: 'Kohka', landmark: 'near CSVTU', amenities: ['Wi-Fi', 'Washing machine', 'Fridge', 'AC'], description: 'Two of us (engineering students) looking for a third. Rent split three ways, own room.' },
  { listing_type: 'pg', title: 'Boys PG near IIT Bhilai with meals', bhk: 'Shared room', furnishing: 'Fully furnished', tenant_pref: 'students', rent: 7500, deposit: 5000, food_included: true, city: 'durg', locality: 'Kutelabhata', landmark: 'IIT Bhilai', amenities: ['Wi-Fi', 'Food / tiffin', 'Power backup', 'Washing machine'], description: 'Three meals, laundry twice a week, 2 km from the IIT Bhilai campus.' },
  { listing_type: 'flat', title: '3 BHK for family in Shankar Nagar, Raipur', bhk: '3 BHK', furnishing: 'Semi-furnished', tenant_pref: 'family', rent: 18000, deposit: 36000, maintenance: 1500, city: 'raipur', locality: 'Shankar Nagar', amenities: ['Lift', 'Parking (car)', 'Gated society', 'Power backup'], description: 'Gated society, covered parking, lift. Near schools and hospitals.' },
];

const slugify = (s) => s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_-]+/g, '-').slice(0, 70);

function rows() {
  const owner = { id: crypto.randomUUID(), phone: '9000000001', name: 'Demo Owner', whatsapp: '9000000001', active_mode: 'host', is_host: true, is_blocked: false, lead_status: 'new', login_count: 1, last_login_at: now(), created_at: ago(20), signup_city: 'bhilai', signup_source: 'seed', admin_notes: 'Demo account created by the seed script', email: null };
  const props = DEMO_LISTINGS.map((p, i) => ({
    id: crypto.randomUUID(), slug: `${slugify(p.title)}-${crypto.randomBytes(3).toString('hex')}`, owner_id: owner.id,
    description: '', maintenance: 0, food_included: false, available_from: null, address: '', landmark: '', pincode: null, lat: null, lng: null,
    images: [], contact_name: 'Demo Owner', contact_phone: '9000000001', whatsapp: '9000000001',
    status: 'approved', approved_at: ago(i), featured: i === 0, verified: i < 2, views: 10 + i * 7, created_at: ago(i * 2 + 1), updated_at: ago(i),
    ...p,
  }));
  const blogs = BLOGS.map((b, i) => ({ id: crypto.randomUUID(), cover_image: null, seo_title: null, seo_description: null, published_at: ago(i * 5 + 2), created_at: ago(i * 5 + 3), updated_at: ago(i * 5 + 2), ...b }));
  return { owner, props, blogs };
}

const { owner, props, blogs } = rows();

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
  for (const b of blogs) {
    const { error } = await sb.from('blogs').upsert(b, { onConflict: 'slug', ignoreDuplicates: true });
    if (error) throw error;
  }
  if (demo) {
    const { data: u, error: ue } = await sb.from('users').upsert(owner, { onConflict: 'phone' }).select().single();
    if (ue) throw ue;
    const { error } = await sb.from('properties').insert(props.map((p) => ({ ...p, owner_id: u.id })));
    if (error) throw error;
  }
  console.log(`Supabase: seeded ${blogs.length} posts${demo ? ` and ${props.length} demo listings` : ''}.`);
} else {
  const file = path.join(process.cwd(), '.data', 'db.json');
  let data = {};
  try { data = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  for (const t of ['users', 'properties', 'inquiries', 'favorites', 'blogs', 'reports']) data[t] ||= [];
  for (const b of blogs) if (!data.blogs.some((x) => x.slug === b.slug)) data.blogs.push(b);
  if (demo) {
    let o = data.users.find((u) => u.phone === owner.phone);
    if (!o) { data.users.push(owner); o = owner; }
    data.properties.push(...props.map((p) => ({ ...p, owner_id: o.id })));
  }
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2));
  console.log(`Local .data/db.json: seeded ${blogs.length} posts${demo ? ` and ${props.length} demo listings` : ''}.`);
}
