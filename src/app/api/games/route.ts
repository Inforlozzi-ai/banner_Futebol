import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0];
  const { data, error } = await supabaseAdmin
    .from('games').select('*').eq('date', date).order('datetime_brasilia', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
