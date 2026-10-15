import Link from 'next/link';
export const metadata = { title: 'About Us – Zero-Brokerage Rentals in Durg-Bhilai', description: 'Why we built Durg Bhilai Flats & Flatmates: a free, broker-free way to find and list flats, PGs and rooms in Chhattisgarh.', alternates: { canonical: '/about' } };
export default function About() {
  return (
    <div className="wrap section" style={{ maxWidth: 760 }}>
      <span className="eyebrow">About</span>
      <h1>We built the site we needed when we moved to Bhilai</h1>
      <div className="prose">
        <p>Finding a room in Durg-Bhilai usually means calling numbers off “To-Let” boards, sharing WhatsApp forwards, and paying a broker a month’s rent just to see a flat. If you’ve just moved here for college, coaching or a job at the plant, you don’t even know whom to ask.</p>
        <p><b>Durg Bhilai Flats &amp; Flatmates</b> is one simple website where owners list their flats, PGs and rooms for free, and people looking for a place contact those owners directly. Nobody sits in between, so nobody takes a cut.</p>
        <h2>What we promise</h2>
        <ul>
          <li><b>₹0 brokerage.</b> Not for tenants, not for owners. Ever.</li>
          <li><b>Real phone numbers.</b> Every account is verified by OTP, so you know there’s a real person on the other side.</li>
          <li><b>Listings checked by people.</b> We review new listings and remove brokers posing as owners.</li>
          <li><b>Your number stays private</b> until you choose to contact someone.</li>
        </ul>
        <p>We started with Durg and Bhilai and now cover Raipur, Bilaspur and the rest of Chhattisgarh.</p>
      </div>
      <div className="row" style={{ marginTop: 28 }}><Link className="btn btn-primary" href="/search">Find a place</Link><Link className="btn btn-ghost" href="/list-your-property">List your place free</Link></div>
    </div>
  );
}
