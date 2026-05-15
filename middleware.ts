import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase/cookie-client';

const PROTECTED_PREFIXES = ['/dashboard', '/explore', '/trips', '/profile', '/onboarding', '/hub', '/api/push', '/api/modules'];
const AUTH_ROUTES = ['/auth/login', '/auth/signup'];

function clearStaleSbCookies(req: NextRequest, res: NextResponse) {
  for (const c of req.cookies.getAll()) {
    if (c.name.startsWith('sb-')) {
      res.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }
}

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
  const isAuthRoute = AUTH_ROUTES.some((p) => path === p);

  // Refresh the session cookie if expired. If a stale/malformed sb-* cookie
  // makes the cookie parser throw (partial chunked-cookie reassembly), clear
  // them and treat the request as anonymous instead of 500-ing.
  let user: { id: string } | null = null;
  try {
    const sb = createMiddlewareClient(req, res);
    const { data } = await sb.auth.getUser();
    user = data.user;
  } catch {
    clearStaleSbCookies(req, res);
    user = null;
  }

  if (isProtected && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', path);
    const redirect = NextResponse.redirect(url);
    // Carry over the cookie clears we may have set on `res`.
    for (const c of res.cookies.getAll()) redirect.cookies.set(c);
    return redirect;
  }

  if (isAuthRoute && user) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    // Run on everything except Next internals, static files, and the
    // /auth/clear escape hatch (which has to bypass middleware to recover
    // from a corrupted session cookie).
    '/((?!_next/static|_next/image|favicon.ico|auth/clear|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
