import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

const api = axios.create({
  baseURL: 'https://api.football-data.org/v4',
  headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY! },
});

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
  sport_label: string;
  sport_emoji: string;
}

const COMPETITIONS = [
  { code: 'WC',  name: 'Copa do Mundo',      logo: 'https://crests.football-data.org/wm26.png',  country: 'World',   id: 2000 },
  { code: 'BSA', name: 'Brasileirao Serie A', logo: 'https://crests.football-data.org/BSA.png',   country: 'Brazil',  id: 2013 },
  { code: 'CL',  name: 'Champions League',   logo: 'https://crests.football-data.org/CL.png',    country: 'Europe',  id: 2001 },
  { code: 'PL',  name: 'Premier League',     logo: 'https://crests.football-data.org/PL.png',    country: 'England', id: 2021 },
  { code: 'PD',  name: 'La Liga',            logo: 'https://crests.football-data.org/PD.png',    country: 'Spain',   id: 2014 },
  { code: 'SA',  name: 'Serie A Italiana',   logo: 'https://crests.football-data.org/SA.png',    country: 'Italy',   id: 2019 },
  { code: 'FL1', name: 'Ligue 1',            logo: 'https://crests.football-data.org/FL1.png',   country: 'France',  id: 2015 },
  { code: 'BL1', name: 'Bundesliga',         logo: 'https://crests.football-data.org/BL1.png',   country: 'Germany', id: 2002 },
  { code: 'EC',  name: 'Eurocopa',           logo: 'https://crests.football-data.org/EC.png',    country: 'Europe',  id: 2018 },
  { code: 'CLI', name: 'Libertadores',       logo: 'https://crests.football-data.org/CLI.png',   country: 'South America', id: 2152 },
];

function mapStatus(s: string): string {
  const map: Record<string, string> = {
    SCHEDULED: 'NS', TIMED: 'NS', IN_PLAY: '1H', PAUSED: 'HT',
    FINISHED: 'FT', POSTPONED: 'PST', SUSPENDED: 'SUSP', CANCELLED: 'CANC', LIVE: 'LIVE',
  };
  return map[s] ?? s;
}

function toBrasilia(utcStr: string): string {
  return formatInTimeZone(new Date(utcStr), 'America/Sao_Paulo', "yyyy-MM-dd'T'HH:mm:ssxxx");
}

async function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export async function fetchFootballEvents(date: string): Promise<SportEvent[]> {
  const events: SportEvent[] = [];
  for (const comp of COMPETITIONS) {
    try {
      const res = await api.get(`/competitions/${comp.code}/matches`, {
        params: { dateFrom: date, dateTo: date },
      });
      for (const m of res.data.matches ?? []) {
        events.push({
          external_id:       `football_${m.id}`,
          sport:             'football',
          datetime_utc:      m.utcDate,
          datetime_brasilia: toBrasilia(m.utcDate),
          date,
          home_team:   m.homeTeam?.shortName ?? m.homeTeam?.name ?? 'Casa',
          away_team:   m.awayTeam?.shortName ?? m.awayTeam?.name ?? 'Fora',
          home_logo:   m.homeTeam?.crest ?? '',
          away_logo:   m.awayTeam?.crest ?? '',
          league:      comp.name,
          league_logo: comp.logo,
          league_id:   comp.id,
          country:     comp.country,
          status:      mapStatus(m.status),
          sport_label: 'Futebol',
          sport_emoji: '',
        });
      }
      await sleep(300);
    } catch (err: any) {
      console.error(`Erro ${comp.code}:`, err?.response?.data ?? err.message);
    }
  }
  return events;
}

export async function fetchBasketballEvents(_date: string): Promise<SportEvent[]> { return []; }
export async function fetchVolleyballEvents(_date: string): Promise<SportEvent[]> { return []; }
export async function fetchMMAEvents(_date: string): Promise<SportEvent[]> { return []; }

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
  all.sort((a, b) => new Date(a.datetime_brasilia).getTime() - new Date(b.datetime_brasilia).getTime());
  return all;
}
