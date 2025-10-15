import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const UpdateStatusSchema = z.object({
  status: z.enum(['new','preparing','ready','delivering','delivered','cancelled'])
});

function getToken(req: NextRequest): string | null {
  const cookie = req.cookies.get('auth_token')?.value;
  if (cookie) return cookie;
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  return type?.toLowerCase() === 'bearer' ? token || null : null;
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const { data: user, error: getUserError } = await supabaseServer.auth.getUser(token);
  if (getUserError || !user.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = UpdateStatusSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { id } = await context.params;
  const orderId = Number(id);
  const { error } = await supabaseServer.from('orders').update({ status: parsed.data.status }).eq('id', orderId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'Status aggiornato' });
}


