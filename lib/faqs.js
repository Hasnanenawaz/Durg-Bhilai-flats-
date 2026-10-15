import { cityBySlug } from './locations';
import { rupees } from './site';

export const GENERAL_FAQ = [
  { q: 'Is Durg Bhilai Flats & Flatmates really free?', a: 'Yes. Owners list flats, PGs and rooms for free, and tenants search and contact owners for free. There is no brokerage, no listing fee and no commission on either side.' },
  { q: 'How do I contact the owner of a flat or PG?', a: 'Log in with your mobile number using a one-time password (OTP), open the listing and tap "Show owner’s number". You can then call or WhatsApp the owner directly. Nobody sits in between.' },
  { q: 'Who can list a property?', a: 'Any owner, or a tenant looking for a flatmate, can list for free. Create an account with your phone number, switch to Host mode and add your place with rent, location, photos and contact details.' },
  { q: 'Which cities do you cover?', a: 'We started in Durg and Bhilai and now accept listings across Chhattisgarh, including Raipur, Bilaspur, Rajnandgaon, Korba, Raigarh, Jagdalpur, Ambikapur and Dhamtari.' },
  { q: 'Should I pay an advance before seeing a room?', a: 'No. Never pay a token amount or deposit before you visit the place and meet the owner in person. If anyone asks for money upfront, report the listing and we will check it.' },
  { q: 'Can I find a flatmate here?', a: 'Yes. Tenants who already have a flat can post a "Flatmate wanted" listing, and people looking to share can browse those listings in every city.' },
];

export function cityFaq(slug, stats) {
  const c = cityBySlug(slug);
  if (!c) return GENERAL_FAQ;
  const list = [
    {
      q: `How can I find a flat or PG in ${c.name} without a broker?`,
      a: `Search ${c.name} on Durg Bhilai Flats & Flatmates, filter by area, rent and type, and call the owner directly after logging in with OTP. Every listing is posted by the owner or current tenant, so there is no brokerage to pay.`,
    },
  ];
  if (stats) {
    list.push({
      q: `What is the rent for a room or flat in ${c.name}?`,
      a: `Across ${stats.count} live listings in ${c.name} right now, monthly rent ranges from ${rupees(stats.min)} to ${rupees(stats.max)}, with a typical (median) rent of ${rupees(stats.median)}. PGs and single rooms are usually at the lower end and 2–3 BHK flats at the higher end.`,
    });
  }
  list.push(
    { q: `Which areas in ${c.name} are popular for renting?`, a: `People commonly look in ${c.localities.slice(0, 6).join(', ')}. Pick the area closest to your college or office to save on daily travel.` },
    { q: `Is it free to list my flat in ${c.name}?`, a: `Yes. Listing a flat, PG, room or flatmate requirement in ${c.name} is completely free, and tenants contact you directly on call or WhatsApp.` },
  );
  return list;
}
