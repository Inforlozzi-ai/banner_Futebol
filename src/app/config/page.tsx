'use client';
import { useEffect, useState } from 'react';

interface Competition {
  id: number;
  code: string;
  name: string;
  country: string;
  channel: string;
  active: boolean;
  status: string;
}

export default function ConfigPage() {
  const [data, setData] = useState<{ competitions: Competition[]; active: number; total: number } | null>(null);

  useEffect(() => {
    fetch('/api/config').then(r => r.json()).then(setData);
  }, []);

  if (!data) return (
    <div style={{ background: '#0a1628', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: 'Arial' }}>
      Carregando...
    </div>
  );

  return (
    <div style={{ background: '#0a1628', minHeight: '100vh', fontFamily: 'Arial', color: '#fff', padding: '32px 24px' }}>
      <h1 style={{ color: '#FFD700', fontSize: 28, marginBottom: 4 }}>⚙️ Inforlozzi Banner — Configurações</h1>
      <p style={{ color: '#8892a4', marginBottom: 32 }}>
        {data.active} competições ativas de {data.total} total
      </p>

      <h2 style={{ color: '#00d4ff', fontSize: 18, marginBottom: 16 }}>🏆 Competições Monitoradas</h2>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
          <thead>
            <tr style={{ background: '#0d1530', borderBottom: '2px solid #1a3060' }}>
              <th style={th}>ID</th>
              <th style={th}>Código</th>
              <th style={th}>Competição</th>
              <th style={th}>País</th>
              <th style={th}>Canal TV</th>
              <th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.competitions.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#0d1530' : '#111d40', borderBottom: '1px solid #1a3060' }}>
                <td style={{ ...td, color: '#FFD700', fontWeight: 'bold' }}>{c.id}</td>
                <td style={{ ...td, color: '#00d4ff', fontFamily: 'monospace', fontWeight: 'bold' }}>{c.code}</td>
                <td style={{ ...td, fontWeight: 'bold' }}>{c.name}</td>
                <td style={{ ...td, color: '#8892a4' }}>{c.country}</td>
                <td style={{ ...td, color: '#00ff88' }}>{c.channel}</td>
                <td style={td}>{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 48, background: '#0d1530', borderRadius: 12, padding: 24, border: '1px solid #1a3060' }}>
        <h2 style={{ color: '#00d4ff', fontSize: 18, marginBottom: 16 }}>📋 Como alterar canais</h2>
        <p style={{ color: '#8892a4', lineHeight: 1.8 }}>
          Edite o arquivo <code style={{ color: '#FFD700', background: '#080d1a', padding: '2px 8px', borderRadius: 4 }}>src/lib/channels.ts</code><br />
          Cada competição tem os campos: <strong>id</strong> (da football-data.org), <strong>code</strong>, <strong>name</strong>, <strong>channel</strong> e <strong>active</strong>.<br />
          Para desativar uma competição, mude <code style={{ color: '#00ff88' }}>active: true</code> para <code style={{ color: '#ff3366' }}>active: false</code>.<br />
          Após editar, faça rebuild: <code style={{ color: '#FFD700', background: '#080d1a', padding: '2px 8px', borderRadius: 4 }}>docker compose up -d --build</code>
        </p>
      </div>

      <div style={{ marginTop: 24, background: '#0d1530', borderRadius: 12, padding: 24, border: '1px solid #1a3060' }}>
        <h2 style={{ color: '#00d4ff', fontSize: 18, marginBottom: 16 }}>🔧 Ações rápidas</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a href='/api/games' target='_blank' style={btn}>📅 Ver jogos de hoje</a>
          <a href='/api/config' target='_blank' style={btn}>📋 JSON de competições</a>
          <a href='/banners' target='_blank' style={{ ...btn, background: '#1a3060' }}>🖼️ Ver banners</a>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { textAlign: 'left', padding: '10px 16px', color: '#8892a4', fontWeight: 600 };
const td: React.CSSProperties = { padding: '10px 16px' };
const btn: React.CSSProperties = { background: '#0a3d8f', color: '#fff', padding: '10px 20px', borderRadius: 8, textDecoration: 'none', fontWeight: 'bold', fontSize: 14 };
