import { supabaseAdmin } from './supabase';

type Level = 'info' | 'warn' | 'error' | 'success';

export async function log(level: Level, message: string, details?: object) {
  console.log(`[${level.toUpperCase()}] ${message}`, details ?? '');
  try {
    await supabaseAdmin.from('logs').insert({ level, message, details });
  } catch (e) {
    console.error('Erro ao salvar log:', e);
  }
}
