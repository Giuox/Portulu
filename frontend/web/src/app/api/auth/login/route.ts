import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = LoginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { email, password } = parsed.data;
  const { data, error } = await supabaseServer.auth.signInWithPassword({ email, password });
  if (error || !data.session || !data.user) {
    return NextResponse.json({ error: 'Credenziali non valide' }, { status: 401 });
  }
  const { access_token } = data.session;
  const res = NextResponse.json({ ok: true, userId: data.user.id, email: data.user.email });
  res.cookies.set('auth_token', access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}


