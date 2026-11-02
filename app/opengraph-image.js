import { ogCard, OG_SIZE } from '@/lib/og';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Durg Bhilai Flats & Flatmates – flats, PGs and rooms on rent, zero brokerage';

export default function OG() {
  return ogCard({ big: true, title: 'Find a room. Call the owner.', accent: 'Pay no broker.', footer: ['Flats · PGs · Rooms · Flatmates', 'Zero brokerage', 'Chhattisgarh'] });
}
