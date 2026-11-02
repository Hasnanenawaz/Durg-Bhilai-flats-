/** @type {import('next').NextConfig} */
const supabaseHost = (() => {
  try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname; } catch { return null; }
})();

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      ...(supabaseHost ? [{ protocol: 'https', hostname: supabaseHost, pathname: '/storage/v1/object/public/**' }] : []),
    ],
  },
  experimental: { serverActions: { bodySizeLimit: '8mb' } },
  // lib/og.js reads these at request time; the tracer can't see its built-up paths, so ship them explicitly.
  outputFileTracingIncludes: { '/**/opengraph-image': ['./assets/fonts/*.woff', './public/logo-mark.png'] },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      ],
    }];
  },
};
export default nextConfig;
