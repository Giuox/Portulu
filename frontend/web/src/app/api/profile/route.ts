import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('auth_token')?.value;
  if (cookie) return cookie;
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  return type?.toLowerCase() === 'bearer' ? token || null : null;
}

export async function GET(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const { data: user, error: err } = await supabaseServer.auth.getUser(token);
  if (err || !user.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const { data, error } = await supabaseServer.from('profiles').select('*').eq('id', user.user.id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}


