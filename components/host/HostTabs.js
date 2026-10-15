import Link from 'next/link';
export default function HostTabs({ current, newCount = 0 }) {
  const tabs = [['/host', 'My listings'], ['/host/inquiries', `Inquiries${newCount ? ` (${newCount})` : ''}`], ['/host/new', '+ Add listing']];
  return <nav className="tabs" aria-label="Host">{tabs.map(([h, l]) => <Link key={h} href={h} aria-current={current === h ? 'page' : undefined}>{l}</Link>)}</nav>;
}
