import { NextRequest, NextResponse } from 'next/server';

// This route handles the redirect URI from Azure AD B2C after login
export async function GET(req: NextRequest) {
  const idToken = req.nextUrl.searchParams.get('id_token');
  if (!idToken) return NextResponse.redirect('/login');
  // Store token in httpOnly cookie for SSR, and redirect to home (or redirect param)
  const redirect = req.nextUrl.searchParams.get('state') || '/';
  const res = NextResponse.redirect(redirect);
  res.cookies.set('id_token', idToken, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 });
  return res;
}

