'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/admin', 'Overview'],
  ['/admin/users', 'Users & phone numbers'],
  ['/admin/listings', 'Listings'],
  ['/admin/inquiries', 'Inquiries'],
  ['/admin/reports', 'Reports'],
  ['/admin/blog', 'Blog'],
];

export default function AdminNav({ pending = 0, reports = 0 }) {
  const path = usePathname();
  const active = (h) => (h === '/admin' ? path === h : path.startsWith(h));
  return (
    <nav className="admin-nav" aria-label="Admin">
      <p className="xs muted" style={{ padding: '0 12px', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '.07em' }}>Admin</p>
      {LINKS.map(([h, l]) => (
        <Link key={h} href={h} aria-current={active(h) ? 'page' : undefined}>
          {l}
          {h === '/admin/listings' && pending > 0 && <span className="badge badge-warn" style={{ marginLeft: 6 }}>{pending}</span>}
          {h === '/admin/reports' && reports > 0 && <span className="badge badge-red" style={{ marginLeft: 6 }}>{reports}</span>}
        </Link>
      ))}
    </nav>
  );
}
