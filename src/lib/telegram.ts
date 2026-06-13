import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SportEvent } from './sports-api';
import { getChannelById } from './channels';

let _bot: TelegramBot | null = null;
function getBot() {
  if (!_bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN nao configurado');
    _bot = new TelegramBot(token);
  }
  return _bot;
}

export async function sendBannerToTelegram(
  imagePath: string,
  date: Date,
  events?: SportEvent[]
): Promise<string | null> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID nao configurado');

  const bot = getBot();
  const dateFmt = format(date, "EEEE, dd/MM/yyyy", { locale: ptBR });
  const total = events?.length ?? 0;

  // Monta lista de jogos com horario e canal
  let gameLines = '';
  if (events && events.length > 0) {
    const { formatInTimeZone } = require('date-fns-tz');
    gameLines = events.map(ev => {
      const time = formatInTimeZone(
        new Date(ev.datetime_brasilia),
        'America/Sao_Paulo',
        'HH:mm'
      );
      const ch = getChannelById(ev.league_id);
      return `⚽ ${ev.home_team} x ${ev.away_team} - ${time}h - ${ch}`;
    }).join('\n');
  }

  const caption = [
    `<b>Jogos de Hoje - ${total} jogo${total !== 1 ? 's' : ''}</b>`,
    dateFmt,
    '',
    gameLines,
    '',
    'Confira os principais confrontos do dia.',
    '',
    '<b>@Inforlozzi</b> - Esportes ao vivo 24h',
    '#JogosDeHoje #Futebol #Inforlozzi',
  ].filter(l => l !== undefined).join('\n');

  const imageBuffer = fs.readFileSync(imagePath);
  const msg = await bot.sendPhoto(chatId, imageBuffer, {
    caption,
    parse_mode: 'HTML',
  });

  return String(msg.message_id);
}
