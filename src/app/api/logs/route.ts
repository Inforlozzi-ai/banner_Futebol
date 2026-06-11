import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') ?? '50');
  const { data, error } = await supabaseAdmin
    .from('logs').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
