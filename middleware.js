import { NextResponse } from 'next/server';
import { readSession, SESSION_COOKIE } from './lib/session';

// Fast gate for signed-in areas. Pages and APIs still re-check the user and role.
export async function middleware(req) {
  const s = await readSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!s) {
    const url = req.nextUrl.clone();
    if (req.nextUrl.pathname.startsWith('/admin')) {
      url.pathname = '/admin-login';
      url.search = '';
      return NextResponse.redirect(url);
    }
    url.pathname = '/login';
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/host/:path*', '/account/:path*'] };
