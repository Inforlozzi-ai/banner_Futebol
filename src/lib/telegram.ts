import TelegramBot from 'node-telegram-bot-api';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  eventsCount?: number
): Promise<string | null> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error('TELEGRAM_CHAT_ID nao configurado');

  const bot = getBot();
  const dateFmt = format(date, "EEEE, dd/MM/yyyy", { locale: ptBR });
  const total = eventsCount ? ` - ${eventsCount} jogos` : '';

  const caption = `<b>Jogos de Hoje${total}</b>\n${dateFmt}\n\nConfira os principais confrontos do dia.\n\n<b>@Inforlozzi</b> - Esportes ao vivo 24h\n#JogosDeHoje #Futebol #Inforlozzi`;

  const imageBuffer = fs.readFileSync(imagePath);
  const msg = await bot.sendPhoto(chatId, imageBuffer, {
    caption,
    parse_mode: 'HTML',
  });

  return String(msg.message_id);
}
