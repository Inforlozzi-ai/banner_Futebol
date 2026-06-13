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

function drawGradientBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0,    '#0a4a9f');
  g.addColorStop(0.4,  '#0e8a40');
  g.addColorStop(0.75, '#d49020');
  g.addColorStop(1,    '#c84010');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // Brilho central
  const rg = ctx.createRadialGradient(w * 0.5, h * 0.35, 0, w * 0.5, h * 0.35, w * 0.7);
  rg.addColorStop(0, 'rgba(255,255,255,0.10)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);

  // Onda decorativa no rodapé
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.88);
  ctx.bezierCurveTo(w * 0.3, h * 0.78, w * 0.7, h * 0.94, w, h * 0.84);
  ctx.lineTo(w, h); ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

function drawHeader(ctx: CanvasRenderingContext2D, w: number, date: Date) {
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

  // Caixa da data
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

async function drawEventCard(
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

  // Proporções internas
  const logoSz = Math.round(cardH * 0.60);
  const pad    = 18;
  const midX   = x + cardW / 2;   // centro do card
  const midY   = y + cardH / 2;

  // ── Zona esquerda: logo casa (0 a 17% do card)
  const homeX = x + pad;
  const homeImg = await tryLoadImage(event.home_logo);
  if (homeImg) {
    ctx.drawImage(homeImg, homeX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#eeeeee';
    roundRect(ctx, homeX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // ── Zona centro-esquerda: nomes + horário (17% a 55%)
  const textX = homeX + logoSz + 14;
  const textMaxW = midX - textX - 10;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#111111';

  const fontSize = cardH > 120 ? 19 : 16;
  ctx.font = `bold ${fontSize}px Arial`;
  const homeShort = event.home_team.toUpperCase();
  const awayShort = event.away_team.toUpperCase();
  ctx.fillText(homeShort, textX, midY - 10);
  ctx.fillText(`${awayShort}`, textX, midY + fontSize + 2);

  // Caixa horário | canal
  const { formatInTimeZone } = require('date-fns-tz');
  const time = formatInTimeZone(new Date(event.datetime_brasilia), 'America/Sao_Paulo', 'HH:mm');
  const timeLabel = `${time}  |  ${channel}`;
  const tbY = midY + fontSize + 16;
  const tbH = 30;
  // Medir largura do texto para caixa dinâmica
  ctx.font = `bold 15px Arial`;
  const tbW = Math.min(ctx.measureText(timeLabel).width + 24, textMaxW + 60);
  ctx.fillStyle = '#111111';
  roundRect(ctx, textX, tbY, tbW, tbH, 6);
  ctx.fill();
  ctx.fillStyle = '#FFD700';
  ctx.fillText(timeLabel, textX + 12, tbY + 21);

  // ── Zona centro-direita: logo visitante (55% a 72%)
  const awayX = midX + 30;
  const awayImg = await tryLoadImage(event.away_logo);
  if (awayImg) {
    ctx.drawImage(awayImg, awayX, midY - logoSz / 2, logoSz, logoSz);
  } else {
    ctx.fillStyle = '#eeeeee';
    roundRect(ctx, awayX, midY - logoSz / 2, logoSz, logoSz, 8);
    ctx.fill();
  }

  // ── Zona direita: logo competição + nome liga (72% a 100%)
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

function drawFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
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

export async function generateBanner(options: {
  events: SportEvent[];
  date: Date;
  format: 'post' | 'stories';
  title?: string;
}): Promise<{ filePath: string; publicPath: string }> {
  const W = 1080;
  const isStories = options.format === 'stories';
  const maxEv = Math.min(options.events.length, isStories ? 10 : 8);

  const HEADER_H = 292;   // espaço reservado para título + data
  const FOOTER_H = 96;    // INFORLOZZI + margem inferior
  const PAD_X    = 20;    // margem lateral
  const PAD_TOP  = 12;    // espaço acima do primeiro card
  const GAP      = 14;    // espaço entre cards
  const CARD_W   = W - PAD_X * 2;

  // Altura mínima do canvas
  const MIN_H = isStories ? 1920 : 1350;

  // Distribui os cards para ocupar todo o espaço útil
  const usableH  = MIN_H - HEADER_H - FOOTER_H - PAD_TOP;
  const CARD_H   = Math.max(100, Math.min(160,
    Math.floor((usableH - GAP * (maxEv - 1)) / maxEv)
  ));

  // Altura real do canvas (não menor que MIN_H)
  const totalCards = HEADER_H + PAD_TOP + maxEv * (CARD_H + GAP) - GAP + FOOTER_H;
  const H = Math.max(MIN_H, totalCards);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  drawGradientBg(ctx, W, H);
  drawHeader(ctx, W, options.date);

  let curY = HEADER_H + PAD_TOP;
  for (let i = 0; i < maxEv; i++) {
    const ev = options.events[i];
    const ch = getChannelById(ev.league_id);
    await drawEventCard(ctx, ev, ch, PAD_X, curY, CARD_W, CARD_H);
    curY += CARD_H + GAP;
  }

  await drawMascot(ctx, W, H);
  drawFooter(ctx, W, H);

  const ds  = format(options.date, 'yyyy-MM-dd');
  const suf = isStories ? '_stories' : '_post';
  const fileName = `banner_${ds}${suf}.png`;
  const filePath = path.join(BANNERS_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));
  return { filePath, publicPath: `/banners/${fileName}` };
}
