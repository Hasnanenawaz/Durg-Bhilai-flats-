export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Durg Bhilai Flats & Flatmates';
export const SUPPORT_WHATSAPP = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '';
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';
export const abs = (p = '/') => `${SITE_URL}${p.startsWith('/') ? p : '/' + p}`;

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
