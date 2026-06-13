import { NextResponse } from 'next/server';
import { COMPETITIONS } from '@/lib/channels';

// GET /api/config - Lista todas as competições configuradas
export async function GET() {
  const list = COMPETITIONS.map(c => ({
    id:      c.id,
    code:    c.code,
    name:    c.name,
    country: c.country,
    channel: c.channel,
    active:  c.active,
    status:  c.active ? '✅ Ativa' : '⏸️ Pausada',
  }));

  return NextResponse.json({
    total: list.length,
    active: list.filter(c => c.active).length,
    competitions: list,
  });
}
