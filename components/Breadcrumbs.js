import Link from 'next/link';
import JsonLd from './JsonLd';
import { abs } from '@/lib/site';

export default function Breadcrumbs({ items }) {
  const all = [{ name: 'Home', href: '/' }, ...items];
  return (
    <>
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        {all.map((c, i) => (
          <span key={i}>
            {i < all.length - 1 ? <><Link href={c.href}>{c.name}</Link> <span aria-hidden="true">/</span></> : <span aria-current="page">{c.name}</span>}
          </span>
        ))}
      </nav>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: all.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: abs(c.href || '/') })) }} />
    </>
  );
}
