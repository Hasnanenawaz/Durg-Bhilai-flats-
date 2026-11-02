import 'server-only';
import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';
import { abs, SITE_NAME } from './site';

// Shared 1200×630 social preview card used by every opengraph-image route.
export const OG_SIZE = { width: 1200, height: 630 };

// Same fonts as the site. The bundled default font has no bold weight and no ₹ glyph,
// so Inter latin-ext is loaded too under its own name (it carries ₹; satori drops a second font with the same name and weight).
let assets;
const load = () => {
  if (assets) return assets;
  const read = (p) => readFileSync(join(process.cwd(), p));
  const font = (name, file, weight) => ({ name, data: read(`assets/fonts/${file}`), weight, style: 'normal' });
  assets = {
    logo: `data:image/png;base64,${read('public/logo-mark.png').toString('base64')}`,
    fonts: [
      font('Jakarta', 'plus-jakarta-sans-latin-800-normal.woff', 800),
      font('Inter', 'inter-latin-400-normal.woff', 400),
      font('Inter', 'inter-latin-600-normal.woff', 600),
      font('Inter Ext', 'inter-latin-ext-600-normal.woff', 600),
    ],
  };
  return assets;
};

/** Fetches a listing/blog photo as a data URL so a slow or broken image can't break the card. */
export async function photoData(url) {
  if (!url) return null;
  try {
    const res = await fetch(url.startsWith('http') ? url : abs(url), { signal: AbortSignal.timeout(4000) });
    const type = res.headers.get('content-type') || '';
    if (!res.ok || !/^image\/(jpeg|png|webp)/.test(type)) return null;
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
  } catch {
    return null;
  }
}

// Colours from app/globals.css.
const INK = '#0b1f3a';
const ACCENT = '#1d4a86';
const MUTED = '#64728a';
const AMBER = '#ffc21a';
export const TYPE_TONE = { flat: '#4353d9', pg: '#e0740b', room: '#0d8a87', flatmate: '#d43f69' };

export function ogCard({ eyebrow, tone = ACCENT, title, accent, footer = [], photo, big = false }) {
  const { logo, fonts } = load();
  const titleSize = big ? 80 : title.length > 60 ? 54 : 64;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#ffffff', fontFamily: 'Inter, "Inter Ext"', borderBottom: `12px solid ${AMBER}` }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '60px 64px 52px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <img src={logo} width={81} height={56} alt="" />
            <div style={{ fontFamily: 'Jakarta', fontSize: 30, fontWeight: 800, color: INK, letterSpacing: -0.5 }}>{SITE_NAME}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {eyebrow && <div style={{ fontSize: 24, fontWeight: 600, color: tone, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>{eyebrow}</div>}
            <div style={{ fontFamily: 'Jakarta', fontSize: titleSize, fontWeight: 800, color: INK, lineHeight: 1.08, letterSpacing: -2 }}>{title}</div>
            {accent && <div style={{ fontFamily: big ? 'Jakarta' : 'Inter, "Inter Ext"', fontSize: big ? 80 : 46, fontWeight: big ? 800 : 600, color: ACCENT, lineHeight: 1.1, letterSpacing: big ? -2 : -1, marginTop: big ? 0 : 18 }}>{accent}</div>}
          </div>
          <div style={{ display: 'flex', gap: 28, fontSize: 25, color: MUTED }}>
            {footer.filter(Boolean).map((f) => <span key={f}>{f}</span>)}
          </div>
        </div>
        {photo && <img src={photo} width={440} height={618} style={{ objectFit: 'cover' }} alt="" />}
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}

export const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
