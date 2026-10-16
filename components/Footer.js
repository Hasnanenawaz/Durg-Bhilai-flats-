import Link from 'next/link';
import { CITIES, LANDMARKS } from '@/lib/locations';
import { SITE_NAME, SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/site';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <img src="/logo.png" alt={SITE_NAME} width="636" height="480" style={{ height: 88, width: 'auto', display: 'block', marginBottom: 12 }} />
            <p className="muted small" style={{ maxWidth: '34ch' }}>Flats, PGs, rooms and flatmates across Chhattisgarh. Owners list free. You call them directly. ₹0 brokerage, always.</p>
            <Link href="/list-your-property" className="btn btn-soft btn-sm">List your place free</Link>
          </div>
          <div>
            <h4>Cities</h4>
            <ul>{CITIES.slice(0, 6).map((c) => <li key={c.slug}><Link href={`/rent/${c.slug}`}>Rooms in {c.name}</Link></li>)}</ul>
          </div>
          <div>
            <h4>Popular searches</h4>
            <ul>
              <li><Link href="/rent/bhilai/pg">PG in Bhilai</Link></li>
              <li><Link href="/rent/durg/flats">Flats in Durg</Link></li>
              <li><Link href="/rent/bhilai/flatmates">Flatmates in Bhilai</Link></li>
              {LANDMARKS.slice(0, 3).map((l) => <li key={l.slug}><Link href={`/near/${l.slug}`}>Near {l.name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              {SUPPORT_WHATSAPP && <li><a href={`https://wa.me/${SUPPORT_WHATSAPP}`} rel="noopener">WhatsApp us</a></li>}
              {SUPPORT_EMAIL && <li><a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></li>}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} {SITE_NAME}. Made in Bhilai, Chhattisgarh.</span>
          <span>No brokers. No listing fees. No commission.</span>
        </div>
      </div>
    </footer>
  );
}
