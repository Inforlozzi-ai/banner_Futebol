import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const [{ count: totalBanners }, { count: totalGames }, { data: todayBanner }, { data: lastBanner }] =
    await Promise.all([
      supabaseAdmin.from('banners').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('games').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('banners').select('telegram_sent_at').eq('date', today).maybeSingle(),
      supabaseAdmin.from('banners').select('telegram_sent_at').not('telegram_sent_at', 'is', null)
        .order('telegram_sent_at', { ascending: false }).limit(1).maybeSingle(),
    ]);
  return NextResponse.json({
    totalBanners: totalBanners ?? 0,
    totalGames: totalGames ?? 0,
    sentToday: !!todayBanner?.telegram_sent_at,
    lastSent: lastBanner?.telegram_sent_at ?? null,
  });
}
