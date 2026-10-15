// End-to-end smoke test against a running server in dev-OTP mode.
// Usage: ALLOW_DEV_OTP=true ADMIN_PHONES=9876543210 npm start   then   node tests/smoke.mjs
const BASE = process.env.BASE || 'http://localhost:3000';
const ADMIN = process.env.ADMIN_PHONE || '9876543210';
let pass = 0, fail = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { fail++; console.log(`  ✗ ${name} ${extra}`); } };

function client() {
  let cookie = '';
  return async (path, opts = {}) => {
    const r = await fetch(BASE + path, { redirect: 'manual', ...opts, headers: { ...(opts.body && !(opts.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...(opts.headers || {}) } });
    const set = r.headers.get('set-cookie');
    if (set) { const m = set.match(/dbf_session=([^;]*)/); if (m) cookie = m[1] ? `dbf_session=${m[1]}` : ''; }
    return r;
  };
}
const j = (o) => JSON.stringify(o);

async function login(c, phone, name, mode) {
  const s = await (await c('/api/auth/otp', { method: 'POST', body: j({ phone }) })).json();
  const v = await c('/api/auth/verify', { method: 'POST', body: j({ phone, code: s.devCode, mode }) });
  const vd = await v.json();
  if (vd.needsProfile) await c('/api/me', { method: 'PATCH', body: j({ name, active_mode: mode || 'guest', signup_city: 'bhilai' }) });
  return { status: v.status, ...vd };
}

const guest = client(), host = client(), admin = client(), anon = client();
const gp = '9' + String(Date.now()).slice(-9), hp = '8' + String(Date.now() + 7).slice(-9);

console.log('Public pages');
for (const p of ['/', '/search', '/search?city=bhilai&type=pg', '/rent/bhilai', '/rent/durg/flats', '/rent/bhilai/pg', '/near/iit-bhilai', '/blog', '/blog/pg-vs-flat-in-bhilai-for-students', '/list-your-property', '/about', '/faq', '/privacy', '/terms', '/login', '/sitemap.xml', '/robots.txt', '/llms.txt', '/opengraph-image', '/manifest.webmanifest']) {
  const r = await anon(p);
  ok(r.status === 200, `${p} → 200`, `got ${r.status}`);
}
ok((await anon('/rent/nowhere')).status === 404, 'unknown city → 404');
ok((await anon('/host')).status === 307, '/host redirects when logged out');
ok((await anon('/admin')).status === 307, '/admin redirects when logged out');

console.log('OTP auth');
const bad = await (async () => { await guest('/api/auth/otp', { method: 'POST', body: j({ phone: gp }) }); return guest('/api/auth/verify', { method: 'POST', body: j({ phone: gp, code: '000000' }) }); })();
ok(bad.status === 401, 'wrong OTP rejected');
ok((await guest('/api/auth/otp', { method: 'POST', body: j({ phone: '12345' }) })).status === 400, 'invalid phone rejected');
await new Promise((r) => setTimeout(r, 0));
// fresh number for real login (previous one is rate-limited for 30s)
const gp2 = '7' + String(Date.now()).slice(-9);
const g = await login(guest, gp2, 'Test Guest');
ok(g.status === 200 && g.needsProfile, 'guest signs up with OTP');
const h = await login(host, hp, 'Test Host', 'host');
ok(h.status === 200 && h.mode === 'host', 'host signs up in host mode');
const a = await login(admin, ADMIN, 'Admin');
ok(a.status === 200 && a.admin, 'admin phone gets admin');

console.log('Host flow');
const png = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63F8CFC0F01F0005000201E2D6A5B60000000049454E44AE426082', 'hex');
const fd = new FormData(); fd.append('file', new Blob([png], { type: 'image/png' }), 'a.png');
const up = await (await host('/api/upload', { method: 'POST', body: fd })).json();
ok(up.url && up.path, 'image upload works', JSON.stringify(up));
const fake = new FormData(); fake.append('file', new Blob([Buffer.from('<script>')], { type: 'image/png' }), 'x.png');
ok((await host('/api/upload', { method: 'POST', body: fake })).status === 400, 'non-image upload rejected');
ok((await anon(up.url)).status === 200, 'uploaded image is served');

const created = await host('/api/properties', { method: 'POST', body: j({ listing_type: 'pg', bhk: 'Shared room', furnishing: 'Fully furnished', tenant_pref: 'girls', rent: '6,000', deposit: 6000, city: 'bhilai', locality: 'Supela', landmark: 'Supela Chowk', contact_name: 'Test Host', contact_phone: hp, whatsapp: hp, amenities: ['Wi-Fi', 'Not-a-real-amenity'], images: [up], title: 'Smoke test PG in Supela for girls', description: 'Test listing', address: 'Secret house no 12' }) });
const cp = (await created.json()).property;
ok(created.status === 200 && cp.status === 'pending' && cp.rent === 6000, 'host creates listing (pending, rent parsed)');
ok(!cp.amenities.includes('Not-a-real-amenity'), 'unknown amenities stripped');
ok((await host('/api/properties', { method: 'POST', body: j({ title: 'x', rent: 0 }) })).status === 400, 'invalid listing rejected');
ok((await anon(`/property/${cp.slug}`)).status === 404, 'pending listing hidden from public');
ok((await host(`/property/${cp.slug}`)).status === 200, 'owner can preview pending listing');
ok((await guest(`/api/properties/${cp.id}`, { method: 'PATCH', body: j({ rent: 1 }) })).status === 404, "guest can't edit someone else's listing");
ok((await guest(`/api/admin/properties/${cp.id}`, { method: 'PATCH', body: j({ status: 'approved' }) })).status === 403, "guest can't approve");

console.log('Admin moderation');
const appr = await admin(`/api/admin/properties/${cp.id}`, { method: 'PATCH', body: j({ status: 'approved', verified: true }) });
ok(appr.status === 200 && (await appr.json()).property.status === 'approved', 'admin approves listing');
const pub = await (await anon(`/property/${cp.slug}`)).text();
ok(pub.includes('Smoke test PG') && !pub.includes(hp) && !pub.includes('Secret house'), 'public page hides phone and private address');
ok(pub.includes('application/ld+json') && pub.includes('"priceCurrency":"INR"'), 'listing has Offer structured data');

console.log('Guest flow');
const s1 = await (await guest('/search?city=bhilai&type=pg&q=supela')).text();
ok(s1.includes('Smoke test PG'), 'search finds listing by city/type/area');
ok(!(await (await guest('/search?city=bhilai&type=pg&max=5000')).text()).includes('Smoke test PG'), 'rent filter excludes it');
ok((await anon(`/api/properties/${cp.id}/contact`, { method: 'POST', body: '{}' })).status === 401, 'contact needs login');
const contact = await (await guest(`/api/properties/${cp.id}/contact`, { method: 'POST', body: '{}' })).json();
ok(contact.phone === hp, 'logged-in guest sees owner number');
await guest(`/api/properties/${cp.id}/contact`, { method: 'POST', body: '{}' });
const fav = await (await guest('/api/favorites', { method: 'POST', body: j({ propertyId: cp.id }) })).json();
ok(fav.saved === true, 'guest saves listing');
ok((await (await guest('/account/saved')).text()).includes('Smoke test PG'), 'saved page shows it');
ok((await guest('/api/reports', { method: 'POST', body: j({ propertyId: cp.id, reason: 'Already rented' }) })).status === 200, 'guest reports listing');

const inqHtml = await (await host('/host/inquiries')).text();
ok(inqHtml.includes('Test Guest') && inqHtml.includes(gp2.slice(5)), 'host sees who asked (once)');
ok((inqHtml.match(/class="hrow"/g) || []).length === 1, 'repeat reveal not double-logged');
const rented = await host(`/api/properties/${cp.id}`, { method: 'PATCH', body: j({ action: 'rented' }) });
ok((await rented.json()).property.status === 'rented', 'host marks rented');
const relist = await host(`/api/properties/${cp.id}`, { method: 'PATCH', body: j({ action: 'relist' }) });
ok((await relist.json()).property.status === 'approved', 'host relists (was approved before → live)');

console.log('Mode switch & profile');
const ms = await (await guest('/api/me', { method: 'PATCH', body: j({ active_mode: 'host' }) })).json();
ok(ms.user.active_mode === 'host', 'guest switches to host');
await guest('/api/me', { method: 'PATCH', body: j({ active_mode: 'guest' }) });

console.log('Admin data');
const users = await (await admin(`/admin/users?q=${gp2}`)).text();
ok(users.includes('Test Guest') && users.includes(gp2.slice(0, 5)), 'admin users page lists phone numbers');
const csvRes = await admin('/api/admin/users/export');
const csv = await csvRes.text();
ok(csvRes.status === 200 && csv.includes(`+91${gp2}`) && csv.includes(`+91${hp}`), 'CSV export contains all phones');
ok((await guest('/api/admin/users/export')).status === 403, "guest can't export");
const users2 = await (await admin('/admin/users')).text();
ok((await admin('/admin/inquiries')).status === 200 && (await admin('/admin/reports')).status === 200 && (await admin('/admin/listings?status=')).status === 200, 'admin pages load');
ok((await guest('/admin')).status === 307, "guest can't open admin");

console.log('Blog');
const slug = `smoke-post-${Date.now()}`;
const bp = await admin('/api/admin/blogs', { method: 'POST', body: j({ title: 'Smoke test post about Bhilai', slug, excerpt: 'Short', content: '## First heading\n\nHello **Bhilai**.\n\n<script>alert(1)</script>', faq: [{ q: 'Q one?', a: 'A one.' }], status: 'draft', tags: 'test, bhilai' }) });
const bpost = (await bp.json()).blog;
ok(bp.status === 200 && bpost.status === 'draft', 'admin creates draft');
ok((await anon(`/blog/${slug}`)).status === 404, 'draft hidden from public');
await admin(`/api/admin/blogs/${bpost.id}`, { method: 'PATCH', body: j({ status: 'published' }) });
const bhtml = await (await anon(`/blog/${slug}`)).text();
ok(bhtml.includes('id="first-heading"') && bhtml.includes('BlogPosting') && bhtml.includes('FAQPage'), 'published post renders with anchors + schema');
ok(!bhtml.includes('<script>alert(1)'), 'raw HTML in markdown is escaped');
ok((await guest('/api/admin/blogs', { method: 'POST', body: j({ title: 'nope nope' }) })).status === 403, "guest can't write posts");
await admin(`/api/admin/blogs/${bpost.id}`, { method: 'DELETE' });

console.log('SEO');
const home = await (await anon('/')).text();
ok(home.includes('"@type":"Organization"') && home.includes('SearchAction') && home.includes('FAQPage'), 'home has Organization, WebSite, FAQ schema');
ok(home.includes('lang="en-IN"') && home.includes('geo.region'), 'en-IN + geo meta');
const city = await (await anon('/rent/bhilai')).text();
ok(city.includes('rel="canonical"') && city.includes('BreadcrumbList') && city.includes('class="answer"'), 'city page: canonical, breadcrumbs, answer box');
ok((await (await anon('/robots.txt')).text()).includes('GPTBot'), 'robots allows AI crawlers');
ok((await (await anon('/sitemap.xml')).text()).includes('/rent/bhilai/pg'), 'sitemap has city/type pages');

console.log('Cleanup');
ok((await host(`/api/properties/${cp.id}`, { method: 'DELETE' })).status === 200, 'host deletes listing');
ok((await anon(up.url)).status === 404, 'its photo is removed too');
await guest('/api/auth/logout', { method: 'POST' });
ok((await guest('/account')).status === 307, 'logout ends session');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
