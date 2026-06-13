import { NextRequest, NextResponse } from 'next/server';
import { fetchTodayGames } from '@/lib/sports-api';
import { generateBanner } from '@/lib/banner-generator';
import { sendBannerToTelegram } from '@/lib/telegram';
import { ensureMascote } from '@/lib/setup-mascote';
import { getLeagueIds } from '@/lib/channels';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Garantir mascote baixado
    await ensureMascote();

    const leagueIds = getLeagueIds();
    const today = new Date();
    const events = await fetchTodayGames(leagueIds);

    if (events.length === 0) {
      return NextResponse.json({ message: 'Nenhum jogo encontrado hoje', games: 0 });
    }

    const banner = await generateBanner({ events, date: today, format: 'post' });

    let messageId: string | null = null;
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      messageId = await sendBannerToTelegram(banner.filePath, today, events);
    }

    return NextResponse.json({
      success: true,
      games: events.length,
      banner: banner.publicPath,
      telegram: messageId,
    });
  } catch (err: any) {
    console.error('Cron error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Cron endpoint ativo' });
}
