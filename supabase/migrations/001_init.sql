-- ============================================
-- TABELA: banners
-- ============================================
CREATE TABLE IF NOT EXISTS banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  file_path TEXT NOT NULL,
  file_path_stories TEXT,
  telegram_message_id TEXT,
  telegram_sent_at TIMESTAMPTZ,
  games_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'generated', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: games
-- ============================================
CREATE TABLE IF NOT EXISTS games (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id INTEGER UNIQUE NOT NULL,
  date DATE NOT NULL,
  datetime_utc TIMESTAMPTZ NOT NULL,
  datetime_brasilia TIMESTAMPTZ NOT NULL,
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  home_logo TEXT,
  away_logo TEXT,
  league TEXT NOT NULL,
  league_logo TEXT,
  league_id INTEGER,
  country TEXT,
  status TEXT DEFAULT 'NS',
  home_score INTEGER,
  away_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: logs
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'success')),
  message TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABELA: settings
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO settings (key, value, description) VALUES
  ('cron_enabled', 'true', 'Habilitar agendamento automático'),
  ('cron_time', '06:00', 'Horário de execução do cron'),
  ('max_games_per_banner', '10', 'Máximo de jogos por banner'),
  ('priority_leagues', '71,73,13,11,9,140,39,135,2', 'IDs dos campeonatos prioritários (API-Football)')
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_banners_date ON banners(date);
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_datetime ON games(datetime_brasilia);
CREATE INDEX IF NOT EXISTS idx_logs_created ON logs(created_at DESC);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON banners FOR ALL USING (true);
CREATE POLICY "service_role_all" ON games FOR ALL USING (true);
CREATE POLICY "service_role_all" ON logs FOR ALL USING (true);
CREATE POLICY "service_role_all" ON settings FOR ALL USING (true);
