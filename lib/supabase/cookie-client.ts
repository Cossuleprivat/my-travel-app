// Cookie-session-bound Supabase clients. Use these in Server Components,
// Server Actions, Route Handlers, and Middleware so auth.uid() is available.
//
// Why two factories?
// - createServerClient (cookies()): for Server Components / Actions / Route Handlers.
//   Reads the session from the incoming request cookies, may write refreshed
//   cookies via Next.js' mutable cookie store.
// - createMiddlewareClient (req, res): for middleware.ts.
//   Mirrors cookie writes onto the outgoing response so refreshed sessions
//   survive the next request.

import 'server-only';
import {
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local',
  );
}
const supabaseUrl: string = url;
const supabaseAnonKey: string = anonKey;

export async function createCookieClient() {
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            store.set(name, value, options);
          }
        } catch {
          // setAll may be called from a Server Component where cookies are
          // read-only. Middleware handles refreshes; ignore here.
        }
      },
    },
  });
}

export function createMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          req.cookies.set(name, value);
          res.cookies.set(name, value, options);
        }
      },
    },
  });
}
