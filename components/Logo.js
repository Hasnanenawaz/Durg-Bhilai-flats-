import Link from 'next/link';

// Wordmark: DnBflats "DB" mark, "DurgBhilai" + yellow "Flats" tag.
export default function Logo({ compact = false }) {
  return (
    <Link href="/" className="brand" aria-label="Durg Bhilai Flats and Flatmates, home">
      <img className="brand-logo" src="/logo-mark.png" alt="" width="233" height="160" />
      <span>
        <span className="brand-word">DurgBhilai<em>Flats</em></span>
        {!compact && <span className="brand-sub">Flats · PG · Rooms · Flatmates</span>}
      </span>
    </Link>
  );
}
