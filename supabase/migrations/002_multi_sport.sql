-- Adicionar coluna sport na tabela games
ALTER TABLE games ADD COLUMN IF NOT EXISTS sport TEXT DEFAULT 'football';
ALTER TABLE games ADD COLUMN IF NOT EXISTS sport_emoji TEXT DEFAULT '⚽';

-- Atualizar registros existentes
UPDATE games SET sport = 'football', sport_emoji = '⚽' WHERE sport IS NULL;

-- Alterar coluna external_id para TEXT (suporta basketball_123, mma_456 etc)
ALTER TABLE games ALTER COLUMN external_id TYPE TEXT USING external_id::TEXT;

-- Índice por esporte
CREATE INDEX IF NOT EXISTS idx_games_sport ON games(sport);
CREATE INDEX IF NOT EXISTS idx_games_date_sport ON games(date, sport);
