// Tests the search text parser directly. No server needed.
// Usage: node tests/search-parse.mjs
import { canonicalParams, localSuggestions, locationScope, matchPlace, parentCity, parseQuery, propertiesHref, resolveLocation, suggestInput } from '../lib/search-parse.js';

let pass = 0, failed = 0;
const ok = (cond, name, extra = '') => { if (cond) { pass++; console.log(`  ✓ ${name}`); } else { failed++; console.log(`  ✗ ${name} ${extra}`); } };
const has = (raw, want) => {
  const got = parseQuery(raw);
  const bad = Object.entries(want).filter(([k, v]) => (got[k] || '') !== v);
  ok(!bad.length, `"${raw}"`, `got ${JSON.stringify(got)}`);
};

console.log('Reading typed searches');
has('2 BHK in Durg', { location: 'Durg', city: 'durg', bhk: '2 BHK', q: '' });
has('2 bhk flat for rent in durg', { location: 'Durg', city: 'durg', bhk: '2 BHK', type: 'flat', q: '' });
has('PG near IIT Bhilai', { location: 'IIT Bhilai', city: 'durg', type: 'pg', q: '' });
has('girls pg in supela under 8000', { location: 'Supela', tenant: 'girls', type: 'pg', max: '8000', q: '' });
has('flats in Raipur under 15k', { location: 'Raipur', city: 'raipur', type: 'flat', max: '15000' });
has('Nehru Nagar Bhilai', { location: 'Nehru Nagar', city: 'bhilai' });
has('Bhillai', { location: 'Bhilai', city: 'bhilai' });
has('Supella', { location: 'Supela' });
has('flats in Kumhari', { location: 'Kumhari', type: 'flat' });
has('भिलाई', { location: 'Bhilai', city: 'bhilai' });
has('villa in Durg', { location: 'Durg', notice: 'house' });
has('flat for sale in Durg', { location: 'Durg', notice: 'sale', type: 'flat' });
has('commercial shop in Bhilai', { location: 'Bhilai', notice: 'commercial' });
has('wifi', { q: 'wifi' });
has('', { q: '' });

console.log('Finding the place');
ok(resolveLocation('Nehru Nagar', 'bilaspur')?.city === 'bilaspur', 'the city given decides which Nehru Nagar');
ok(resolveLocation('Supela', 'durg')?.kind === 'unknown', 'an area named with the wrong city is not trusted');
ok(resolveLocation('', '') === null, 'no location means no place');
ok(resolveLocation('', 'durg')?.kind === 'city', 'city alone is a place');
ok(parentCity(resolveLocation('Supela')) === 'bhilai', 'Supela falls back to Bhilai');
ok(parentCity(resolveLocation('Kumhari', 'durg')) === 'durg', 'an unknown place with a city falls back to that city');
ok(parentCity(resolveLocation('Kumhari')) === '', 'an unknown place with no city has nothing to fall back to');
ok(locationScope(resolveLocation('Durg')).anyOf[0][0][1] === 'eq', 'a city search matches on the city column');
ok(locationScope(resolveLocation('Supela')).anyOf[0].every(([, op]) => op === 'like'), 'an area search looks through the text columns');

console.log('Clean URLs');
const c = canonicalParams({ q: '2 BHK in Durg' });
ok(propertiesHref(c) === '/properties?location=Durg&city=durg&bhk=2+BHK', 'typed text becomes separate parts', propertiesHref(c));
ok(canonicalParams({ location: 'Durg', city: 'durg' }) === null, 'nothing typed, no redirect');
ok(canonicalParams({ q: 'wifi' }) === null, 'plain keyword stays, so no redirect loop');
const twice = canonicalParams({ q: 'the wifi' });
ok(twice && canonicalParams(twice) === null, 'settles after one redirect');
const old = canonicalParams({ city: 'bhilai', type: 'pg', q: 'supela' });
ok(old.location === 'Supela' && old.city === 'bhilai' && old.type === 'pg' && !old.q, 'old /search links keep city and type');
ok(canonicalParams({ type: 'pg', q: '2 bhk flat in Durg' }).type === 'pg', 'a filter already set beats a typed word');
ok(propertiesHref() === '/properties', 'no empty query string');

console.log('Search bar helpers');
ok(suggestInput('2 BHK in Durg') === 'durg', 'asks about the place only');
ok(suggestInput('2 BHK') === '', 'asks nothing when no place was typed');
const near = localSuggestions('nehru');
ok(near.length === 2 && near.every((s) => s.href.startsWith('/properties?')), 'our own list offers both Nehru Nagars', JSON.stringify(near));
ok(localSuggestions('d').length === 0, 'one letter suggests nothing');

console.log('Matching Google places');
ok(matchPlace({ name: 'Nehru Nagar', city: 'Bhilai', state: 'Chhattisgarh' }).city === 'bhilai', 'Nehru Nagar, Bhilai');
ok(matchPlace({ name: 'Nehru Nagar', city: 'New Delhi', state: 'Delhi' }).outside === true, 'Nehru Nagar, Delhi is outside');
const kum = matchPlace({ name: 'Kumhari', city: 'Kumhari', district: 'Durg', state: 'Chhattisgarh' });
ok(kum.city === 'durg' && !kum.outside, 'a town we do not list uses its district');
const none = matchPlace({ name: 'Zzzville', state: 'Chhattisgarh' });
ok(none.city === '' && !none.outside, 'unknown place inside the state is not called outside');

console.log(`\n${pass} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
