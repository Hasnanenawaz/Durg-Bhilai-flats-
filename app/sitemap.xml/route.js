import { abs } from '@/lib/site';
import { SITEMAP_IDS } from '../sitemap';

export const revalidate = 3600;

// Sitemap index pointing at the split sitemaps from app/sitemap.js (/sitemap/<id>.xml).
export function GET() {
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...SITEMAP_IDS.map((id) => `<sitemap><loc>${abs(`/sitemap/${id}.xml`)}</loc></sitemap>`),
    '</sitemapindex>',
  ];
  return new Response(xml.join('\n'), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
