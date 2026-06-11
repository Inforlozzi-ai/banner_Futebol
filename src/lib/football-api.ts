import axios from 'axios';

function getApi() {
  const key = process.env.FOOTBALL_API_KEY;
  const host = 'v3.football.api-sports.io';
  return axios.create({
    baseURL: `https://${host}`,
    headers: {
      'x-rapidapi-key': key ?? '',
      'x-rapidapi-host': host,
    },
  });
}

export const PRIORITY_LEAGUES = [
  { id: 71,  name: 'Brasileirão Série A', priority: 1 },
  { id: 72,  name: 'Brasileirão Série B', priority: 2 },
  { id: 73,  name: 'Copa do Brasil',      priority: 3 },
  { id: 13,  name: 'Libertadores',        priority: 4 },
  { id: 11,  name: 'Sul-Americana',       priority: 5 },
  { id: 2,   name: 'Champions League',    priority: 6 },
  { id: 39,  name: 'Premier League',      priority: 7 },
  { id: 140, name: 'La Liga',             priority: 8 },
  { id: 135, name: 'Serie A Italiana',    priority: 9 },
  { id: 61,  name: 'Ligue 1',             priority: 10 },
  { id: 78,  name: 'Bundesliga',          priority: 11 },
];

export interface Game {
  external_id: number;
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
}

export async function fetchGamesToday(date?: string): Promise<Game[]> {
  const api = getApi();
  const { formatInTimeZone } = await import('date-fns-tz');
  const targetDate = date ?? formatInTimeZone(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd');

  const allGames: Game[] = [];

  for (const league of PRIORITY_LEAGUES) {
    try {
      const res = await api.get('/fixtures', {
        params: { date: targetDate, league: league.id, season: new Date().getFullYear() },
      });
      const fixtures = res.data.response ?? [];
      for (const f of fixtures) {
        const utcDate = new Date(f.fixture.date);
        const brDate = formatInTimeZone(utcDate, 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssxxx");
        allGames.push({
          external_id:       f.fixture.id,
          datetime_utc:      f.fixture.date,
          datetime_brasilia: brDate,
          date:              targetDate,
          home_team:         f.teams.home.name,
          away_team:         f.teams.away.name,
          home_logo:         f.teams.home.logo ?? '',
          away_logo:         f.teams.away.logo ?? '',
          league:            f.league.name,
          league_logo:       f.league.logo ?? '',
          league_id:         f.league.id,
          country:           f.league.country,
          status:            f.fixture.status.short,
        });
      }
      await new Promise(r => setTimeout(r, 350));
    } catch (err) {
      console.error(`Erro ao buscar liga ${league.id}:`, err);
    }
  }

  allGames.sort((a, b) =>
    new Date(a.datetime_brasilia).getTime() - new Date(b.datetime_brasilia).getTime()
  );

  return allGames;
}
