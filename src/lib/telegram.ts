import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

let _bot: TelegramBot | null = null;
function getBot() {
  if (!_bot) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    _bot = new TelegramBot(token);
  }
  return _bot;
}

export async function sendBannerToTelegram(
  imagePath: string,
  date: Date,
  eventsCount?: number
): Promise<string | null> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID não configurado');

  const bot = getBot();
  const dateFmt = format(date, "dd/MM/yyyy \- EEEE", { locale: ptBR });
  const total = eventsCount ? ` \| ${eventsCount} eventos` : '';

  const caption = [
    `🏆 *Esportes de Hoje \- ${dateFmt}*${total}`,
    '',
    '⚽ Futebol • 🏀 Basquete • 🏐 Vôlei • 🥊 Lutas',
    '',
    'Confira os principais confrontos do dia\.',
    '',
    '🔵 *Inforlozzi*',
    '',
    '\#Esportes \#Futebol \#Basquete \#JogosDeHoje \#Inforlozzi',
  ].join('\n');

  const imageBuffer = fs.readFileSync(imagePath);
  const msg = await bot.sendPhoto(chatId, imageBuffer, {
    caption,
    parse_mode: 'MarkdownV2',
  });

  return String(msg.message_id);
}
