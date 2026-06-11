'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Banner {
  id: string; date: string; file_path: string;
  file_path_stories?: string; games_count: number;
  status: string; telegram_sent_at?: string;
}

export default function HistoryPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/banners?limit=60').then(r => r.json()).then(setBanners).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    sent: 'bg-green-500', generated: 'bg-yellow-500',
    pending: 'bg-blue-500', failed: 'bg-red-500',
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1a3060] bg-[#0a0e1a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00d4ff]">📋 Histórico</h1>
          <Link href="/" className="text-[#8892a4] hover:text-white text-sm">← Dashboard</Link>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? <p className="text-[#8892a4]">Carregando...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {banners.map(b => (
              <div key={b.id} className="card-glass rounded-xl overflow-hidden">
                <img src={b.file_path} alt="banner" className="w-full" />
                <div className="p-3">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{new Date(b.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-black font-bold ${statusColor[b.status] ?? 'bg-gray-500'}`}>{b.status}</span>
                  </div>
                  <p className="text-[#8892a4] text-xs mt-1">{b.games_count} jogos</p>
                  <div className="flex gap-3 mt-2">
                    <a href={b.file_path} download className="text-[#00d4ff] text-xs hover:underline">⬇ Post</a>
                    {b.file_path_stories && <a href={b.file_path_stories} download className="text-[#00ff88] text-xs hover:underline">⬇ Stories</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
