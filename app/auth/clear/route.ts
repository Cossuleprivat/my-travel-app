import { NextResponse, type NextRequest } from 'next/server';

// Expires every sb-* cookie on the response. Used to recover from stale
// chunked-session cookies that crash @supabase/ssr's JSON parser.
export function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/auth/login', req.url));
  for (const c of req.cookies.getAll()) {
    if (c.name.startsWith('sb-')) {
      res.cookies.set(c.name, '', { maxAge: 0, path: '/' });
    }
  }
  return res;
}
