import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const OrderItem = z.object({
  id: z.number().optional(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().min(1)
});

const CreateOrderSchema = z.object({
  restaurant_id: z.number().int(),
  items: z.array(OrderItem).min(1),
  subtotal: z.number(),
  delivery_fee: z.number(),
  total: z.number(),
  payment_method: z.enum(['cash','card','online']).optional().nullable(),
  delivery_address: z.string(),
  delivery_zone: z.string(),
  customer_phone: z.string(),
  customer_name: z.string(),
  notes: z.string().optional().nullable()
});

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
  const { data: user, error: getUserError } = await supabaseServer.auth.getUser(token);
  if (getUserError || !user.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  // Load profile to determine role
  const { data: profiles } = await supabaseServer
    .from('profiles').select('*').eq('id', user.user.id).limit(1);
  const profile = profiles?.[0];

  let query = supabaseServer.from('orders').select('*').order('created_at', { ascending: false });
  if (profile?.role === 'customer') {
    query = query.eq('customer_id', user.user.id);
  } else if (profile?.role === 'rider') {
    query = query.or(`rider_id.eq.${user.user.id},and(status.eq.ready,rider_id.is.null)`);
  }
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const token = getToken(req);
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 });
  const { data: user, error: getUserError } = await supabaseServer.auth.getUser(token);
  if (getUserError || !user.user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = CreateOrderSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  const body = parsed.data;

  const orderNumber = 'ORD' + Date.now().toString().slice(-6);
  const { error } = await supabaseServer.from('orders').insert({
    order_number: orderNumber,
    customer_id: user.user.id,
    restaurant_id: body.restaurant_id,
    items: body.items,
    subtotal: body.subtotal,
    delivery_fee: body.delivery_fee,
    total: body.total,
    payment_method: body.payment_method || null,
    delivery_address: body.delivery_address,
    delivery_zone: body.delivery_zone,
    customer_phone: body.customer_phone,
    customer_name: body.customer_name,
    notes: body.notes || null
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orderNumber });
}


