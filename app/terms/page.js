import { SITE_NAME } from '@/lib/site';
export const metadata = { title: 'Terms of Use', alternates: { canonical: '/terms' } };
export default function Terms() {
  return (
    <div className="wrap section prose" style={{ maxWidth: 760 }}>
      <h1>Terms of Use</h1>
      <p>Please review these terms with a legal advisor before launch.</p>
      <h2>What we are</h2>
      <p>{SITE_NAME} is a listing platform. We connect owners and people looking for a place. We are not a party to any rental agreement and do not collect rent, deposits or brokerage.</p>
      <h2>Listing rules</h2>
      <ul>
        <li>List only places you own or currently rent (for flatmates), with honest rent, photos and details.</li>
        <li>No brokers, no commission, no fake or duplicate listings.</li>
        <li>We may edit, hide or remove any listing and block accounts that break these rules.</li>
      </ul>
      <h2>Stay safe</h2>
      <p>Always visit a place and meet the owner before paying anything. Check the agreement and the owner’s ID. We are not responsible for deals made between users.</p>
    </div>
  );
}
