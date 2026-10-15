import { db } from '@/lib/db';
import { CITIES, LANDMARKS, LISTING_TYPES } from '@/lib/locations';
import { abs, SITE_NAME } from '@/lib/site';
import { GENERAL_FAQ } from '@/lib/faqs';

export const revalidate = 3600;

// llms.txt: a plain-text map of the site for AI assistants (GEO).
export async function GET() {
  const [live, posts] = await Promise.all([
    db.count('properties', { eq: { status: 'approved' } }),
    db.find('blogs', { eq: { status: 'published' }, order: ['published_at', false], limit: 30 }),
  ]);
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> Zero-brokerage rental platform for Durg, Bhilai and the rest of Chhattisgarh, India. Owners list flats, PGs, rooms and "flatmate wanted" posts for free; tenants log in with a phone OTP and contact owners directly. ${live} live listings.`,
    '',
    'Key facts:',
    '- Brokerage: ₹0 for tenants and owners. Listing is free.',
    '- Contact: tenants see the owner’s phone/WhatsApp after OTP login; no middleman.',
    '- Coverage: ' + CITIES.map((c) => c.name).join(', ') + ' (Chhattisgarh).',
    '- Listing types: ' + LISTING_TYPES.map((t) => t.plural).join(', ') + '.',
    '',
    '## City pages',
    ...CITIES.map((c) => `- [Flats, PGs & rooms in ${c.name}](${abs(`/rent/${c.slug}`)}): ${c.blurb}`),
    '',
    '## Near colleges and workplaces',
    ...LANDMARKS.map((l) => `- [Rooms near ${l.name}](${abs(`/near/${l.slug}`)})`),
    '',
    '## Guides',
    ...posts.map((b) => `- [${b.title}](${abs(`/blog/${b.slug}`)}): ${b.excerpt || ''}`),
    '',
    '## FAQ',
    ...GENERAL_FAQ.map((f) => `- Q: ${f.q}\n  A: ${f.a}`),
    '',
    `## Owners`,
    `- [List a property free](${abs('/list-your-property')})`,
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
