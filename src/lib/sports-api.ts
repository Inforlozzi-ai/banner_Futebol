import axios from 'axios';

// ============================================
// CLIENTES DE API
// ============================================
const footballApi = axios.create({
  baseURL: `https://${process.env.FOOTBALL_API_HOST}`,
  headers: {
    'x-rapidapi-key': process.env.FOOTBALL_API_KEY!,
    'x-rapidapi-host': process.env.FOOTBALL_API_HOST!,
  },
});

const basketballApi = axios.create({
  baseURL: 'https://v1.basketball.api-sports.io',
  headers: {
    'x-rapidapi-key': process.env.FOOTBALL_API_KEY!, // mesma key
    'x-rapidapi-host': 'v1.basketball.api-sports.io',
  },
});

const mmaApi = axios.create({
  baseURL: 'https://v1.mma.api-sports.io',
  headers: {
    'x-rapidapi-key': process.env.FOOTBALL_API_KEY!,
    'x-rapidapi-host': 'v1.mma.api-sports.io',
  },
});

// ============================================
// TIPO UNIFICADO
// ============================================
export type Sport = 'football' | 'basketball' | 'volleyball' | 'mma';

export interface SportEvent {
  external_id: string;
  sport: Sport;
  datetime_utc: string;
  datetime_brasilia: string;
  date: string;
  home_team: string;
  away_team: string;
  home_logo: string;
  away_logo: string;
  league: string;
  league_logo: string;
  league_id: number;
  country: string;
  status: string;
  sport_label: string;   // ex: '⚽ Futebol'
  sport_emoji: string;   // ex: '⚽'
}

// ============================================
// CAMPEONATOS PRIORITÁRIOS
// ============================================
export const FOOTBALL_LEAGUES = [
  { id: 71,  name: 'Brasileirão Série A' },
  { id: 73,  name: 'Copa do Brasil' },
  { id: 13,  name: 'Libertadores' },
  { id: 11,  name: 'Sul-Americana' },
  { id: 2,   name: 'Champions League' },
  { id: 39,  name: 'Premier League' },
  { id: 140, name: 'La Liga' },
  { id: 135, name: 'Serie A Italiana' },
];

export const BASKETBALL_LEAGUES = [
  { id: 12,  name: 'NBA' },
  { id: 28,  name: 'NBB (Brasil)' },
  { id: 120, name: 'EuroLeague' },
  { id: 116, name: 'FIBA World Cup' },
];

export const VOLLEYBALL_LEAGUES = [
  { id: 5,  name: 'Superliga Masculina' },
  { id: 6,  name: 'Superliga Feminina' },
  { id: 1,  name: 'Liga das Nações' },
];

const SPORT_META: Record<Sport, { emoji: string; label: string }> = {
  football:   { emoji: '⚽', label: '⚽ Futebol' },
  basketball: { emoji: '🏀', label: '🏀 Basquete' },
  volleyball: { emoji: '🏐', label: '🏐 Vôlei' },
  mma:        { emoji: '🥊', label: '🥊 Lutas' },
};

// ============================================
// HELPER: formatar data Brasília
// ============================================
async function toBrasilia(utcStr: string): Promise<string> {
  const { formatInTimeZone } = await import('date-fns-tz');
  return formatInTimeZone(new Date(utcStr), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssxxx");
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

// ============================================
// FUTEBOL
// ============================================
export async function fetchFootballEvents(date: string): Promise<SportEvent[]> {
  const events: SportEvent[] = [];
  for (const league of FOOTBALL_LEAGUES) {
    try {
      const res = await footballApi.get('/fixtures', {
        params: { date, league: league.id, season: new Date().getFullYear() },
      });
      for (const f of res.data.response ?? []) {
        events.push({
          external_id:       `football_${f.fixture.id}`,
          sport:             'football',
          datetime_utc:      f.fixture.date,
          datetime_brasilia: await toBrasilia(f.fixture.date),
          date,
          home_team:  f.teams.home.name,
          away_team:  f.teams.away.name,
          home_logo:  f.teams.home.logo ?? '',
          away_logo:  f.teams.away.logo ?? '',
          league:     f.league.name,
          league_logo: f.league.logo ?? '',
          league_id:  f.league.id,
          country:    f.league.country,
          status:     f.fixture.status.short,
          sport_label: SPORT_META.football.label,
          sport_emoji: SPORT_META.football.emoji,
        });
      }
      await sleep(300);
    } catch (err) { console.error(`Football liga ${league.id}:`, err); }
  }
  return events;
}

// ============================================
// BASQUETE
// ============================================
export async function fetchBasketballEvents(date: string): Promise<SportEvent[]> {
  const events: SportEvent[] = [];
  for (const league of BASKETBALL_LEAGUES) {
    try {
      const res = await basketballApi.get('/games', {
        params: { date, league: league.id, season: `${new Date().getFullYear()-1}-${new Date().getFullYear()}` },
      });
      for (const g of res.data.response ?? []) {
        const utc = g.date.start;
        events.push({
          external_id:       `basketball_${g.id}`,
          sport:             'basketball',
          datetime_utc:      utc,
          datetime_brasilia: await toBrasilia(utc),
          date,
          home_team:  g.teams.home.name,
          away_team:  g.teams.visitors.name,
          home_logo:  g.teams.home.logo ?? '',
          away_logo:  g.teams.visitors.logo ?? '',
          league:     g.league.name,
          league_logo: g.league.logo ?? '',
          league_id:  g.league.id,
          country:    g.country.name ?? '',
          status:     g.status.short,
          sport_label: SPORT_META.basketball.label,
          sport_emoji: SPORT_META.basketball.emoji,
        });
      }
      await sleep(300);
    } catch (err) { console.error(`Basketball liga ${league.id}:`, err); }
  }
  return events;
}

// ============================================
// VÔLEI (API-Sports volleyball)
// ============================================
export async function fetchVolleyballEvents(date: string): Promise<SportEvent[]> {
  const api = axios.create({
    baseURL: 'https://v1.volleyball.api-sports.io',
    headers: {
      'x-rapidapi-key': process.env.FOOTBALL_API_KEY!,
      'x-rapidapi-host': 'v1.volleyball.api-sports.io',
    },
  });
  const events: SportEvent[] = [];
  for (const league of VOLLEYBALL_LEAGUES) {
    try {
      const res = await api.get('/games', {
        params: { date, league: league.id, season: new Date().getFullYear() },
      });
      for (const g of res.data.response ?? []) {
        const utc = g.date;
        events.push({
          external_id:       `volleyball_${g.id}`,
          sport:             'volleyball',
          datetime_utc:      utc,
          datetime_brasilia: await toBrasilia(utc),
          date,
          home_team:  g.teams.home.name,
          away_team:  g.teams.away.name,
          home_logo:  g.teams.home.logo ?? '',
          away_logo:  g.teams.away.logo ?? '',
          league:     g.league.name,
          league_logo: g.league.logo ?? '',
          league_id:  g.league.id,
          country:    g.country.name ?? '',
          status:     g.status.short ?? 'NS',
          sport_label: SPORT_META.volleyball.label,
          sport_emoji: SPORT_META.volleyball.emoji,
        });
      }
      await sleep(300);
    } catch (err) { console.error(`Volleyball liga ${league.id}:`, err); }
  }
  return events;
}

// ============================================
// LUTAS (MMA)
// ============================================
export async function fetchMMAEvents(date: string): Promise<SportEvent[]> {
  const events: SportEvent[] = [];
  try {
    const res = await mmaApi.get('/fights', { params: { date } });
    for (const f of res.data.response ?? []) {
      const utc = f.date;
      events.push({
        external_id:       `mma_${f.id}`,
        sport:             'mma',
        datetime_utc:      utc,
        datetime_brasilia: await toBrasilia(utc),
        date,
        home_team:  f.fighters?.first?.name ?? 'Fighter 1',
        away_team:  f.fighters?.second?.name ?? 'Fighter 2',
        home_logo:  f.fighters?.first?.image ?? '',
        away_logo:  f.fighters?.second?.image ?? '',
        league:     f.event?.name ?? 'MMA Event',
        league_logo: f.event?.image ?? '',
        league_id:  f.event?.id ?? 0,
        country:    f.country?.name ?? '',
        status:     f.status ?? 'NS',
        sport_label: SPORT_META.mma.label,
        sport_emoji: SPORT_META.mma.emoji,
      });
    }
  } catch (err) { console.error('MMA events:', err); }
  return events;
}

// ============================================
// BUSCA TODOS OS ESPORTES
// ============================================
export async function fetchAllSportsEvents(date: string): Promise<SportEvent[]> {
  const [football, basketball, volleyball, mma] = await Promise.allSettled([
    fetchFootballEvents(date),
    fetchBasketballEvents(date),
    fetchVolleyballEvents(date),
    fetchMMAEvents(date),
  ]);

  const all: SportEvent[] = [
    ...(football.status   === 'fulfilled' ? football.value   : []),
    ...(basketball.status === 'fulfilled' ? basketball.value : []),
    ...(volleyball.status === 'fulfilled' ? volleyball.value : []),
    ...(mma.status        === 'fulfilled' ? mma.value        : []),
  ];

  // Ordenar por horário
  all.sort((a, b) =>
    new Date(a.datetime_brasilia).getTime() - new Date(b.datetime_brasilia).getTime()
  );

  return all;
}
