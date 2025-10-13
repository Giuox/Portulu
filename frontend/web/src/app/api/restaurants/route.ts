import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { z } from 'zod';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const zone = searchParams.get('zone');
  let query = supabaseServer.from('restaurants').select('*').eq('active', true);
  if (zone) {
    query = query.contains('zones', [zone]);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

const CreateRestaurantSchema = z.object({
  name: z.string().min(2),
  category: z.string().optional(),
  min_order: z.number().optional(),
  zones: z.array(z.string()).optional()
});

function getBearerToken(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  const [type, token] = auth.split(' ');
  return type?.toLowerCase() === 'bearer' ? token || null : null;
}

export async function POST(req: NextRequest) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const { data: user, error: uerr } = await supabaseServer.auth.getUser(token);
  if (uerr || !user.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  const json = await req.json().catch(() => null);
  const parsed = CreateRestaurantSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const { name, category, min_order, zones } = parsed.data;
  const { data, error } = await supabaseServer
    .from('restaurants')
    .insert({ user_id: user.user.id, name, category: category || null, min_order: min_order ?? 0, zones: zones || [] })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}


