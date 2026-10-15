import Link from 'next/link';
export default function AccountTabs({ current }) {
  const tabs = [['/account', 'Profile & history'], ['/account/saved', 'Saved places']];
  return <nav className="tabs" aria-label="Account">{tabs.map(([h, l]) => <Link key={h} href={h} aria-current={current === h ? 'page' : undefined}>{l}</Link>)}</nav>;
}
