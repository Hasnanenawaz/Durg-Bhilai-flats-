import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

const cell = (v) => {
  const s = v == null ? '' : String(v);
  // Stop spreadsheet formula injection and quote safely.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.is_admin) return new Response('Admins only', { status: 403 });
  const [users, props, inq] = await Promise.all([
    db.find('users', { order: ['created_at', false], limit: 50000 }),
    db.find('properties', { limit: 50000 }),
    db.find('inquiries', { limit: 100000 }),
  ]);
  const listings = {}; for (const p of props) listings[p.owner_id] = (listings[p.owner_id] || 0) + 1;
  const asks = {}; for (const i of inq) asks[i.guest_id] = (asks[i.guest_id] || 0) + 1;
  const head = ['Name', 'Phone', 'WhatsApp', 'Email', 'Mode', 'Host', 'Listings', 'Owners contacted', 'Lead status', 'Notes', 'City', 'Joined', 'Last login'];
  const rows = users.map((u) => [u.name, `+91${u.phone}`, u.whatsapp ? `+91${u.whatsapp}` : '', u.email, u.active_mode, u.is_host ? 'yes' : 'no', listings[u.id] || 0, asks[u.id] || 0, u.lead_status, u.admin_notes, u.signup_city, u.created_at, u.last_login_at]);
  const csv = [head, ...rows].map((r) => r.map(cell).join(',')).join('\n');
  return new Response('﻿' + csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
