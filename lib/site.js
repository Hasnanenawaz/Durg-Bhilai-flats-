export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Durg Bhilai Flats & Flatmates';
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '';
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';
export const abs = (p = '/') => `${SITE_URL}${p.startsWith('/') ? p : '/' + p}`;

/** Open Graph block for a page. A page's openGraph replaces the layout's whole, so the shared fields live here.
 *  Routes with their own opengraph-image file get it automatically; an explicit `images` would override it. */
export const og = (path, extra = {}) => ({ type: 'website', locale: 'en_IN', siteName: SITE_NAME, url: abs(path), ...extra });
/** For pages without their own opengraph-image: the site-wide card from app/opengraph-image.js. */
export const ogSite = (path) => og(path, { images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME} – flats, PGs and rooms on rent, zero brokerage` }] });

const inr = new Intl.NumberFormat('en-IN');
export const rupees = (n) => `₹${inr.format(Math.round(n || 0))}`;
export const shortDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const relTime = (d) => {
  if (!d) return '';
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 86400 * 1.5) return 'yesterday';
  if (s < 86400 * 30) { const d = Math.round(s / 86400); return d <= 1 ? 'yesterday' : `${d} days ago`; }
  return shortDate(d);
};
