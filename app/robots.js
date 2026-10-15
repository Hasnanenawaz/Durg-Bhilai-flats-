import { abs, SITE_URL } from '@/lib/site';

// AI crawlers are welcome on public pages so the site can be cited by ChatGPT, Perplexity, Gemini and Claude (GEO).
export default function robots() {
  const disallow = ['/admin', '/host', '/account', '/api/', '/login', '/onboarding', '/search?'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'Claude-SearchBot', 'Google-Extended', 'Applebot-Extended', 'Bingbot'], allow: '/', disallow },
    ],
    sitemap: abs('/sitemap.xml'),
    host: SITE_URL,
  };
}
