import Link from 'next/link';
import { rupees, relTime } from '@/lib/site';
import { cityBySlug, typeByValue, tenantLabel } from '@/lib/locations';

export function headline(p) {
  if (p.listing_type === 'flat') return `${p.bhk || ''} Flat`.trim();
  if (p.listing_type === 'flatmate') return 'Flatmate wanted';
  if (p.listing_type === 'pg') return p.bhk ? `PG · ${p.bhk}` : 'PG';
  return p.bhk || 'Room';
}

const ICONS = {
  flat: <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M8 8h3M8 12h3M8 16h3M3 21h18" />,
  pg: <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 18v2M21 18v2M6 10V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />,
  room: <path d="M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17M3 21h18M15 12h.01" />,
  flatmate: <><circle cx="9" cy="8" r="3.2" /><circle cx="17" cy="9" r="2.6" /><path d="M3 20a6 6 0 0 1 12 0M14.5 15.5A5 5 0 0 1 21 20" /></>,
};
export const TypeIcon = ({ type, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{ICONS[type] || ICONS.room}</svg>
);

export default function PropertyCard({ p, showStatus = false }) {
  const city = cityBySlug(p.city);
  const img = p.images?.[0]?.url;
  const t = typeByValue(p.listing_type);
  return (
    <Link href={`/property/${p.slug}`} className={`lcard t-${p.listing_type}`}>
      {img ? (
        <div style={{ borderRadius: 10, overflow: 'hidden', width: 92, height: 92 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="lthumb" src={img} alt={`${headline(p)} in ${p.locality}, ${city?.name}`} loading="lazy" width="92" height="92" />
        </div>
      ) : (
        <div className="lthumb-ph" aria-hidden="true"><TypeIcon type={p.listing_type} /><span className="xs">{t?.label}</span></div>
      )}
      <div style={{ minWidth: 0 }}>
        <div className="row between" style={{ gap: 8, alignItems: 'flex-start', flexWrap: 'nowrap' }}>
          <div style={{ minWidth: 0 }}>
            <span className="ltype">{p.listing_type === 'flatmate' ? 'Flatmate wanted' : t?.label}</span>
            <h3>{p.title || headline(p)}</h3>
            <p className="loc">{headline(p)} · {p.locality}, {city?.name}</p>
          </div>
          <div className="rent" style={{ textAlign: 'right', flex: 'none' }}>{rupees(p.rent)}<small>/mo</small></div>
        </div>
        <div className="lmeta">
          {p.featured && <span className="badge badge-dark">★ Featured</span>}
          {p.verified && <span className="badge badge-green">✓ Verified owner</span>}
          {p.status === 'rented' && <span className="badge badge-warn">Rented out</span>}
          {showStatus && p.status !== 'rented' && <span className={`badge ${p.status === 'approved' ? 'badge-green' : p.status === 'rejected' ? 'badge-red' : 'badge-warn'}`}>{p.status}</span>}
          {p.furnishing && <span className="badge">{p.furnishing}</span>}
          {p.tenant_pref && p.tenant_pref !== 'any' && <span className="badge">For {tenantLabel(p.tenant_pref).toLowerCase()}</span>}
          {p.food_included && <span className="badge">🍛 Food included</span>}
          <span className="badge badge-zero">₹0 brokerage</span>
          <span className="xs muted" style={{ alignSelf: 'center' }}>{relTime(p.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
