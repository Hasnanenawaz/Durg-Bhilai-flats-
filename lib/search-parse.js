// Understands what a visitor typed: "2 bhk flat for rent in Durg" → location + filters.
// No server imports: the search bar uses this in the browser and tests run it directly in Node.
import { CITIES, LANDMARKS, STATE, cityBySlug } from './locations.js';

const CITY_ALIASES = {
  bhilai: ['bhilai nagar', 'bhilainagar', 'bhilai city'],
  durg: ['durg city'],
  raipur: ['raipur city'],
};
const STOP = new Set('in at near nearby around close to by for the a an of on with me my i am looking want need show find search get property properties place places home homes available and or city area locality district chhattisgarh cg india'.split(' '));
const PREPOSITION = /(^|\s)(in|at|near|around)\s/;

export const norm = (s) => String(s ?? '')
  .toLowerCase().normalize('NFKC')
  .replace(/(\d),(?=\d)/g, '$1')
  .replace(/[^\p{L}\p{M}\p{N}+\s]/gu, ' ')
  .replace(/\s+/g, ' ').trim();

const titleCase = (s) => s.replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());

// ───────────────────────── Catalogue of places we know about ─────────────────────────
const INDEX = new Map();
const add = (key, entry) => { const k = norm(key); if (k && !INDEX.has(k)) INDEX.set(k, entry); };
for (const c of CITIES) {
  const entry = { kind: 'city', name: c.name, city: c.slug };
  [c.name, c.hindi, ...(CITY_ALIASES[c.slug] || [])].forEach((k) => add(k, entry));
}
for (const l of LANDMARKS) {
  const entry = { kind: 'landmark', name: l.name, city: l.city, landmark: l };
  [l.name, l.name.split(',')[0]].forEach((k) => add(k, entry));
}
for (const c of CITIES) {
  for (const name of c.localities) {
    const known = INDEX.get(norm(name));
    if (known?.kind === 'locality') known.cities.push(c.slug);
    else add(name, { kind: 'locality', name, cities: [c.slug] });
  }
}
const MAX_WORDS = Math.max(...[...INDEX.keys()].map((k) => k.split(' ').length));

/** Finds exact catalogue phrases, longest first, so "IIT Bhilai" isn't read as the city Bhilai. */
function scanExact(tokens) {
  const used = new Array(tokens.length).fill(false);
  const hits = [];
  for (let n = Math.min(MAX_WORDS, tokens.length); n > 0; n--) {
    for (let i = 0; i + n <= tokens.length; i++) {
      if (used.slice(i, i + n).some(Boolean)) continue;
      const key = tokens.slice(i, i + n).join(' ');
      const entry = INDEX.get(key);
      if (!entry) continue;
      hits.push({ key, at: i, entry });
      for (let j = i; j < i + n; j++) used[j] = true;
    }
  }
  hits.sort((a, b) => a.at - b.at);
  return { hits, rest: tokens.filter((_, i) => !used[i]) };
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 9;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/** Spelling slips: "Bhillai", "Supella", "Raipr". Short words get less room so "Durg" can't become something else. */
function fuzzyEntry(word) {
  if (word.length < 4) return null;
  const allowed = word.length >= 8 ? 2 : 1;
  let best = null;
  let bestDistance = allowed + 1;
  for (const [key, entry] of INDEX) {
    if (key[0] !== word[0]) continue;
    const d = editDistance(word, key);
    if (d < bestDistance || (d === bestDistance && best && entry.kind === 'city' && best.kind !== 'city')) { best = entry; bestDistance = d; }
  }
  return best;
}

/** Partial names: "bhil" → Bhilai, "nehru" → Nehru Nagar. Only when just one place fits. */
function prefixEntry(text) {
  if (text.length < 3) return null;
  const found = new Set();
  for (const [key, entry] of INDEX) if (key.startsWith(text)) found.add(entry);
  return found.size === 1 ? [...found][0] : null;
}

/** Fuzzy and partial matching for words the exact scan left over. Returns the entry and the unused words. */
function scanLoose(words) {
  for (let i = 0; i + 1 < words.length; i++) {
    const entry = fuzzyEntry(`${words[i]} ${words[i + 1]}`);
    if (entry) return { entry, rest: words.filter((_, j) => j !== i && j !== i + 1) };
  }
  for (let i = 0; i < words.length; i++) {
    const entry = fuzzyEntry(words[i]);
    if (entry) return { entry, rest: words.filter((_, j) => j !== i) };
  }
  const entry = prefixEntry(words.join(' '));
  return entry ? { entry, rest: [] } : { entry: null, rest: words };
}

/** Picks the most specific place among the hits; a city named alongside it says which one it is in. */
function pickPlace(entries) {
  const place = entries.find((e) => e.kind === 'landmark') || entries.find((e) => e.kind === 'locality') || entries.find((e) => e.kind === 'city');
  if (!place) return null;
  const named = entries.find((e) => e.kind === 'city')?.city;
  return { place, city: named || place.city || '' };
}

// ───────────────────────── Filter words ─────────────────────────
const RULES = [
  [/\b(?:under|below|upto|up to|within|less than|max|maximum|budget)\s*(?:rs|inr)?\s*(\d+)\s*(k)?\b(?:\s*(?:rs|rupees))?/g, (o, m) => { o.max = String(m[1] * (m[2] ? 1000 : 1)); }],
  [/\b(?:above|over|more than|min|minimum|from)\s*(?:rs|inr)?\s*(\d+)\s*(k)?\b(?:\s*(?:rs|rupees))?/g, (o, m) => { o.min = String(m[1] * (m[2] ? 1000 : 1)); }],
  [/\b1\s*rk\b/g, (o) => { o.bhk = '1 RK'; }],
  [/\b(\d)\s*\+?\s*bhk\b/g, (o, m) => { o.bhk = Number(m[1]) >= 4 ? '4+ BHK' : `${m[1]} BHK`; }],
  [/\bsingle rooms?\b/g, (o) => { o.bhk = 'Single room'; }],
  [/\b(?:shared|sharing) rooms?\b/g, (o) => { o.bhk = 'Shared room'; }],
  [/\b(?:semi furnished|semifurnished)\b/g, (o) => { o.furnishing = 'Semi-furnished'; }],
  [/\bunfurnished\b/g, (o) => { o.furnishing = 'Unfurnished'; }],
  [/\b(?:fully furnished|furnished)\b/g, (o) => { o.furnishing = 'Fully furnished'; }],
  [/\b(?:boys?|men|gents|male)\b/g, (o) => { o.tenant = 'boys'; }],
  [/\b(?:girls?|women|ladies|female)\b/g, (o) => { o.tenant = 'girls'; }],
  [/\b(?:family|families)\b/g, (o) => { o.tenant = 'family'; }],
  [/\bstudents?\b/g, (o) => { o.tenant = 'students'; }],
  [/\b(?:working|working professionals?|professionals?)\b/g, (o) => { o.tenant = 'working'; }],
  [/\b(?:flat ?mates?|room ?mates?)\b/g, (o) => { o.type = 'flatmate'; }],
  [/\b(?:flats?|apartments?|appartments?)\b/g, (o) => { o.type = 'flat'; }],
  [/\b(?:pgs?|paying guests?|hostels?)\b/g, (o) => { o.type = 'pg'; }],
  [/\brooms?\b/g, (o) => { o.type = 'room'; }],
  // Not things this site has data for. Said out loud on the results page instead of being silently dropped.
  [/\b(?:for sale|sale|buy|buying|purchase|resale)\b/g, (o) => { o.notice = 'sale'; }],
  [/\b(?:commercial|shops?|offices?|showrooms?|warehouses?|godowns?|plots?|land)\b/g, (o) => { o.notice = 'commercial'; }],
  [/\b(?:independent house|houses?|villas?|bungalows?|kothi|duplex)\b/g, (o) => { o.notice ||= 'house'; }],
  [/\b(?:on rent|for rent|rent|rental|rentals|kiraya|kiraye)\b/g, () => {}],
];

function stripFilters(text, out = {}) {
  let t = text;
  for (const [re, apply] of RULES) {
    t = t.replace(re, (...args) => { apply(out, args); return ' '; }).replace(/\s+/g, ' ').trim();
  }
  return { text: t, out };
}
const dropStop = (words) => words.filter((w) => !STOP.has(w));

/**
 * Reads a free-text search. Everything it returns is optional.
 * @returns {{location?: string, city?: string, type?: string, bhk?: string, furnishing?: string, tenant?: string, min?: string, max?: string, notice?: string, q: string}}
 */
export function parseQuery(raw) {
  const text = norm(raw);
  const { hits, rest } = scanExact(text.split(' ').filter(Boolean));
  const { text: leftover, out } = stripFilters(rest.join(' '));
  const hadPreposition = PREPOSITION.test(` ${leftover} `) || PREPOSITION.test(` ${text} `);
  let words = dropStop(leftover.split(' ').filter(Boolean));
  const entries = hits.map((h) => h.entry);
  if (!entries.length && words.length) {
    const loose = scanLoose(words);
    if (loose.entry) { entries.push(loose.entry); words = loose.rest; }
  }
  const picked = pickPlace(entries);
  if (picked) {
    out.location = picked.place.name;
    if (picked.city) out.city = picked.city;
    // Extra places in the text beyond the two we used still narrow the search as keywords.
    const extra = entries.filter((e) => e !== picked.place && e.city !== picked.city).map((e) => norm(e.name));
    words = [...extra, ...words];
  } else if (words.length && hadPreposition) {
    // "flats in Kumhari": clearly a place, just not one we have on file.
    out.location = titleCase(words.join(' '));
    words = [];
  }
  out.q = words.join(' ');
  return out;
}

/**
 * Turns a location name into what the database should look for.
 * @returns {{kind: 'city'|'locality'|'landmark'|'unknown', name: string, city?: string, cities?: string[], landmark?: object} | null}
 */
export function resolveLocation(text, hintCity = '') {
  const hint = cityBySlug(hintCity) ? hintCity : '';
  const display = String(text ?? '').trim();
  if (!display) {
    const c = cityBySlug(hint);
    return c ? { kind: 'city', name: c.name, city: c.slug } : null;
  }
  const { hits, rest } = scanExact(norm(display).split(' ').filter(Boolean));
  const entries = hits.map((h) => h.entry);
  if (!entries.length) {
    const loose = scanLoose(dropStop(rest));
    if (loose.entry) entries.push(loose.entry);
  }
  const picked = pickPlace(entries);
  if (!picked) return { kind: 'unknown', name: display, city: hint };
  const { place } = picked;
  const city = picked.city || hint;
  if (place.kind === 'locality') {
    // Same name in another city (Nehru Nagar is in Bhilai and Bilaspur): only trust it for the city we were told.
    if (city && !place.cities.includes(city)) return { kind: 'unknown', name: display, city };
    return { kind: 'locality', name: place.name, cities: place.cities, city };
  }
  if (place.kind === 'landmark') return { kind: 'landmark', name: place.name, city: place.city, landmark: place.landmark };
  return { kind: 'city', name: place.name, city: place.city };
}

const contains = (cols, term) => cols.map((c) => [c, 'like', term]);
export const KEYWORD_COLS = ['title', 'locality', 'landmark', 'address', 'description', 'pincode'];

/** The database conditions for a location. A row matches if any one condition in a group holds. */
export function locationScope(loc) {
  if (!loc) return {};
  if (loc.kind === 'city') {
    // Every listing in the city, plus any whose address clearly says it is there.
    return { anyOf: [[['city', 'eq', loc.city], ...contains(['locality', 'landmark', 'address'], loc.name)]] };
  }
  if (loc.kind === 'locality') {
    return { ...(loc.city ? { city: loc.city } : {}), anyOf: [contains(['locality', 'landmark', 'address', 'title'], loc.name)] };
  }
  if (loc.kind === 'landmark') {
    const short = loc.name.split(',')[0];
    return { anyOf: [[...loc.landmark.localities.map((l) => ['locality', 'ieq', l]), ...contains(['landmark', 'address', 'title', 'description'], short)]] };
  }
  return { ...(loc.city ? { city: loc.city } : {}), anyOf: [contains(KEYWORD_COLS, loc.name)] };
}

/** The wider city to show when nothing matches the exact place. */
export function parentCity(loc) {
  if (!loc || loc.kind === 'city') return '';
  if (loc.city) return loc.city;
  if (loc.cities?.length === 1) return loc.cities[0];
  return loc.cities?.find((s) => cityBySlug(s)?.primary) || loc.cities?.[0] || '';
}

// ───────────────────────── URLs ─────────────────────────
export const PLACE_KEYS = ['location', 'city', 'outside'];
export const FILTER_KEYS = ['type', 'bhk', 'furnishing', 'tenant', 'min', 'max', 'locality', 'q'];
export const ALL_KEYS = [...PLACE_KEYS, ...FILTER_KEYS, 'sort', 'notice'];

export function propertiesHref(params = {}) {
  const u = new URLSearchParams();
  for (const k of ALL_KEYS) if (params[k]) u.set(k, params[k]);
  const s = u.toString();
  return `/properties${s ? `?${s}` : ''}`;
}

/**
 * /properties?q=2+BHK+in+Durg should become /properties?location=Durg&city=durg&bhk=2+BHK, so each part
 * can be removed on its own and the URL says exactly what is shown. Returns null when nothing changes.
 */
export function canonicalParams(params) {
  if (!params.q) return null;
  const p = parseQuery(params.q);
  const structured = ['location', 'type', 'bhk', 'furnishing', 'tenant', 'min', 'max', 'notice'].some((k) => p[k]);
  if (!structured && p.q === norm(params.q)) return null;
  const next = { ...params, q: p.q };
  for (const k of ['type', 'bhk', 'furnishing', 'tenant', 'min', 'max', 'notice']) if (p[k] && !next[k]) next[k] = p[k];
  if (p.location) {
    const keepCity = !p.city && resolveLocation(p.location, params.city).kind === 'locality' && params.city;
    Object.assign(next, { location: p.location, city: p.city || keepCity || '', outside: '' });
  }
  return next;
}

// ───────────────────────── Search bar helpers ─────────────────────────
/** The location part of what's typed, so "2 BHK in Durg" asks Google about "durg" and "2 BHK" asks nothing. */
export function suggestInput(raw) {
  const { hits, rest } = scanExact(norm(raw).split(' ').filter(Boolean));
  const left = dropStop(stripFilters(rest.join(' ')).text.split(' ').filter(Boolean));
  return [...hits.map((h) => h.key), ...left].join(' ');
}

/** Our own areas, used only when Google isn't set up or fails, so the search box never goes dead. */
export function localSuggestions(raw, limit = 6) {
  const t = suggestInput(raw);
  if (t.length < 2) return [];
  const seen = new Set();
  const out = [];
  const scored = [...INDEX.entries()]
    .map(([key, entry]) => ({ entry, score: key.startsWith(t) ? 0 : key.includes(t) ? 1 : 2 }))
    .filter((x) => x.score < 2)
    .sort((a, b) => a.score - b.score || ({ city: 0, landmark: 1, locality: 2 }[a.entry.kind] - { city: 0, landmark: 1, locality: 2 }[b.entry.kind]));
  for (const { entry } of scored) {
    for (const city of entry.cities || [entry.city]) {
      const id = `${entry.name}|${city}`;
      if (seen.has(id) || out.length >= limit) continue;
      seen.add(id);
      const cityName = cityBySlug(city)?.name;
      out.push({
        id, main: entry.name,
        secondary: entry.kind === 'city' ? `${STATE}, India` : `${cityName}, ${STATE}`,
        href: propertiesHref({ location: entry.name, city }),
      });
    }
  }
  return out;
}

/** Links a place Google identified to our listings: which of our cities it is in, or that it's out of our area. */
export function matchPlace(place) {
  if (place.state && norm(place.state) !== norm(STATE)) return { city: '', outside: true };
  for (const name of [place.city, place.name, place.district]) {
    if (!name) continue;
    const loc = resolveLocation(name);
    const city = loc?.city || (loc?.cities?.length ? parentCity(loc) : '');
    if (city) return { city, outside: false };
  }
  return { city: '', outside: false };
}
