import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (per instance). For multi-region, use a distributed store.
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQ = 300; // per IP per window
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_REQ) return false;
  entry.count += 1;
  return true;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isApi = url.pathname.startsWith('/api/');
  if (!isApi) return NextResponse.next();

  const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
  const key = `${ip}:${url.pathname}:${req.method}`;
  if (!rateLimit(key)) {
    return new NextResponse(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // CSRF Double-Submit: set readable cookie on GET, require x-csrf-token on mutating methods
  const method = req.method.toUpperCase();
  const csrfCookie = req.cookies.get('csrf_token')?.value;
  const res = NextResponse.next();
  if (!csrfCookie && method === 'GET') {
    const token = (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
    res.cookies.set('csrf_token', token, { path: '/', secure: true, sameSite: 'lax' });
  }
  if ([ 'POST', 'PATCH', 'PUT', 'DELETE' ].includes(method)) {
    const sent = req.headers.get('x-csrf-token');
    const cookieToken = csrfCookie || '';
    if (!sent || sent !== cookieToken) {
      return new NextResponse(JSON.stringify({ error: 'Invalid CSRF token' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
  }

  // Security headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  return res;
}

export const config = {
  matcher: ['/api/:path*']
};


