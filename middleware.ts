import { NextResponse, type NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Auth routes and root → redirect to dashboard (no login needed)
  if (path === '/' || path === '/auth/login' || path === '/auth/signup') {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|auth/clear|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
