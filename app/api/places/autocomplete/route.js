import { fail, json, sameOrigin, clientIp } from '@/lib/api';
import { autocomplete, overLimit, placesEnabled } from '@/lib/places';
import { localSuggestions, suggestInput } from '@/lib/search-parse';

const PER_MINUTE = 60;

// Always answers with something: our own areas stand in whenever Google is off, failing or rate limited.
export async function GET(req) {
  if (!sameOrigin(req)) return fail('Bad origin', 403);
  const url = new URL(req.url);
  const input = (url.searchParams.get('input') || '').slice(0, 100);
  const local = () => json({ suggestions: localSuggestions(input), source: 'local' });
  const term = suggestInput(input);
  if (!placesEnabled || term.length < 3 || overLimit('autocomplete', clientIp(req), PER_MINUTE)) return local();
  try {
    const suggestions = await autocomplete(term, url.searchParams.get('session'));
    return suggestions.length ? json({ suggestions, source: 'google' }) : local();
  } catch (e) {
    console.error('places autocomplete failed:', e.message);
    return local();
  }
}
