import 'server-only';
import { searchProperties } from './models';
import { cityBySlug, typeByValue, tenantLabel } from './locations';
import { ALL_KEYS, FILTER_KEYS, locationScope, parentCity, propertiesHref, resolveLocation } from './search-parse';
import { rupees } from './site';

const SORTS = ['rent_asc', 'rent_desc'];
const NOTICES = {
  sale: 'This site only lists places on rent, so nothing here is for sale. These are the rentals we found.',
  commercial: 'Shops, offices and plots aren’t listed here. These are the homes on rent we found.',
  house: 'Independent houses and villas aren’t a separate category here. These are the flats, PGs and rooms on rent we found.',
};

/** Only the keys we use, as short strings, with anything invalid dropped. */
export function readParams(sp) {
  const p = Object.fromEntries(ALL_KEYS.map((k) => [k, typeof sp[k] === 'string' ? sp[k].trim().slice(0, 100) : '']));
  if (!SORTS.includes(p.sort)) p.sort = '';
  if (!NOTICES[p.notice]) p.notice = '';
  if (!typeByValue(p.type)) p.type = '';
  if (!cityBySlug(p.city)) p.city = '';
  return p;
}

export const noticeText = (key) => NOTICES[key] || '';

const asCity = (slug) => {
  const c = cityBySlug(slug);
  return c ? { kind: 'city', name: c.name, city: c.slug } : null;
};

async function fetchPage(filters, loc, page, perPage) {
  const f = { ...filters, ...locationScope(loc) };
  const r = await searchProperties(f, { limit: perPage, offset: (page - 1) * perPage });
  if (r.rows.length || !r.total) return { ...r, page };
  // A page past the end, usually an old link: show the last real page.
  const last = Math.ceil(r.total / perPage);
  return { ...(await searchProperties(f, { limit: perPage, offset: (last - 1) * perPage })), page: last };
}

const hasListings = async (loc) => (await searchProperties(locationScope(loc), { limit: 1 })).total > 0;

/**
 * Runs the search and says which situation the page is in:
 * results | fallback (nothing in that place, showing its city) | filtered-empty (the filters ruled everything out)
 * | no-listings (a place we know, nothing there) | no-match (a place we don't know) | outside (not in Chhattisgarh) | error
 * `place` is the location the rows or the message are about.
 */
export async function runSearch(params, page, perPage) {
  const loc = resolveLocation(params.location, params.city);
  const empty = { rows: [], total: 0, page: 1, place: loc };
  if (params.outside) return { ...empty, state: 'outside' };
  const filters = Object.fromEntries([...FILTER_KEYS, 'sort'].map((k) => [k, params[k]]));
  const filtered = FILTER_KEYS.some((k) => params[k]);
  try {
    const exact = await fetchPage(filters, loc, page, perPage);
    if (exact.total) return { ...exact, place: loc, state: 'results' };
    if (filtered && await hasListings(loc)) return { ...empty, state: 'filtered-empty' };
    const wider = asCity(parentCity(loc));
    if (wider) {
      const r = await fetchPage(filters, wider, page, perPage);
      if (r.total) return { ...r, place: wider, state: 'fallback' };
      if (filtered && await hasListings(wider)) return { ...empty, place: wider, state: 'filtered-empty' };
    }
    return { ...empty, state: loc?.kind === 'unknown' && !wider ? 'no-match' : 'no-listings' };
  } catch (e) {
    console.error('search failed:', e);
    return { ...empty, state: 'error' };
  }
}

/** One removable chip per active filter. The location stays: the search box above the results changes that. */
export function filterChips(p) {
  const labels = {
    type: typeByValue(p.type)?.plural,
    bhk: p.bhk,
    furnishing: p.furnishing,
    tenant: p.tenant && p.tenant !== 'any' ? `For ${tenantLabel(p.tenant).toLowerCase()}` : '',
    min: p.min ? `From ${rupees(Number(p.min.replace(/\D/g, '')))}` : '',
    max: p.max ? `Up to ${rupees(Number(p.max.replace(/\D/g, '')))}` : '',
    locality: p.locality,
    q: p.q ? `“${p.q}”` : '',
  };
  return FILTER_KEYS.filter((k) => labels[k]).map((k) => ({ key: k, label: labels[k], href: propertiesHref({ ...p, [k]: '' }) }));
}
