import { fail, json, sameOrigin, clientIp } from '@/lib/api';
import { overLimit, placeAddress, placesEnabled, validPlaceId } from '@/lib/places';
import { matchPlace, norm, propertiesHref } from '@/lib/search-parse';
import { STATE } from '@/lib/locations';

const PER_MINUTE = 20;

/** Turns a chosen suggestion into the results URL. A failure here makes the search bar fall back to a text search. */
export async function GET(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const name = (url.searchParams.get('main') || '').trim().slice(0, 100);
  if (!validPlaceId(id) || !name) return fail('Bad place');
  if (!placesEnabled) return fail('Places is off', 503);
  if (overLimit('details', clientIp(req), PER_MINUTE)) return fail('Too many requests', 429);
  try {
    const address = await placeAddress(id, url.searchParams.get('session'));
    if (norm(name) === norm(STATE)) return json({ href: propertiesHref() });
    const { city, outside } = matchPlace({ ...address, name });
    return json({ href: propertiesHref({ location: name, city, outside: outside ? '1' : '' }) });
  } catch (e) {
    console.error('places details failed:', e.message);
    return fail('Could not look up that place', 502);
  }
}
