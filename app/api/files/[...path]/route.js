import { promises as fs } from 'fs';
import { storage } from '@/lib/db';

// Serves uploads in local (no-Supabase) mode only.
const TYPES = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
export async function GET(_req, { params }) {
  const { path } = await params;
  const full = storage.localPath(path.join('/'));
  if (!full) return new Response('Not found', { status: 404 });
  try {
    const buf = await fs.readFile(full);
    return new Response(buf, { headers: { 'Content-Type': TYPES[full.split('.').pop()] || 'application/octet-stream', 'Cache-Control': 'public, max-age=31536000, immutable' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
