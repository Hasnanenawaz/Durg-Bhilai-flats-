import { json, fail, withUser } from '@/lib/api';
import { storage } from '@/lib/db';

const TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 5 * 1024 * 1024;

// Checks the real file signature, not just the declared type.
function sniff(buf) {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png';
  if (buf.slice(0, 4).toString() === 'RIFF' && buf.slice(8, 12).toString() === 'WEBP') return 'image/webp';
  return null;
}

export async function POST(req) {
  return withUser(req, async (user) => {
    const form = await req.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') return fail('No file received.');
    if (file.size > MAX) return fail('Image is larger than 5 MB.');
    const buf = Buffer.from(await file.arrayBuffer());
    const type = sniff(buf);
    if (!type) return fail('Only JPG, PNG or WebP images are allowed.');
    const folder = form.get('folder') === 'blog' && user.is_admin ? 'blog' : 'properties';
    const saved = await storage.upload(buf, TYPES[type], type, folder);
    return json({ ok: true, ...saved });
  });
}
