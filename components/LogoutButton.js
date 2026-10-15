'use client';
export default function LogoutButton({ className = 'btn btn-ghost btn-sm' }) {
  return (
    <button className={className} type="button" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/'; }}>
      Log out
    </button>
  );
}
