import { fetchGamesToday } from './football-api';
import { generateBanner } from './banner-generator';
import { sendBannerToTelegram } from './telegram';
import { supabaseAdmin } from './supabase';
import { log } from './logger';
import { formatInTimeZone } from 'date-fns-tz';
import path from 'path';

export async function runDailyBannerJob(dateStr?: string): Promise<{
  success: boolean;
  message: string;
  data?: object;
}> {
  const brDate = dateStr ?? formatInTimeZone(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');
  const targetDate = new Date(brDate + 'T06:00:00-03:00');

  await log('info', `Iniciando job para ${brDate}`);

  // 1. Buscar jogos
  let games;
  try {
    games = await fetchGamesToday(brDate);
    await log('info', `${games.length} jogos encontrados`);
  } catch (err: any) {
    await log('error', 'Erro ao buscar jogos', { error: err.message });
    return { success: false, message: 'Erro ao buscar jogos: ' + err.message };
  }

  if (games.length === 0) {
    await log('warn', 'Nenhum jogo encontrado');
    return { success: false, message: 'Nenhum jogo encontrado para hoje' };
  }

  // 2. Salvar jogos
  for (const game of games) {
    try {
      await supabaseAdmin.from('games').upsert(game, { onConflict: 'external_id' });
    } catch { /* continua */ }
  }

  // 3. Gerar banners
  let postPath: string;
  let storiesPath: string | undefined;
  let postFilePath: string;
  try {
    const post    = await generateBanner({ games, date: targetDate, format: 'post' });
    const stories = await generateBanner({ games, date: targetDate, format: 'stories' });
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
    .insert({ date: brDate, file_path: postPath!, file_path_stories: storiesPath, games_count: games.length, status: 'generated' })
    .select().single();

  // 5. Enviar Telegram
  try {
    const msgId = await sendBannerToTelegram(postFilePath!, targetDate);
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

  return {
    success: true,
    message: `✅ Banner gerado e enviado! ${games.length} jogos.`,
    data: { postPath, storiesPath, gamesCount: games.length },
  };
}
