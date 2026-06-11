import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabaseAdmin.from('settings').select('*').order('key');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function PUT(request: Request) {
  const settings = await request.json() as Array<{ key: string; value: string; description: string }>;
  for (const s of settings) {
    await supabaseAdmin.from('settings').upsert(
      { key: s.key, value: s.value, description: s.description, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  }
  return NextResponse.json({ success: true });
}
