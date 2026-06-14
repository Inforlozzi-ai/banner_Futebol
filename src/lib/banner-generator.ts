import { createCanvas, loadImage } from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SportEvent } from './sports-api';
import { getChannelById } from './channels';

const BANNERS_DIR = path.join(process.cwd(), 'public', 'banners');
if (!fs.existsSync(BANNERS_DIR)) fs.mkdirSync(BANNERS_DIR, { recursive: true });

// ─────────────────────────────────────────────
//  TIPOS
// ─────────────────────────────────────────────
export type TemplateId = 'classic' | 'neon' | 'minimal';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  preview_colors: string[];
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'classic',
    name: 'Clássico',
    description: 'Fundo gradiente colorido com mascote. Estilo original.',
    preview_colors: ['#0a4a9f', '#0e8a40', '#d49020', '#c84010'],
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Fundo preto com bordas e texto neon verde. Estilo moderno/cyberpunk.',
    preview_colors: ['#000000', '#00ff88', '#00ccff', '#1a1a1a'],
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Fundo branco com tipografia bold preta. Estilo clean e profissional.',
    preview_colors: ['#f5f5f5', '#111111', '#FFD700', '#e0e0e0'],
  },
];

// ─────────────────────────────────────────────
//  HELPERS COMUNS
// ─────────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function tryLoadImage(url: string) {
  if (!url) return null;
  try { return await loadImage(url); } catch { return null; }
}

async function drawMascot(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const mascotPath = path.join(process.cwd(), 'public', 'assets', 'mascote.png');
  if (!fs.existsSync(mascotPath)) return;
  try {
    const img = await loadImage(mascotPath);
    const mH = 340;
    const mW = Math.round((img.width / img.height) * mH);
    ctx.drawImage(img, w - mW - 8, h - mH - 70, mW, mH);
  } catch { /* ok */ }
}

function getTimeLabel(event: SportEvent, channel: string): string {
  const { formatInTimeZone } = require('date-fns-tz');
  const time = formatInTimeZone(new Date(event.datetime_brasilia), 'America/Sao_Paulo', 'HH:mm');
  return `${time}  |  ${channel}`;
}

// ─────────────────────────────────────────────
//  TEMPLATE: CLASSIC
// ─────────────────────────────────────────────
function drawClassicBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0,    '#0a4a9f');
  g.addColorStop(0.4,  '#0e8a40');
  g.addColorStop(0.75, '#d49020');
  g.addColorStop(1,    '#c84010');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const rg = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.7);
  rg.addColorStop(0, 'rgba(255,255,255,0.10)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.88);
  ctx.bezierCurveTo(w * 0.3, h * 0.78, w * 0.7, h * 0.94, w, h * 0.84);
  ctx.lineTo(w, h); ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

function drawClassicHeader(ctx: CanvasRenderingContext2D, w: number, date: Date, title: string) {
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 10;

  ctx.font = 'bold 82px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRINCIPAIS', w / 2, 104);

  const gText = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
  gText.addColorStop(0, '#FFB300');
  gText.addColorStop(0.5, '#FFE066');
  gText.addColorStop(1, '#FFB300');
  ctx.fillStyle = gText;
  ctx.font = 'bold 90px Arial';
  ctx.fillText('JOGOS DO DIA', w / 2, 198);
  ctx.shadowBlur = 0;

  const dateStr = format(date, "EEEE | dd 'DE' MMMM", { locale: ptBR }).toUpperCase();
  const bW = 700, bH = 56, bX = (w - bW) / 2, bY = 218;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  roundRect(ctx, bX, bY, bW, bH, 28); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 2;
  roundRect(ctx, bX, bY, bW, bH, 28); ctx.stroke();
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, w / 2, bY + 38);
}

function drawClassicFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 12;
  const gf = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
  gf.addColorStop(0, '#FFB300');
  gf.addColorStop(0.5, '#FFE066');
  gf.addColorStop(1, '#FFB300');
  ctx.fillStyle = gf;
  ctx.font = 'bold 62px Arial';
  ctx.fillText('INFORLOZZI', w / 2, h - 26);
  ctx.shadowBlur = 0;
}

async function drawClassicCard(
  ctx: CanvasRenderingContext2D,
  event: SportEvent,
  channel: string,
  x: number, y: number,
  cardW: number, cardH: number
) {
  const r = 16;
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x, y, cardW, cardH, r);
  ctx.fill();
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  const logoSz = Math.round(cardH * 0.60);
  const pad    = 18;
  const midX   = x + cardW / 2;
  const midY   = y + cardH / 2;

  const homeX = x + pad;
  const homeImg = await tryLoadImage(event.home_logo);
  if (homeImg) {
    ctx.drawImage(homeImg, homeX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#eeeeee';
    roundRect(ctx, homeX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  const textX = homeX + logoSz + 14;
  const textMaxW = midX - textX - 10;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111111';

  const fontSize = cardH > 120 ? 19 : 16;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillText(event.home_team.toUpperCase(), textX, midY - 10);
  ctx.fillText(event.away_team.toUpperCase(), textX, midY + fontSize + 2);

  const timeLabel = getTimeLabel(event, channel);
  const tbY = midY + fontSize + 16;
  const tbH = 30;
  ctx.font = `bold 15px Arial`;
  const tbW = Math.min(ctx.measureText(timeLabel).width + 24, textMaxW + 60);
  ctx.fillStyle = '#111111';
  roundRect(ctx, textX, tbY, tbW, tbH, 6);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.fillText(timeLabel, textX + 12, tbY + 21);

  const awayX = midX + 30;
  const awayImg = await tryLoadImage(event.away_logo);
  if (awayImg) {
    ctx.drawImage(awayImg, awayX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#eeeeee';
    roundRect(ctx, awayX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  const compSz = Math.round(cardH * 0.55);
  const compX  = x + cardW - compSz - pad;
  const leagueImg = await tryLoadImage(event.league_logo);
  if (leagueImg) {
    ctx.drawImage(leagueImg, compX, midY - compSz / 2, compSz, compSz);
  }
  const leagueShort = event.league.length > 13 ? event.league.substring(0, 12) + '.' : event.league;
  ctx.font = '10px Arial';
  ctx.fillStyle = '#888888';
  ctx.textAlign = 'center';
  ctx.fillText(leagueShort, compX + compSz / 2, y + cardH - 6);
}

// ─────────────────────────────────────────────
//  TEMPLATE: NEON
// ─────────────────────────────────────────────
function drawNeonBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Fundo preto profundo
  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, w, h);

  // Grade sutil
  ctx.strokeStyle = 'rgba(0,255,136,0.04)';
  ctx.lineWidth = 1;
  const gridStep = 80;
  for (let gx = 0; gx <= w; gx += gridStep) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
  }
  for (let gy = 0; gy <= h; gy += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  }

  // Brilho neon superior
  const topGlow = ctx.createRadialGradient(w / 2, -100, 0, w / 2, -100, w * 0.8);
  topGlow.addColorStop(0, 'rgba(0,255,136,0.18)');
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = topGlow;
  ctx.fillRect(0, 0, w, h * 0.5);

  // Linha neon no topo
  const topLine = ctx.createLinearGradient(0, 0, w, 0);
  topLine.addColorStop(0,   'rgba(0,255,136,0)');
  topLine.addColorStop(0.3, 'rgba(0,255,136,0.9)');
  topLine.addColorStop(0.7, 'rgba(0,204,255,0.9)');
  topLine.addColorStop(1,   'rgba(0,204,255,0)');
  ctx.fillStyle = topLine;
  ctx.fillRect(0, 0, w, 3);

  // Linha neon no rodapé
  const botLine = ctx.createLinearGradient(0, 0, w, 0);
  botLine.addColorStop(0,   'rgba(0,204,255,0)');
  botLine.addColorStop(0.3, 'rgba(0,204,255,0.9)');
  botLine.addColorStop(0.7, 'rgba(0,255,136,0.9)');
  botLine.addColorStop(1,   'rgba(0,255,136,0)');
  ctx.fillStyle = botLine;
  ctx.fillRect(0, h - 3, w, 3);
}

function drawNeonHeader(ctx: CanvasRenderingContext2D, w: number, date: Date) {
  ctx.textAlign = 'center';

  // Título
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 30;
  ctx.font = 'bold 78px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRINCIPAIS', w / 2, 104);

  ctx.shadowColor = '#00ccff';
  ctx.shadowBlur = 40;
  ctx.font = 'bold 88px Arial';
  const gText = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
  gText.addColorStop(0, '#00ff88');
  gText.addColorStop(0.5, '#00ffcc');
  gText.addColorStop(1, '#00ccff');
  ctx.fillStyle = gText;
  ctx.fillText('JOGOS DO DIA', w / 2, 198);
  ctx.shadowBlur = 0;

  // Caixa data com borda neon
  const dateStr = format(date, "EEEE | dd 'DE' MMMM", { locale: ptBR }).toUpperCase();
  const bW = 700, bH = 56, bX = (w - bW) / 2, bY = 218;
  ctx.fillStyle = 'rgba(0,255,136,0.07)';
  roundRect(ctx, bX, bY, bW, bH, 28); ctx.fill();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 8;
  roundRect(ctx, bX, bY, bW, bH, 28); ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.font = 'bold 26px Arial';
  ctx.fillStyle = '#00ff88';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, w / 2, bY + 38);
}

function drawNeonFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.textAlign = 'center';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 20;
  const gf = ctx.createLinearGradient(w * 0.15, 0, w * 0.85, 0);
  gf.addColorStop(0, '#00ff88');
  gf.addColorStop(0.5, '#00ffcc');
  gf.addColorStop(1, '#00ccff');
  ctx.fillStyle = gf;
  ctx.font = 'bold 62px Arial';
  ctx.fillText('INFORLOZZI', w / 2, h - 26);
  ctx.shadowBlur = 0;
}

async function drawNeonCard(
  ctx: CanvasRenderingContext2D,
  event: SportEvent,
  channel: string,
  x: number, y: number,
  cardW: number, cardH: number
) {
  const r = 12;
  // Fundo card escuro com leve tint neon
  ctx.fillStyle = '#0d1117';
  roundRect(ctx, x, y, cardW, cardH, r);
  ctx.fill();

  // Borda neon
  ctx.strokeStyle = 'rgba(0,255,136,0.45)';
  ctx.lineWidth = 1.5;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 6;
  roundRect(ctx, x, y, cardW, cardH, r);
  ctx.stroke();
  ctx.shadowBlur = 0;

  const logoSz = Math.round(cardH * 0.58);
  const pad    = 18;
  const midX   = x + cardW / 2;
  const midY   = y + cardH / 2;

  // Logo casa
  const homeX = x + pad;
  const homeImg = await tryLoadImage(event.home_logo);
  if (homeImg) {
    ctx.drawImage(homeImg, homeX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#1a2333';
    roundRect(ctx, homeX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // Textos times
  const textX = homeX + logoSz + 14;
  ctx.textAlign = 'left';
  const fontSize = cardH > 120 ? 19 : 16;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(event.home_team.toUpperCase(), textX, midY - 10);
  ctx.fillStyle = '#cccccc';
  ctx.fillText(event.away_team.toUpperCase(), textX, midY + fontSize + 2);

  // Caixa horário neon
  const timeLabel = getTimeLabel(event, channel);
  const tbY = midY + fontSize + 16;
  const tbH = 30;
  ctx.font = `bold 15px Arial`;
  const tbW = Math.min(ctx.measureText(timeLabel).width + 24, 300);
  ctx.fillStyle = 'rgba(0,255,136,0.12)';
  roundRect(ctx, textX, tbY, tbW, tbH, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,255,136,0.5)';
  ctx.lineWidth = 1;
  roundRect(ctx, textX, tbY, tbW, tbH, 6);
  ctx.stroke();
  ctx.fillStyle = '#00ff88';
  ctx.fillText(timeLabel, textX + 12, tbY + 21);

  // Logo visitante
  const awayX = midX + 30;
  const awayImg = await tryLoadImage(event.away_logo);
  if (awayImg) {
    ctx.drawImage(awayImg, awayX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#1a2333';
    roundRect(ctx, awayX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // Logo liga
  const compSz = Math.round(cardH * 0.55);
  const compX  = x + cardW - compSz - pad;
  const leagueImg = await tryLoadImage(event.league_logo);
  if (leagueImg) {
    ctx.drawImage(leagueImg, compX, midY - compSz / 2, compSz, compSz);
  }
  const leagueShort = event.league.length > 13 ? event.league.substring(0, 12) + '.' : event.league;
  ctx.font = '10px Arial';
  ctx.fillStyle = '#00ccff';
  ctx.textAlign = 'center';
  ctx.fillText(leagueShort, compX + compSz / 2, y + cardH - 6);
}

// ─────────────────────────────────────────────
//  TEMPLATE: MINIMAL
// ─────────────────────────────────────────────
function drawMinimalBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#F2F2F2';
  ctx.fillRect(0, 0, w, h);

  // Faixa superior dourada fina
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(0, 0, w, 8);

  // Faixa inferior preta
  ctx.fillStyle = '#111111';
  ctx.fillRect(0, h - 100, w, 100);
}

function drawMinimalHeader(ctx: CanvasRenderingContext2D, w: number, date: Date) {
  ctx.textAlign = 'left';
  ctx.shadowBlur = 0;

  // Bloco lateral esquerdo
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(40, 50, 10, 160);

  ctx.font = 'bold 78px Arial';
  ctx.fillStyle = '#111111';
  ctx.fillText('PRINCIPAIS', 70, 130);

  ctx.font = 'bold 56px Arial';
  ctx.fillStyle = '#333333';
  ctx.fillText('JOGOS DO DIA', 70, 198);

  const dateStr = format(date, "EEEE, dd 'de' MMMM", { locale: ptBR }).toUpperCase();
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#888888';
  ctx.fillText(dateStr, 72, 240);

  // Linha divisória
  ctx.fillStyle = '#DDDDDD';
  ctx.fillRect(40, 262, w - 80, 2);
}

function drawMinimalFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.textAlign = 'center';
  ctx.font = 'bold 58px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 6;
  ctx.fillText('INFORLOZZI', w / 2, h - 28);
  ctx.shadowBlur = 0;
}

async function drawMinimalCard(
  ctx: CanvasRenderingContext2D,
  event: SportEvent,
  channel: string,
  x: number, y: number,
  cardW: number, cardH: number
) {
  const r = 8;
  // Fundo branco com borda cinza
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x, y, cardW, cardH, r);
  ctx.fill();
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 1.5;
  roundRect(ctx, x, y, cardW, cardH, r);
  ctx.stroke();

  // Acento dourado esquerdo
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.moveTo(x, y + r);
  ctx.lineTo(x, y + cardH - r);
  ctx.quadraticCurveTo(x, y + cardH, x + r, y + cardH);
  ctx.quadraticCurveTo(x, y + cardH, x, y + cardH - r);
  ctx.lineTo(x, y + r);
  ctx.closePath();
  ctx.fillRect(x, y + r, 5, cardH - r * 2);

  const logoSz = Math.round(cardH * 0.58);
  const pad    = 20;
  const midX   = x + cardW / 2;
  const midY   = y + cardH / 2;

  // Logo casa
  const homeX = x + pad + 4;
  const homeImg = await tryLoadImage(event.home_logo);
  if (homeImg) {
    ctx.drawImage(homeImg, homeX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#F0F0F0';
    roundRect(ctx, homeX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // Textos
  const textX = homeX + logoSz + 14;
  ctx.textAlign = 'left';
  const fontSize = cardH > 120 ? 20 : 16;
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = '#111111';
  ctx.fillText(event.home_team.toUpperCase(), textX, midY - 10);
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = '#444444';
  ctx.fillText(event.away_team.toUpperCase(), textX, midY + fontSize + 2);

  // Caixa horário clean
  const timeLabel = getTimeLabel(event, channel);
  const tbY = midY + fontSize + 16;
  const tbH = 28;
  ctx.font = `bold 14px Arial`;
  const tbW = Math.min(ctx.measureText(timeLabel).width + 24, 300);
  ctx.fillStyle = '#111111';
  roundRect(ctx, textX, tbY, tbW, tbH, 4);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.fillText(timeLabel, textX + 12, tbY + 20);

  // Logo visitante
  const awayX = midX + 30;
  const awayImg = await tryLoadImage(event.away_logo);
  if (awayImg) {
    ctx.drawImage(awayImg, awayX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#F0F0F0';
    roundRect(ctx, awayX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // Logo liga
  const compSz = Math.round(cardH * 0.52);
  const compX  = x + cardW - compSz - pad;
  const leagueImg = await tryLoadImage(event.league_logo);
  if (leagueImg) {
    ctx.drawImage(leagueImg, compX, midY - compSz / 2, compSz, compSz);
  }
  const leagueShort = event.league.length > 13 ? event.league.substring(0, 12) + '.' : event.league;
  ctx.font = '10px Arial';
  ctx.fillStyle = '#999999';
  ctx.textAlign = 'center';
  ctx.fillText(leagueShort, compX + compSz / 2, y + cardH - 6);
}

// ─────────────────────────────────────────────
//  GERADOR PRINCIPAL
// ─────────────────────────────────────────────
export async function generateBanner(options: {
  events: SportEvent[];
  date: Date;
  format: 'post' | 'stories';
  template?: TemplateId;
  title?: string;
}): Promise<{ filePath: string; publicPath: string }> {
  const template = options.template ?? 'classic';
  const W = 1080;
  const isStories = options.format === 'stories';
  const maxEv = Math.min(options.events.length, isStories ? 10 : 8);

  const HEADER_H = 292;
  const FOOTER_H = 96;
  const PAD_X    = 20;
  const PAD_TOP  = 12;
  const GAP      = 14;
  const CARD_W   = W - PAD_X * 2;
  const MIN_H    = isStories ? 1920 : 1350;

  const usableH = MIN_H - HEADER_H - FOOTER_H - PAD_TOP;
  const CARD_H  = Math.max(100, Math.min(160,
    Math.floor((usableH - GAP * (maxEv - 1)) / maxEv)
  ));

  const totalCards = HEADER_H + PAD_TOP + maxEv * (CARD_H + GAP) - GAP + FOOTER_H;
  const H = Math.max(MIN_H, totalCards);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  // ── Fundo
  if (template === 'neon')    drawNeonBg(ctx, W, H);
  else if (template === 'minimal') drawMinimalBg(ctx, W, H);
  else                        drawClassicBg(ctx, W, H);

  // ── Header
  if (template === 'neon')    drawNeonHeader(ctx, W, options.date);
  else if (template === 'minimal') drawMinimalHeader(ctx, W, options.date);
  else                        drawClassicHeader(ctx, W, options.date, options.title ?? '');

  // ── Cards
  let curY = HEADER_H + PAD_TOP;
  for (let i = 0; i < maxEv; i++) {
    const ev = options.events[i];
    const ch = getChannelById(ev.league_id);
    if (template === 'neon')
      await drawNeonCard(ctx, ev, ch, PAD_X, curY, CARD_W, CARD_H);
    else if (template === 'minimal')
      await drawMinimalCard(ctx, ev, ch, PAD_X, curY, CARD_W, CARD_H);
    else
      await drawClassicCard(ctx, ev, ch, PAD_X, curY, CARD_W, CARD_H);
    curY += CARD_H + GAP;
  }

  // ── Mascote (só no classic)
  if (template === 'classic') await drawMascot(ctx, W, H);

  // ── Footer
  if (template === 'neon')    drawNeonFooter(ctx, W, H);
  else if (template === 'minimal') drawMinimalFooter(ctx, W, H);
  else                        drawClassicFooter(ctx, W, H);

  // ── Salvar
  const ds   = format(options.date, 'yyyy-MM-dd');
  const suf  = isStories ? '_stories' : '_post';
  const tpl  = template !== 'classic' ? `_${template}` : '';
  const fileName = `banner_${ds}${suf}${tpl}.png`;
  const filePath = path.join(BANNERS_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
  return { filePath, publicPath: `/banners/${fileName}` };
}
