// =====================================================================
//  INFORLOZZI BANNER - Configuração de Canais e Competições
//  Edite aqui para mudar os canais que aparecem no banner
// =====================================================================

export interface CompetitionConfig {
  id: number;        // ID na football-data.org
  code: string;      // Código curto (ex: WC, BSA)
  name: string;      // Nome exibido no banner
  country: string;   // País/região
  channel: string;   // Canal de TV padrão
  active: boolean;   // true = monitora esta competição
}

export const COMPETITIONS: CompetitionConfig[] = [
  // ── COPA DO MUNDO ────────────────────────────────────────────────
  {
    id: 2000,
    code: 'WC',
    name: 'Copa do Mundo',
    country: 'Mundial',
    channel: 'SBT / CazéTV',
    active: true,
  },
  // ── BRASIL ───────────────────────────────────────────────────────
  {
    id: 2013,
    code: 'BSA',
    name: 'Brasileirão Série A',
    country: 'Brasil',
    channel: 'Sportv / Premiere',
    active: true,
  },
  // ── EUROPA ───────────────────────────────────────────────────────
  {
    id: 2001,
    code: 'CL',
    name: 'Champions League',
    country: 'Europa',
    channel: 'TNT Sports / Max',
    active: true,
  },
  {
    id: 2021,
    code: 'PL',
    name: 'Premier League',
    country: 'Inglaterra',
    channel: 'ESPN / Disney+',
    active: true,
  },
  {
    id: 2014,
    code: 'PD',
    name: 'La Liga',
    country: 'Espanha',
    channel: 'ESPN / Disney+',
    active: true,
  },
  {
    id: 2019,
    code: 'SA',
    name: 'Serie A Italiana',
    country: 'Itália',
    channel: 'ESPN / Disney+',
    active: true,
  },
  {
    id: 2015,
    code: 'FL1',
    name: 'Ligue 1',
    country: 'França',
    channel: 'ESPN / Disney+',
    active: true,
  },
  {
    id: 2002,
    code: 'BL1',
    name: 'Bundesliga',
    country: 'Alemanha',
    channel: 'OneFootball',
    active: true,
  },
  {
    id: 2018,
    code: 'EC',
    name: 'Eurocopa',
    country: 'Europa',
    channel: 'SBT / CazéTV',
    active: true,
  },
  // ── AMÉRICAS ─────────────────────────────────────────────────────
  {
    id: 2152,
    code: 'CLI',
    name: 'Copa Libertadores',
    country: 'América do Sul',
    channel: 'ESPN / Paramount+',
    active: true,
  },
  {
    id: 2016,
    code: 'ELC',
    name: 'Championship',
    country: 'Inglaterra',
    channel: 'ESPN',
    active: false,
  },
  {
    id: 2003,
    code: 'DED',
    name: 'Eredivisie',
    country: 'Holanda',
    channel: 'OneFootball',
    active: false,
  },
  {
    id: 2017,
    code: 'PPL',
    name: 'Primeira Liga',
    country: 'Portugal',
    channel: 'ESPN',
    active: false,
  },
];

// Helper: retorna só as competições ativas
export function getActiveCompetitions() {
  return COMPETITIONS.filter(c => c.active);
}

// Helper: retorna canal pelo código da competição
export function getChannelByCode(code: string): string {
  return COMPETITIONS.find(c => c.code === code)?.channel ?? 'Sportv';
}

// Helper: retorna canal pelo ID da competição
export function getChannelById(id: number): string {
  return COMPETITIONS.find(c => c.id === id)?.channel ?? 'Sportv';
}
