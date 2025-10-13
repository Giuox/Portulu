import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(['customer','restaurant','rider','admin']).default('customer')
});

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { email, password, name, phone, role } = parsed.data;

  const { data: signUp, error: signUpError } = await supabaseServer.auth.signUp({ email, password });
  if (signUpError || !signUp.user) {
    return NextResponse.json({ error: signUpError?.message || 'Errore registrazione' }, { status: 400 });
  }

  // Create profile row
  const { error: profileError } = await supabaseServer
    .from('profiles')
    .insert({ id: signUp.user.id, email, name, phone: phone || null, role });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ userId: signUp.user.id, email });
}


