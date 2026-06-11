import { fetchAllSportsEvents } from './sports-api';
import { generateBanner } from './banner-generator';
import { sendBannerToTelegram } from './telegram';
import { supabaseAdmin } from './supabase';
import { log } from './logger';
import { formatInTimeZone } from 'date-fns-tz';

export async function runDailyBannerJob(dateStr?: string): Promise<{
  success: boolean;
  message: string;
  data?: object;
}> {
  const brDate = dateStr ?? formatInTimeZone(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const targetDate = new Date(brDate + 'T06:00:00-03:00');

  await log('info', `Iniciando job multi-esporte para ${brDate}`);

  // 1. Buscar todos os esportes
  let events;
  try {
    events = await fetchAllSportsEvents(brDate);
    await log('info', `${events.length} eventos encontrados (todos os esportes)`);
  } catch (err: any) {
    await log('error', 'Erro ao buscar eventos', { error: err.message });
    return { success: false, message: 'Erro ao buscar eventos: ' + err.message };
  }

  if (events.length === 0) {
    await log('warn', 'Nenhum evento encontrado');
    return { success: false, message: 'Nenhum evento encontrado para hoje' };
  }

  // 2. Salvar no banco (upsert)
  for (const event of events) {
    try {
      await supabaseAdmin.from('games').upsert(
        {
          external_id: event.external_id,
          date: event.date,
          datetime_utc: event.datetime_utc,
          datetime_brasilia: event.datetime_brasilia,
          home_team: event.home_team,
          away_team: event.away_team,
          home_logo: event.home_logo,
          away_logo: event.away_logo,
          league: `${event.sport_emoji} ${event.league}`,
          league_logo: event.league_logo,
          league_id: event.league_id,
          country: event.country,
          status: event.status,
        },
        { onConflict: 'external_id' }
      );
    } catch { /* continua */ }
  }

  // 3. Gerar banners
  let postPath: string;
  let storiesPath: string | undefined;
  let postFilePath: string;
  try {
    const post    = await generateBanner({ events, date: targetDate, format: 'post', title: '\uD83C\uDFC6 ESPORTES DE HOJE' });
    const stories = await generateBanner({ events, date: targetDate, format: 'stories', title: '\uD83C\uDFC6 ESPORTES DE HOJE' });
    postPath     = post.publicPath;
    postFilePath = post.filePath;
    storiesPath  = stories.publicPath;
    await log('success', `Banners gerados: ${postPath}`);
  } catch (err: any) {
    await log('error', 'Erro ao gerar banner', { error: err.message });
    return { success: false, message: 'Erro ao gerar banner: ' + err.message };
  }

  // 4. Registrar no banco
  const { data: record } = await supabaseAdmin
    .from('banners')
    .insert({
      date: brDate,
      file_path: postPath!,
      file_path_stories: storiesPath,
      games_count: events.length,
      status: 'generated',
    })
    .select().single();

  // 5. Enviar Telegram
  try {
    const msgId = await sendBannerToTelegram(postFilePath!, targetDate, events.length);
    await supabaseAdmin.from('banners').update({
      telegram_message_id: msgId,
      telegram_sent_at: new Date().toISOString(),
      status: 'sent',
    }).eq('id', record?.id);
    await log('success', `Telegram enviado. MsgID: ${msgId}`);
  } catch (err: any) {
    await log('error', 'Erro ao enviar Telegram', { error: err.message });
    await supabaseAdmin.from('banners').update({ status: 'failed', error_message: err.message }).eq('id', record?.id);
    return { success: false, message: 'Erro Telegram: ' + err.message };
  }

  // Estatísticas por esporte
  const bySport = events.reduce((acc, e) => {
    acc[e.sport] = (acc[e.sport] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    success: true,
    message: `\u2705 Banner gerado! ${events.length} eventos (${Object.entries(bySport).map(([k,v]) => `${k}:${v}`).join(', ')})`,
    data: { postPath, storiesPath, eventsCount: events.length, bySport },
  };
}
