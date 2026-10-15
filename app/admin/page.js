import Link from 'next/link';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export default async function AdminOverview() {
  await requireAdmin();
  const weekAgo = new Date(Date.now() - 7 * 864e5).toISOString();
  const [users, newLeads, newUsers, live, pending, reports, inquiries, posts] = await Promise.all([
    db.count('users'),
    db.count('users', { eq: { lead_status: 'new' } }),
    db.count('users', { gte: { created_at: weekAgo } }),
    db.count('properties', { eq: { status: 'approved' } }),
    db.count('properties', { eq: { status: 'pending' } }),
    db.count('reports', { eq: { resolved: false } }),
    db.count('inquiries', { gte: { created_at: weekAgo } }),
    db.count('blogs', { eq: { status: 'published' } }),
  ]);
  const cards = [
    [users, 'users signed up', '/admin/users'],
    [newUsers, 'new users this week', '/admin/users'],
    [newLeads, 'leads not called yet', '/admin/users?status=new'],
    [live, 'live listings', '/admin/listings?status=approved'],
    [pending, 'listings waiting for review', '/admin/listings?status=pending'],
    [reports, 'open reports', '/admin/reports'],
    [inquiries, 'inquiries this week', '/admin/inquiries'],
    [posts, 'published posts', '/admin/blog'],
  ];
  return (
    <>
      <div className="dash-head"><div><span className="eyebrow">Admin</span><h1>Overview</h1></div></div>
      <div className="stats">
        {cards.map(([n, label, href]) => (
          <Link key={label} href={href} className="stat" style={{ textDecoration: 'none' }}><b>{n}</b><span>{label}</span></Link>
        ))}
      </div>
    </>
  );
}
