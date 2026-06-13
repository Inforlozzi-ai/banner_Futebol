import { createCanvas, loadImage } from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SportEvent } from './sports-api';

const BANNERS_DIR = path.join(process.cwd(), 'public', 'banners');
if (!fs.existsSync(BANNERS_DIR)) fs.mkdirSync(BANNERS_DIR, { recursive: true });

// ─── Mapeamento Canal por Competição ────────────────────────────────────────
export const CHANNEL_MAP: Record<string, string> = {
  WC:  'SBT / CazéTV',
  BSA: 'Sportv',
  CL:  'TNT / Max',
  PL:  'ESPN / Star+',
  PD:  'ESPN / Star+',
  SA:  'ESPN / Star+',
  FL1: 'ESPN / Star+',
  BL1: 'OneFootball',
  EC:  'SBT / CazéTV',
  CLI: 'Paramount+',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number
) {
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
  try { return await loadImage(url); } catch { return null; }
}

function drawGradientBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Fundo principal: azul escuro → verde → laranja (estilo modelo)
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0,    '#0a3d8f');
  g.addColorStop(0.35, '#0e7a3a');
  g.addColorStop(0.65, '#e8a020');
  g.addColorStop(1,    '#e05010');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Brilho central sutil
  const rg = ctx.createRadialGradient(w * 0.45, h * 0.4, 0, w * 0.45, h * 0.4, w * 0.6);
  rg.addColorStop(0, 'rgba(255,255,255,0.08)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  // Onda decorativa inferior
  const wg = ctx.createLinearGradient(0, h * 0.85, w, h);
  wg.addColorStop(0, 'rgba(10,61,143,0.6)');
  wg.addColorStop(0.5, 'rgba(14,122,58,0.4)');
  wg.addColorStop(1, 'rgba(224,80,16,0.6)');
  ctx.fillStyle = wg;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.9);
  ctx.bezierCurveTo(w * 0.25, h * 0.82, w * 0.75, h * 0.95, w, h * 0.85);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

async function drawHeader(ctx: CanvasRenderingContext2D, w: number, date: Date) {
  // Título "PRINCIPAIS JOGOS DO DIA"
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 8;

  // Linha 1 - PRINCIPAIS
  ctx.font = 'bold 88px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('PRINCIPAIS', w / 2, 120);

  // Linha 2 - JOGOS DO DIA (dourado)
  const gText = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, 0);
  gText.addColorStop(0, '#FFD700');
  gText.addColorStop(0.5, '#FFF176');
  gText.addColorStop(1, '#FFD700');
  ctx.fillStyle = gText;
  ctx.font = 'bold 92px Arial';
  ctx.fillText('JOGOS DO DIA', w / 2, 215);

  ctx.shadowBlur = 0;

  // Caixa da data
  const dateStr = format(date, "EEEE | dd 'DE' MMMM", { locale: ptBR }).toUpperCase();
  const boxW = 680;
  const boxH = 60;
  const boxX = (w - boxW) / 2;
  const boxY = 238;

  // Fundo da caixa
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, boxX, boxY, boxW, boxH, 30);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 2;
  roundRect(ctx, boxX, boxY, boxW, boxH, 30);
  ctx.stroke();

  // Texto da data
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.fillText(dateStr, w / 2, boxY + 41);
}

async function drawEventCard(
  ctx: CanvasRenderingContext2D,
  event: SportEvent,
  channel: string,
  x: number, y: number,
  cardW: number, cardH: number
) {
  const r = 18;

  // Sombra do card
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;

  // Fundo branco
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x, y, cardW, cardH, r);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const logoSz = Math.min(cardH - 20, 70);
  const centerX = x + cardW * 0.42;
  const centerY = y + cardH / 2;

  // ── Logo time da casa (esquerda)
  const homeImg = await tryLoadImage(event.home_logo);
  if (homeImg) {
    ctx.drawImage(homeImg, x + 14, centerY - logoSz / 2, logoSz, logoSz);
  } else {
    // Placeholder colorido
    ctx.fillStyle = '#e8e8e8';
    roundRect(ctx, x + 14, centerY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // ── Nome dos times + horário + canal (centro)
  const nameX = x + logoSz + 24;
  const nameMaxW = cardW * 0.42 - logoSz - 30;

  // Nomes dos times em caixa alta negrito
  const homeShort = event.home_team.toUpperCase();
  const awayShort = event.away_team.toUpperCase();
  const matchText = `${homeShort} X\n${awayShort}`;
  const lines = matchText.split('\n');

  ctx.textAlign = 'left';
  ctx.fillStyle = '#111111';
  ctx.font = `bold ${cardH > 110 ? 20 : 17}px Arial`;
  lines.forEach((line, i) => {
    ctx.fillText(line, nameX, centerY - 14 + i * 26);
  });

  // Caixa horário + canal (estilo LCD)
  const timeBoxX = nameX;
  const timeBoxY = centerY + 16;
  const timeBoxW = 170;
  const timeBoxH = 34;

  ctx.fillStyle = '#111111';
  roundRect(ctx, timeBoxX, timeBoxY, timeBoxW, timeBoxH, 6);
  ctx.fill();

  const { formatInTimeZone } = require('date-fns-tz');
  const time = formatInTimeZone(new Date(event.datetime_brasilia), 'America/Sao_Paulo', 'HH:mm');
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = '#FFD700';
  ctx.textAlign = 'left';
  ctx.fillText(`${time}  |  ${channel}`, timeBoxX + 10, timeBoxY + 24);

  // ── Logo time visitante (direita do centro)
  const awayImg = await tryLoadImage(event.away_logo);
  const awayX = x + cardW * 0.58;
  if (awayImg) {
    ctx.drawImage(awayImg, awayX, centerY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#e8e8e8';
    roundRect(ctx, awayX, centerY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // ── Logo da competição (canto direito do card)
  const compX = x + cardW - logoSz - 14;
  const leagueImg = await tryLoadImage(event.league_logo);
  if (leagueImg) {
    ctx.drawImage(leagueImg, compX, centerY - logoSz / 2, logoSz, logoSz);
  }

  // Nome da liga (abaixo do logo da competição)
  const leagueName = event.league.length > 14 ? event.league.substring(0, 13) + '.' : event.league;
  ctx.font = '11px Arial';
  ctx.fillStyle = '#666666';
  ctx.textAlign = 'center';
  ctx.fillText(leagueName, compX + logoSz / 2, y + cardH - 8);
}

async function drawMascot(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const mascotPath = path.join(process.cwd(), 'public', 'assets', 'mascote.png');
  if (!fs.existsSync(mascotPath)) return;
  try {
    const img = await loadImage(mascotPath);
    const mH = 320;
    const mW = (img.width / img.height) * mH;
    ctx.drawImage(img, w - mW - 10, h - mH - 60, mW, mH);
  } catch { /* mascote nao disponivel */ }
}

function drawFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 10;

  // INFORLOZZI em dourado grande
  const gFoot = ctx.createLinearGradient(w * 0.2, 0, w * 0.8, 0);
  gFoot.addColorStop(0, '#FFD700');
  gFoot.addColorStop(0.5, '#FFF59D');
  gFoot.addColorStop(1, '#FFD700');
  ctx.fillStyle = gFoot;
  ctx.font = 'bold 64px Arial';
  ctx.fillText('INFORLOZZI', w / 2, h - 28);
  ctx.shadowBlur = 0;
}

// ─── Exportação Principal ────────────────────────────────────────────────────
export async function generateBanner(options: {
  events: SportEvent[];
  date: Date;
  format: 'post' | 'stories';
  title?: string;
}): Promise<{ filePath: string; publicPath: string }> {
  const W = 1080;
  const isStories = options.format === 'stories';
  const maxEvents = Math.min(options.events.length, isStories ? 10 : 8);

  // Layout: header ~310px, footer ~90px, cards dinâmicos
  const HEADER_H = 315;
  const FOOTER_H = 90;
  const PAD = 20;
  const GAP = 12;
  const CARD_H = 108;
  const CARD_W = W - PAD * 2;

  // Altura total baseada nos eventos
  const contentH = maxEvents * (CARD_H + GAP) - GAP;
  const H = Math.max(
    isStories ? 1920 : 1350,
    HEADER_H + contentH + FOOTER_H + PAD * 3
  );

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  // 1. Fundo
  drawGradientBg(ctx, W, H);

  // 2. Header
  await drawHeader(ctx, W, options.date);

  // 3. Cards de jogos
  let curY = HEADER_H;
  for (let i = 0; i < maxEvents; i++) {
    const event = options.events[i];
    const channel = CHANNEL_MAP[event.league_id?.toString() ?? ''] ||
                    CHANNEL_MAP[event.league?.replace(/ /g,'').toUpperCase()] ||
                    'Sportv';
    await drawEventCard(ctx, event, channel, PAD, curY, CARD_W, CARD_H);
    curY += CARD_H + GAP;
  }

  // 4. Mascote
  await drawMascot(ctx, W, H);

  // 5. Footer
  drawFooter(ctx, W, H);

  // Salvar
  const ds = format(options.date, 'yyyy-MM-dd');
  const suf = isStories ? '_stories' : '_post';
  const fileName = `banner_${ds}${suf}.png`;
  const filePath = path.join(BANNERS_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));

  return { filePath, publicPath: `/banners/${fileName}` };
}
