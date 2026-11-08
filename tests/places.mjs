// Search suggestions and result states against a fake Google server. No real Google calls or charges.
// Usage: SESSION_SECRET=<random 16+ chars> GOOGLE_PLACES_API_KEY=test GOOGLE_PLACES_API_URL=http://localhost:4993 npm start   then   node tests/places.mjs
// Needs the demo listings (npm run seed -- --demo) for the result states.
import http from 'http';

const BASE = process.env.BASE || 'http://localhost:3000';
const calls = [];
let failing = false;

const PLACES = {
  ChIJ_nehru_bhilai: [['Bhilai', 'locality'], ['Durg', 'administrative_area_level_3'], ['Chhattisgarh', 'administrative_area_level_1']],
  ChIJ_nehru_delhi: [['New Delhi', 'locality'], ['Delhi', 'administrative_area_level_1']],
  ChIJ_kumhari_town: [['Kumhari', 'locality'], ['Durg', 'administrative_area_level_3'], ['Chhattisgarh', 'administrative_area_level_1']],
};

const fake = http.createServer((req, res) => {
  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', () => {
    const u = new URL(req.url, 'http://x');
    const body = raw ? JSON.parse(raw) : null;
    calls.push({ method: req.method, path: u.pathname, q: Object.fromEntries(u.searchParams), key: req.headers['x-goog-api-key'], mask: req.headers['x-goog-fieldmask'], body });
    const reply = (o, status = 200) => { res.statusCode = status; res.end(JSON.stringify(o)); };
    if (failing) return reply({ error: { message: 'API key not valid' } }, 403);
    if (u.pathname === '/places:autocomplete') {
      if (body.input === 'nothinghere') return reply({});
      return reply({ suggestions: [{ placePrediction: { placeId: 'ChIJ_nehru_bhilai', text: { text: 'Nehru Nagar, Bhilai, Chhattisgarh, India' }, structuredFormat: { mainText: { text: 'Nehru Nagar' }, secondaryText: { text: 'Bhilai, Chhattisgarh, India' } } } }, { queryPrediction: { text: { text: 'ignored' } } }] });
    }
    const place = PLACES[u.pathname.replace('/places/', '')];
    if (place) return reply({ addressComponents: place.map(([longText, type]) => ({ longText, types: [type] })) });
    return reply({}, 404);
  });
});
await new Promise((r) => fake.listen(4993, r));

let pass = 0, failed = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${extra}`); } };
const newIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
const get = (path, headers = {}) => fetch(BASE + path, { redirect: 'manual', headers: { 'x-forwarded-for': newIp(), ...headers } });
const suggest = async (input, ip) => (await get(`/api/places/autocomplete?${new URLSearchParams({ input, session: 'session-12345' })}`, ip ? { 'x-forwarded-for': ip } : {})).json();
const details = (id, main, ip) => get(`/api/places/details?${new URLSearchParams({ id, main, session: 'session-12345' })}`, ip ? { 'x-forwarded-for': ip } : {});
const page = async (path) => (await get(path)).text();

console.log('Autocomplete');
const a = await suggest('nehru');
const ac = calls.at(-1);
ok(a.source === 'google' && a.suggestions.length === 1, 'returns Google suggestions, skipping non-place ones', JSON.stringify(a));
ok(a.suggestions[0].main === 'Nehru Nagar' && a.suggestions[0].secondary.startsWith('Bhilai'), 'splits name and address');
ok(!JSON.stringify(a).includes('test'), 'no key in the reply');
ok(ac.key === 'test' && !('key' in ac.q), 'key goes in a header, not the URL');
ok(ac.body.sessionToken === 'session-12345', 'session token is passed on');
ok(ac.body.includedRegionCodes[0] === 'in' && ac.body.locationBias.rectangle, 'India only, leaning to Chhattisgarh');
ok(ac.mask?.startsWith('suggestions.placePrediction'), 'sends a field mask');

await suggest('2 BHK in Durg');
ok(calls.at(-1).body.input === 'durg', 'asks Google about the place, not the filter words', calls.at(-1).body?.input);
let n = calls.length;
await suggest('2 BHK');
ok(calls.length === n, 'filter words alone cost no Google call');
await suggest('du');
ok(calls.length === n, 'two letters cost no Google call');
const blank = await suggest('nothinghere');
ok(blank.source === 'local', 'Google finding nothing falls back to our list');

failing = true;
const down = await suggest('supela');
ok(down.source === 'local' && down.suggestions[0]?.main === 'Supela' && down.suggestions[0].href, 'Google failing falls back to our list', JSON.stringify(down));
ok(!JSON.stringify(down).includes('API key not valid'), 'Google errors stay on the server');
failing = false;

const ip = newIp();
let local = 0;
for (let i = 0; i < 62; i++) if ((await suggest('raipur', ip)).source === 'local') local++;
ok(local === 2, 'over 60 a minute from one IP stops reaching Google', `local=${local}`);
ok((await get('/api/places/autocomplete?input=raipur', { origin: 'https://evil.example' })).status === 403, 'other sites are refused');

console.log('Details');
let d = await details('ChIJ_nehru_bhilai', 'Nehru Nagar');
let dc = calls.at(-1);
ok((await d.json()).href === '/properties?location=Nehru+Nagar&city=bhilai', 'a place in our city links to its listings');
ok(dc.mask === 'addressComponents', 'asks only for the cheap field', dc.mask);
ok(dc.q.sessionToken === 'session-12345', 'closes the billing session');
d = await details('ChIJ_nehru_delhi', 'Nehru Nagar');
ok((await d.json()).href === '/properties?location=Nehru+Nagar&outside=1', 'Nehru Nagar, Delhi is marked outside');
d = await details('ChIJ_kumhari_town', 'Kumhari');
ok((await d.json()).href === '/properties?location=Kumhari&city=durg', 'a town we do not list uses its district');
n = calls.length;
ok((await details('../../etc/passwd', 'x')).status === 400 && calls.length === n, 'a bad id never reaches Google');
ok((await details('ChIJ_nehru_bhilai', '')).status === 400, 'a missing name is refused');
failing = true;
ok((await details('ChIJ_nehru_bhilai', 'Nehru Nagar')).status === 502, 'Google failing is reported so the bar can fall back');
failing = false;
const ip2 = newIp();
const codes = [];
for (let i = 0; i < 21; i++) codes.push((await details('ChIJ_nehru_bhilai', 'Nehru Nagar', ip2)).status);
ok(codes.at(-1) === 429 && codes[19] === 200, 'over 20 a minute from one IP is refused');

console.log('Result pages');
const redirectTo = async (path) => { const r = await get(path); return [r.status, r.headers.get('location')]; };
let [status, loc] = await redirectTo('/properties?q=2%20BHK%20in%20Durg');
ok(status === 307 && loc === '/properties?location=Durg&city=durg&bhk=2+BHK', 'typed text redirects to clean parts', `${status} ${loc}`);
[status, loc] = await redirectTo('/search?city=bhilai&type=pg');
ok(status === 308 && loc === '/properties?city=bhilai&type=pg', 'old /search links redirect with their query', `${status} ${loc}`);

const all = await page('/properties');
ok(all.includes('in Chhattisgarh') && all.includes('Show places'), 'no search shows everything, with filters');
const durg = await page('/properties?location=Durg&city=durg');
ok(durg.includes('in Durg') && /\d+<!-- --> place/.test(durg), 'a city shows its listings');
const areas = await page('/properties?location=Bhilai&city=bhilai');
ok(areas.includes('All areas') && areas.includes('Supela'), 'a city offers an area filter');
const fallback = await page('/properties?location=Kumhari&city=durg');
ok(fallback.includes('so here is everything in') && fallback.includes('Durg'), 'an empty place falls back to its city, and says so');
const nomatch = await page('/properties?location=Zzzville');
ok(nomatch.includes('find “') && !nomatch.includes('Show places'), 'an unknown place says so, with no filters');
const outside = await page('/properties?location=Nehru%20Nagar&outside=1');
ok(outside.includes('We don’t list places in') && !outside.includes('Show places'), 'outside the state shows no listings');
const filtered = await page('/properties?location=Bhilai&city=bhilai&min=9000000');
ok(filtered.includes('Nothing matches these filters') && filtered.includes('Clear filters') && filtered.includes('Show places'), 'filters ruling everything out keep the filters visible');
const chip = await page('/properties?location=Bhilai&city=bhilai&type=pg&bhk=Single%20room');
ok(chip.includes('Remove filter: PGs') && chip.includes('Remove filter: Single room'), 'each filter gets a chip');
ok(chip.includes('href="/properties?location=Bhilai&amp;city=bhilai&amp;bhk=Single+room"'), 'removing a chip keeps the rest');
const sale = await page('/properties?notice=sale&location=Bhilai&city=bhilai');
ok(sale.includes('only lists places on rent'), 'a search for sale listings is told the truth');
const noticeOnly = await redirectTo('/properties?q=villa');
ok(noticeOnly[1] === '/properties?notice=house', 'villa becomes a notice, not a keyword', noticeOnly[1]);
ok((await get('/properties?page=999&location=Bhilai&city=bhilai')).status === 200 && (await page('/properties?page=999&location=Bhilai&city=bhilai')).includes('lcard'), 'a page past the end shows the last page');
ok((await page('/properties?location=%3Cscript%3Ealert(1)%3C/script%3E')).includes('&lt;script&gt;'), 'typed text is escaped');

fake.close();
console.log(`\n${pass} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
