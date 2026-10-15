import 'server-only';
import { marked } from 'marked';
import { slugify } from './models';
import { cityBySlug } from './locations';

const str = (v, max) => (v == null ? '' : String(v).trim().slice(0, max));

export function cleanBlog(b) {
  return {
    title: str(b.title, 160),
    slug: slugify(b.slug || b.title),
    excerpt: str(b.excerpt, 300),
    content: str(b.content, 100000),
    cover_image: str(b.cover_image, 500) || null,
    tags: Array.isArray(b.tags) ? b.tags.map((t) => str(t, 30)).filter(Boolean).slice(0, 8)
      : str(b.tags, 300).split(',').map((t) => t.trim()).filter(Boolean).slice(0, 8),
    city: cityBySlug(b.city) ? b.city : null,
    faq: Array.isArray(b.faq) ? b.faq.filter((f) => f?.q && f?.a).map((f) => ({ q: str(f.q, 200), a: str(f.a, 1000) })).slice(0, 10) : [],
    status: b.status === 'published' ? 'published' : 'draft',
    author: str(b.author, 80) || 'Durg Bhilai Flats Team',
    seo_title: str(b.seo_title, 70) || null,
    seo_description: str(b.seo_description, 170) || null,
  };
}

// Markdown → HTML. Only admins write posts; raw HTML in markdown is escaped anyway.
const renderer = new marked.Renderer();
renderer.html = ({ text }) => text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
renderer.link = ({ href, text }) => {
  const safe = /^(https?:|\/|#|mailto:|tel:)/i.test(href) ? href : '#';
  const ext = /^https?:/i.test(safe) && !safe.includes(process.env.NEXT_PUBLIC_SITE_URL || '##');
  return `<a href="${safe}"${ext ? ' rel="noopener" target="_blank"' : ''}>${text}</a>`;
};
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const id = slugify(text.replace(/<[^>]+>/g, ''));
  return `<h${depth} id="${id}">${text}</h${depth}>`;
};
export const renderMarkdown = (md) => marked.parse(md || '', { renderer, gfm: true, breaks: false });

export function headingsOf(md) {
  return (md || '').split('\n').filter((l) => /^##\s/.test(l)).map((l) => {
    const text = l.replace(/^##\s+/, '').replace(/[*_`]/g, '').trim();
    return { text, id: slugify(text) };
  });
}
export const readingMinutes = (md) => Math.max(1, Math.round((md || '').split(/\s+/).length / 200));
