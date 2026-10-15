import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';

export default function Results({ rows, total, page, perPage, baseQuery, basePath = '/search', emptyCity }) {
  const pages = Math.ceil(total / perPage);
  const href = (p) => {
    const q = new URLSearchParams(baseQuery);
    if (p > 1) q.set('page', p); else q.delete('page');
    const s = q.toString();
    return `${basePath}${s ? `?${s}` : ''}`;
  };
  if (!rows.length) {
    return (
      <div className="empty">
        <h3>No places match yet</h3>
        <p>Try a wider rent range or a nearby area. New listings come in every day{emptyCity ? ` in ${emptyCity}` : ''}.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-ghost btn-sm" href="/search">See all listings</Link>
          <Link className="btn btn-soft btn-sm" href="/list-your-property">Have a place? List it free</Link>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="listings">{rows.map((p) => <PropertyCard key={p.id} p={p} />)}</div>
      {pages > 1 && (
        <nav className="pager" aria-label="Pages">
          {page > 1 && <Link className="btn btn-ghost btn-sm" href={href(page - 1)} rel="prev">← Previous</Link>}
          <span className="small muted" style={{ alignSelf: 'center' }}>Page {page} of {pages}</span>
          {page < pages && <Link className="btn btn-ghost btn-sm" href={href(page + 1)} rel="next">Next →</Link>}
        </nav>
      )}
    </>
  );
}
