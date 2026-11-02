import { db } from '@/lib/db';
import { CITIES, LANDMARKS, cityBySlug, typeByValue } from '@/lib/locations';
import { abs, rupees, shortDate, SITE_NAME } from '@/lib/site';
import { GENERAL_FAQ } from '@/lib/faqs';

export const revalidate = 3600;

// llms-full.txt: the long companion to /llms.txt with every live listing and full guide text.
// Owner phone numbers and street addresses are left out on purpose; they sit behind OTP login.
export async function GET() {
  const [props, posts] = await Promise.all([
    db.find('properties', { eq: { status: 'approved' }, order: ['updated_at', false], limit: 2000 }),
    db.find('blogs', { eq: { status: 'published' }, order: ['published_at', false], limit: 200 }),
  ]);

  const listing = (p) => {
    const facts = [
      typeByValue(p.listing_type)?.label,
      p.bhk,
      p.furnishing,
      `${rupees(p.rent)}/month`,
      p.deposit ? `deposit ${rupees(p.deposit)}` : null,
      p.food_included ? 'food included' : null,
      [p.locality, cityBySlug(p.city)?.name].filter(Boolean).join(', '),
      p.available_from ? `available from ${shortDate(p.available_from)}` : null,
    ].filter(Boolean);
    return [
      `### [${p.title}](${abs(`/property/${p.slug}`)})`,
      facts.join(' · '),
      p.amenities?.length ? `Amenities: ${p.amenities.join(', ')}` : null,
      p.description ? p.description.replace(/\s+/g, ' ').trim() : null,
      '',
    ].filter((l) => l !== null);
  };

  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> Zero-brokerage rental platform for Durg, Bhilai and the rest of Chhattisgarh, India. This is the full-text version of ${abs('/llms.txt')}. ${props.length} live listings, ${posts.length} guides.`,
    '',
    'Contact owners: log in with a phone OTP on the listing page to see the owner’s phone/WhatsApp. No brokerage for anyone.',
    '',
    '## Live listings',
    '',
    ...(props.length ? props.flatMap(listing) : ['No live listings right now.', '']),
    '## Cities',
    ...CITIES.map((c) => `- [${c.name}](${abs(`/rent/${c.slug}`)}) (${c.district} district): ${c.blurb} Localities: ${c.localities.join(', ')}.`),
    '',
    '## Near colleges and workplaces',
    ...LANDMARKS.map((l) => `- [Rooms near ${l.name}](${abs(`/near/${l.slug}`)}): nearby areas ${l.localities.join(', ')}.`),
    '',
    '## FAQ',
    ...GENERAL_FAQ.flatMap((f) => [`### ${f.q}`, f.a, '']),
    '## Guides',
    '',
    ...posts.flatMap((b) => [
      `### [${b.title}](${abs(`/blog/${b.slug}`)})`,
      `Published ${shortDate(b.published_at)}${b.author ? ` by ${b.author}` : ''}`,
      '',
      (b.content || b.excerpt || '').trim(),
      ...(b.faq?.length ? ['', ...b.faq.flatMap((f) => [`Q: ${f.q}`, `A: ${f.a}`])] : []),
      '',
    ]),
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
