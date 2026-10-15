export default function manifest() {
  return {
    name: 'Durg Bhilai Flats & Flatmates', short_name: 'DB Flats',
    description: 'Flats, PGs and rooms on rent in Durg-Bhilai. Zero brokerage.',
    start_url: '/', display: 'standalone', background_color: '#ffffff', theme_color: '#1b6b45', lang: 'en-IN',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
