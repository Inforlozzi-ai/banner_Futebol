import cron from 'node-cron';
import { runDailyBannerJob } from '../lib/banner-service';

console.log('🕐 Cron iniciado — executa às 06:00 (Brasília = 09:00 UTC)');

cron.schedule('0 9 * * *', async () => {
  console.log('▶️ Executando job diário de banner...');
  const result = await runDailyBannerJob();
  console.log(result.success ? '✅' : '❌', result.message);
}, { timezone: 'UTC' });

process.on('SIGINT', () => { console.log('🛑 Cron encerrado.'); process.exit(0); });
process.on('SIGTERM', () => { console.log('🛑 Cron encerrado.'); process.exit(0); });
