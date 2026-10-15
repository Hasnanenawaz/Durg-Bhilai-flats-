import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Durg Bhilai Flats & Flatmates – flats, PGs and rooms on rent, zero brokerage';

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#ffffff', padding: 72, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: '#1b6b45', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700 }}>DB</div>
          <div style={{ fontSize: 34, fontWeight: 700, color: '#13201a' }}>Durg Bhilai Flats & Flatmates</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 700, color: '#13201a', lineHeight: 1.05, letterSpacing: -2 }}>Find a room. Call the owner.</div>
          <div style={{ fontSize: 76, fontWeight: 700, color: '#1b6b45', lineHeight: 1.05, letterSpacing: -2 }}>Pay no broker.</div>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 28, color: '#5d6d65' }}>
          <span>Flats · PGs · Rooms · Flatmates</span><span>Zero brokerage</span><span>Chhattisgarh</span>
        </div>
      </div>
    ),
    size,
  );
}
