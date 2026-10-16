import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/ui/Reveal';
import { SITE_URL, SITE_NAME, SUPPORT_WHATSAPP, abs } from '@/lib/site';
import { CITIES } from '@/lib/locations';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} | Flats, PG & Rooms on Rent in Durg-Bhilai, No Brokerage`, template: `%s | ${SITE_NAME}` },
  description: 'Find flats, PGs, rooms and flatmates on rent in Durg, Bhilai, Raipur and across Chhattisgarh. Owners list free and you contact them directly. Zero brokerage.',
  keywords: ['flats for rent in Bhilai', 'PG in Bhilai', 'rooms on rent in Durg', 'flatmates Durg Bhilai', 'no brokerage rent Chhattisgarh', 'PG near IIT Bhilai', 'flat on rent Raipur'],
  applicationName: SITE_NAME,
  alternates: { canonical: '/' },
  openGraph: { type: 'website', locale: 'en_IN', siteName: SITE_NAME, url: SITE_URL },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  other: { 'geo.region': 'IN-CT', 'geo.placename': 'Bhilai, Durg, Chhattisgarh' },
  formatDetection: { telephone: false },
};

export const viewport = { themeColor: '#1b6b45', width: 'device-width', initialScale: 1 };

const orgLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization', '@id': abs('/#org'), name: SITE_NAME, url: SITE_URL, logo: abs('/logo.png'),
      description: 'Zero-brokerage rental platform for flats, PGs, rooms and flatmates in Durg, Bhilai and Chhattisgarh.',
      areaServed: [{ '@type': 'State', name: 'Chhattisgarh' }, ...CITIES.slice(0, 4).map((c) => ({ '@type': 'City', name: c.name }))],
      address: { '@type': 'PostalAddress', addressLocality: 'Bhilai', addressRegion: 'Chhattisgarh', addressCountry: 'IN' },
      ...(SUPPORT_WHATSAPP ? { contactPoint: { '@type': 'ContactPoint', telephone: `+${SUPPORT_WHATSAPP}`, contactType: 'customer support', areaServed: 'IN', availableLanguage: ['en', 'hi'] } } : {}),
    },
    {
      '@type': 'WebSite', '@id': abs('/#website'), url: SITE_URL, name: SITE_NAME, inLanguage: 'en-IN', publisher: { '@id': abs('/#org') },
      potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: abs('/search?q={search_term_string}') }, 'query-input': 'required name=search_term_string' },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Inter:wght@400;500;600&display=swap" />
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js-reveal')" }} />
        <JsonLd data={orgLd} />
      </head>
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <Reveal />
        {SUPPORT_WHATSAPP && (
          <a className="wa-float" href={`https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Hi, I need help finding a place in Durg-Bhilai.')}`} aria-label="Chat with us on WhatsApp" rel="noopener">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2c0 1.3.9 2.5 1 2.7.1.2 1.8 2.8 4.4 3.9 1.6.7 2.3.8 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>
          </a>
        )}
      </body>
    </html>
  );
}
