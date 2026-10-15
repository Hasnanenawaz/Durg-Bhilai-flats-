import Faq from '@/components/Faq';
import { GENERAL_FAQ } from '@/lib/faqs';
export const metadata = { title: 'FAQ – Renting Flats, PGs & Rooms in Durg-Bhilai', description: 'Answers about finding and listing flats, PGs, rooms and flatmates in Durg, Bhilai and Chhattisgarh with zero brokerage.', alternates: { canonical: '/faq' } };
const MORE = [
  { q: 'Do I need separate accounts to rent and to list?', a: 'No. One phone number gives you one account. Use the Guest / Host switch at the top to move between finding a place and managing your listings.' },
  { q: 'Is my phone number shown publicly?', a: 'No. Owners’ numbers are shown only to logged-in users who tap “Show owner’s number”, and tenants’ numbers are shared only with the owner they contacted.' },
  { q: 'How do I remove my listing once it’s rented?', a: 'Go to Host → My listings and tap “Mark rented”. The listing stops appearing in search. You can relist it later with one tap.' },
  { q: 'Can brokers list on the site?', a: 'No. The site is for owners and for tenants looking for flatmates. Report any listing where a broker asks for commission and we will remove it.' },
];
export default function FaqPage() {
  return (
    <div className="wrap section" style={{ maxWidth: 820 }}>
      <span className="eyebrow">FAQ</span>
      <h1>Questions about renting here</h1>
      <Faq items={[...GENERAL_FAQ, ...MORE]} />
    </div>
  );
}
