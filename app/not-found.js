import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="wrap section center" style={{ maxWidth: 560 }}>
      <span className="eyebrow">404</span>
      <h1 style={{ fontSize: '2rem' }}>This page has moved out</h1>
      <p className="muted">The listing may have been rented or removed.</p>
      <div className="row" style={{ justifyContent: 'center' }}><Link className="btn btn-primary" href="/search">Find a place</Link><Link className="btn btn-ghost" href="/">Home</Link></div>
    </div>
  );
}
