import Link from 'next/link';
import Faq from '@/components/Faq';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'List Your Flat, PG or Room for Free in Durg-Bhilai',
  description: 'Rent out your flat, PG or room in Durg, Bhilai or anywhere in Chhattisgarh for free. No broker, no commission. Tenants call you directly.',
  alternates: { canonical: '/list-your-property' },
};

const FAQ = [
  { q: 'How much does it cost to list my flat?', a: 'Nothing. Listing is free, there is no commission when you find a tenant, and you keep the full rent and deposit.' },
  { q: 'Who will see my phone number?', a: 'Only people who have logged in with a verified mobile number and tapped “Show owner’s number” on your listing. You can see each of them in your Inquiries tab.' },
  { q: 'How fast does my listing go live?', a: 'Our team checks new listings for brokers and fake posts, usually within a day. After that, edits go live straight away.' },
  { q: 'I rent a flat and need a flatmate. Can I post?', a: 'Yes. Choose “Flatmate wanted” when adding your listing and write about the room, the rent share and the kind of flatmate you want.' },
];

export default async function ListYourProperty() {
  const user = await getCurrentUser();
  const start = user ? '/host/new' : '/login?mode=host&next=/host/new';
  return (
    <>
      <section className="hero">
        <div className="hero-bg" aria-hidden="true"><span className="blob blob-2" style={{ top: -120, left: 'auto', right: -60 }} /><span className="blob blob-1" style={{ top: 'auto', bottom: -160, right: 'auto', left: -100 }} /></div>
        <div className="wrap">
          <span className="eyebrow">For owners in Chhattisgarh</span>
          <h1>Keep the full rent. <em>Skip the broker.</em></h1>
          <p className="lead">List your flat, PG or room in Durg, Bhilai or any city in Chhattisgarh. Tenants who are actually looking call you directly.</p>
          <div className="row" style={{ marginTop: 24 }}>
            <Link className="btn btn-warm btn-lg btn-shine" href={start}>List your place free</Link>
            <span className="muted small">Takes about 5 minutes · just your phone number</span>
          </div>
        </div>
      </section>
      <section className="section-tight">
        <div className="wrap">
          <div className="stats reveal reveal-stagger">
            <div className="stat"><b>₹0</b><span>listing fee</span></div>
            <div className="stat"><b>₹0</b><span>commission on rent</span></div>
            <div className="stat"><b>10</b><span>photos per listing</span></div>
            <div className="stat"><b>1 tap</b><span>to mark it rented</span></div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="wrap">
          <h2>How it works</h2>
          <div className="steps-row reveal reveal-stagger" style={{ marginTop: 20 }}>
            <div className="step"><h3>Log in with OTP</h3><p>Enter your mobile number and the 6-digit code. No password to remember.</p></div>
            <div className="step"><h3>Add your place</h3><p>Rent, deposit, area, who it’s for, a few photos. Flat, PG, room or flatmate.</p></div>
            <div className="step"><h3>Take calls, choose your tenant</h3><p>See every person who asked for your number, then mark it rented when you’re done.</p></div>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap grid-2" style={{ gap: 40, alignItems: 'start' }}>
          <div><h2>Owner questions</h2><Link className="btn btn-primary" href={start} style={{ marginTop: 8 }}>List your place free</Link></div>
          <Faq items={FAQ} />
        </div>
      </section>
    </>
  );
}
