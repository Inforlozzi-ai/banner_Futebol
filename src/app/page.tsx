'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Banner {
  id: string; date: string; file_path: string;
  file_path_stories?: string; games_count: number;
  status: string; telegram_sent_at?: string; created_at: string;
}
interface Stats {
  totalBanners: number; sentToday: boolean;
  totalGames: number; lastSent: string | null;
}

export default function Dashboard() {
  const [banners, setBanners]     = useState<Banner[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage]     = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [b, s] = await Promise.all([fetch('/api/banners'), fetch('/api/stats')]);
      setBanners(await b.json());
      setStats(await s.json());
    } finally { setLoading(false); }
  }

  async function generateNow() {
    setGenerating(true); setMessage('');
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: '{}' });
      const d = await r.json();
      setMessage(d.message);
      await loadData();
    } catch { setMessage('Erro ao gerar banner'); }
    finally { setGenerating(false); }
  }

  const statusColor: Record<string, string> = {
    sent: 'bg-green-500', generated: 'bg-yellow-500',
    pending: 'bg-blue-500', failed: 'bg-red-500',
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1a3060] bg-[#0a0e1a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#00d4ff] tracking-widest">INFORLOZZI</h1>
            <p className="text-[#8892a4] text-xs">Sistema de Banners de Futebol</p>
          </div>
          <nav className="flex gap-6 text-sm">
            <Link href="/" className="text-[#00d4ff] font-semibold">Dashboard</Link>
            <Link href="/games" className="text-[#8892a4] hover:text-white transition-colors">Jogos</Link>
            <Link href="/history" className="text-[#8892a4] hover:text-white transition-colors">Histórico</Link>
            <Link href="/settings" className="text-[#8892a4] hover:text-white transition-colors">Configurações</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Banners Gerados', value: String(stats.totalBanners), color: 'text-[#00d4ff]' },
              { label: 'Jogos Registrados', value: String(stats.totalGames), color: 'text-[#00ff88]' },
              { label: 'Enviado Hoje', value: stats.sentToday ? '✅ Sim' : '⏳ Não', color: 'text-[#ffd700]' },
              { label: 'Último Envio', value: stats.lastSent ? new Date(stats.lastSent).toLocaleDateString('pt-BR') : 'Nunca', color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="card-glass rounded-xl p-4">
                <p className="text-[#8892a4] text-xs">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Gerar */}
        <div className="card-glass rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">⚡ Ação Rápida</h2>
          <button
            onClick={generateNow} disabled={generating}
            className="bg-[#00d4ff] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#00b8d9] disabled:opacity-50 transition-all"
          >
            {generating ? '⏳ Gerando banner...' : '🚀 Gerar Banner Agora'}
          </button>
          {message && <p className="mt-3 text-sm text-[#00ff88]">{message}</p>}
        </div>

        {/* Últimos banners */}
        <div className="card-glass rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">📸 Últimos Banners</h2>
          {loading ? (
            <p className="text-[#8892a4]">Carregando...</p>
          ) : banners.length === 0 ? (
            <p className="text-[#8892a4]">Nenhum banner gerado ainda.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {banners.slice(0, 6).map(b => (
                <div key={b.id} className="card-glass rounded-xl overflow-hidden">
                  <img src={b.file_path} alt="banner" className="w-full object-cover" />
                  <div className="p-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">{new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                      <p className="text-[#8892a4] text-xs">{b.games_count} jogos</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-black font-bold ${statusColor[b.status] ?? 'bg-gray-500'}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
