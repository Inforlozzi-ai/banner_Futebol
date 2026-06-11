'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Game {
  id: string; home_team: string; away_team: string;
  home_logo: string; away_logo: string; league: string;
  datetime_brasilia: string; date: string; status: string;
}

export default function GamesPage() {
  const [games, setGames]     = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate]       = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => { loadGames(); }, [date]);

  async function loadGames() {
    setLoading(true);
    try {
      const r = await fetch(`/api/games?date=${date}`);
      setGames(await r.json());
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1a3060] bg-[#0a0e1a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00d4ff]">⚽ Jogos</h1>
          <Link href="/" className="text-[#8892a4] hover:text-white text-sm">← Dashboard</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-[#0d1530] border border-[#1a3060] text-white px-4 py-2 rounded-lg focus:outline-none focus:border-[#00d4ff]"
          />
        </div>
        {loading ? <p className="text-[#8892a4]">Carregando jogos...</p>
          : games.length === 0 ? <p className="text-[#8892a4]">Nenhum jogo para esta data.</p>
          : (
            <div className="space-y-3">
              {games.map(g => (
                <div key={g.id} className="card-glass rounded-xl p-4 flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    {g.home_logo && <img src={g.home_logo} className="w-8 h-8 object-contain" alt="" />}
                    <span className="font-semibold text-sm">{g.home_team}</span>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <p className="text-[#ffd700] font-bold text-sm">
                      {new Date(g.datetime_brasilia).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[#00d4ff] text-xs font-bold">VS</p>
                  </div>
                  <div className="flex items-center gap-3 flex-1 justify-end">
                    <span className="font-semibold text-sm">{g.away_team}</span>
                    {g.away_logo && <img src={g.away_logo} className="w-8 h-8 object-contain" alt="" />}
                  </div>
                  <p className="text-[#8892a4] text-xs min-w-[120px] text-right">{g.league}</p>
                </div>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
