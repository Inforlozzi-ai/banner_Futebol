'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Setting { key: string; value: string; description: string; }

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).finally(() => setLoading(false));
  }, []);

  function upd(key: string, value: string) {
    setSettings(p => p.map(s => s.key === key ? { ...s, value } : s));
  }

  async function save() {
    setSaving(true); setMsg('');
    try {
      await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settings) });
      setMsg('✅ Configurações salvas!');
    } catch { setMsg('❌ Erro ao salvar'); }
    finally { setSaving(false); }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#1a3060] bg-[#0a0e1a] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00d4ff]">⚙️ Configurações</h1>
          <Link href="/" className="text-[#8892a4] hover:text-white text-sm">← Dashboard</Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? <p className="text-[#8892a4]">Carregando...</p> : (
          <div className="card-glass rounded-xl p-6 space-y-5">
            {settings.map(s => (
              <div key={s.key}>
                <label className="block text-sm font-semibold text-[#c4cdd8] mb-1">
                  {s.description || s.key}
                </label>
                <input value={s.value} onChange={e => upd(s.key, e.target.value)}
                  className="w-full bg-[#080d1a] border border-[#1a3060] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#00d4ff] text-sm"
                />
              </div>
            ))}
            <button onClick={save} disabled={saving}
              className="bg-[#00d4ff] text-black font-bold px-6 py-2 rounded-lg hover:bg-[#00b8d9] disabled:opacity-50 transition-all">
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </button>
            {msg && <p className="text-sm text-[#00ff88]">{msg}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
