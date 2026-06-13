import { createCanvas, loadImage } from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { SportEvent } from './sports-api';

const BANNERS_DIR = path.join(process.cwd(), 'public', 'banners');
if (!fs.existsSync(BANNERS_DIR)) fs.mkdirSync(BANNERS_DIR, { recursive: true });

const C = {
  bg:     '#080d1a',
  card:   '#0d1530',
  card2:  '#0f1938',
  border: '#1a3060',
  accent: '#00d4ff',
  neon:   '#00ff88',
  yellow: '#ffd700',
  white:  '#ffffff',
  gray:   '#8892a4',
  // Cores por esporte
  football:   '#00d4ff',
  basketball: '#ff6b35',
  volleyball: '#00ff88',
  mma:        '#ff3366',
};

const SPORT_COLORS: Record<string, string> = {
  football:   '#00d4ff',
  basketball: '#ff6b35',
  volleyball: '#00ff88',
  mma:        '#ff3366',
};

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

async function drawBg(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#060b18');
  g.addColorStop(0.5, '#080e1e');
  g.addColorStop(1, '#040810');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(26,48,96,0.2)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  const rg = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, w * 0.9);
  rg.addColorStop(0, 'rgba(0,80,180,0.18)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, w, h);
}

function drawHeader(ctx: CanvasRenderingContext2D, w: number, date: Date, title: string) {
  const H = 170;
  const g = ctx.createLinearGradient(0, 0, w, H);
  g.addColorStop(0, '#0a1628');
  g.addColorStop(1, '#0d2044');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, H);

  ctx.fillStyle = C.accent;
  ctx.fillRect(0, 0, w, 5);
  ctx.fillStyle = 'rgba(0,212,255,0.25)';
  ctx.fillRect(0, H - 2, w, 2);

  ctx.textAlign = 'center';
  ctx.shadowColor = C.accent;
  ctx.shadowBlur = 24;
  ctx.fillStyle = C.white;
  ctx.font = 'bold 56px Arial';
  ctx.fillText('INFORLOZZI', w / 2, 74);
  ctx.shadowBlur = 0;

  // linha decorativa
  const lg = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0);
  lg.addColorStop(0, 'transparent'); lg.addColorStop(0.3, C.accent);
  lg.addColorStop(0.7, C.accent);   lg.addColorStop(1, 'transparent');
  ctx.strokeStyle = lg; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(w/2-200, 86); ctx.lineTo(w/2+200, 86); ctx.stroke();

  // título dinâmico do banner
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = C.neon;
  ctx.shadowColor = C.neon; ctx.shadowBlur = 12;
  ctx.fillText(title, w / 2, 128);
  ctx.shadowBlur = 0;

  const ds = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  ctx.font = '18px Arial';
  ctx.fillStyle = C.gray;
  ctx.fillText(ds.toUpperCase(), w / 2, 158);
}

// Separador de seção de esporte
function drawSportDivider(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, sport: string, label: string) {
  const color = SPORT_COLORS[sport] ?? C.accent;
  roundRect(ctx, x, y, w, 28, 6);
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, color + '33');
  g.addColorStop(0.5, color + '22');
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = color + '66';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = color;
  ctx.fillText(label, x + 12, y + 19);
}

function drawFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const fH = 95;
  const fY = h - fH;
  const g = ctx.createLinearGradient(0, fY, 0, h);
  g.addColorStop(0, '#0a1628'); g.addColorStop(1, '#060b18');
  ctx.fillStyle = g; ctx.fillRect(0, fY, w, fH);
  ctx.fillStyle = 'rgba(0,212,255,0.4)'; ctx.fillRect(0, fY, w, 2);
  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = C.accent;
  ctx.shadowColor = C.accent; ctx.shadowBlur = 16;
  ctx.fillText('@Inforlozzi', w / 2, fY + 42);
  ctx.shadowBlur = 0;
  ctx.font = '17px Arial'; ctx.fillStyle = C.gray;
  ctx.fillText('Esportes do Dia • Ao Vivo 24h', w / 2, fY + 72);
}

async function drawEventCard(
  ctx: CanvasRenderingContext2D,
  event: SportEvent,
  x: number, y: number,
  cW: number, cH: number,
  idx: number
) {
  const sportColor = SPORT_COLORS[event.sport] ?? C.accent;

  roundRect(ctx, x, y, cW, cH, 10);
  const bg = ctx.createLinearGradient(x, y, x + cW, y + cH);
  bg.addColorStop(0, idx % 2 === 0 ? C.card : C.card2);
  bg.addColorStop(1, idx % 2 === 0 ? '#111d40' : '#131f42');
  ctx.fillStyle = bg; ctx.fill();

  // borda esquerda com cor do esporte
  ctx.fillStyle = sportColor;
  ctx.fillRect(x, y + 6, 4, cH - 12);

  roundRect(ctx, x, y, cW, cH, 10);
  ctx.strokeStyle = 'rgba(26,48,96,0.6)'; ctx.lineWidth = 1; ctx.stroke();

  const cx = x + cW / 2;
  const cy = y + cH / 2;
  const logoSz = Math.min(44, cH - 18);

  // logos
  try {
    if (event.home_logo) {
      const img = await loadImage(event.home_logo);
      ctx.drawImage(img, cx - 128, cy - logoSz / 2, logoSz, logoSz);
    }
  } catch { /* sem logo */ }
  try {
    if (event.away_logo) {
      const img = await loadImage(event.away_logo);
      ctx.drawImage(img, cx + 84, cy - logoSz / 2, logoSz, logoSz);
    }
  } catch { /* sem logo */ }

  // horário
  const { formatInTimeZone } = require('date-fns-tz');
  const time = formatInTimeZone(new Date(event.datetime_brasilia), 'America/Sao_Paulo', 'HH:mm');
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Arial'; ctx.fillStyle = C.yellow;
  ctx.fillText(time, cx, cy - 11);

  // VS
  ctx.font = 'bold 16px Arial'; ctx.fillStyle = sportColor;
  ctx.fillText('VS', cx, cy + 7);

  // nomes
  ctx.font = 'bold 13px Arial'; ctx.fillStyle = C.white;
  ctx.textAlign = 'right';
  const hn = event.home_team.length > 13 ? event.home_team.substring(0, 12) + '.' : event.home_team;
  ctx.fillText(hn, cx - 138, cy + 5);
  ctx.textAlign = 'left';
  const an = event.away_team.length > 13 ? event.away_team.substring(0, 12) + '.' : event.away_team;
  ctx.fillText(an, cx + 138, cy + 5);

  // campeonato + esporte
  ctx.textAlign = 'left'; ctx.font = '10px Arial'; ctx.fillStyle = C.gray;
  const lg = event.league.length > 34 ? event.league.substring(0, 33) + '...' : event.league;
  ctx.fillText(lg, x + 18, y + cH - 9);
}

export async function generateBanner(options: {
  events: SportEvent[];
  date: Date;
  format: 'post' | 'stories';
  title?: string;
}): Promise<{ filePath: string; publicPath: string }> {
  const W = 1080;
  const title = options.title ?? '🏆 ESPORTES DE HOJE';
  const isStories = options.format === 'stories';

  const pad = 20;
  const cW = W - pad * 2;
  const headerH = 175;
  const footerH = 100;
  const gap = 8;
  const maxEvents = Math.min(options.events.length, isStories ? 16 : 12);

  // Calcular altura dinâmica baseada nos eventos
  const sportsUsed = [...new Set(options.events.slice(0, maxEvents).map(e => e.sport))];
  const dividersH = sportsUsed.length * 40;

  // Altura de cada card: mínimo 90px, máximo 120px
  // Para poucos jogos (<=5), cards maiores para preencher melhor
  const targetH = isStories ? 1920 : 1350;
  const availableForCards = targetH - headerH - footerH - dividersH - pad * 2;
  const cH = Math.max(90, Math.min(130, Math.floor((availableForCards - gap * (maxEvents - 1)) / maxEvents)));

  // Altura total dinâmica: usa targetH como mínimo
  const contentH = dividersH + (cH + gap) * maxEvents + pad * 2;
  const H = Math.max(targetH, headerH + footerH + contentH);

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  await drawBg(ctx, W, H);
  drawHeader(ctx, W, options.date, title);
  drawFooter(ctx, W, H);

  let currentSport = '';
  let curY = headerH + pad;
  let cardIdx = 0;

  for (let i = 0; i < maxEvents; i++) {
    const event = options.events[i];

    if (event.sport !== currentSport) {
      drawSportDivider(ctx, pad, curY, cW, event.sport, event.sport_label);
      curY += 40;
      currentSport = event.sport;
    }

    await drawEventCard(ctx, event, pad, curY, cW, cH, cardIdx);
    curY += cH + gap;
    cardIdx++;
  }

  const ds = format(options.date, 'yyyy-MM-dd');
  const suf = isStories ? '_stories' : '_post';
  const fileName = `banner_${ds}${suf}.png`;
  const filePath = path.join(BANNERS_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));

  return { filePath, publicPath: `/banners/${fileName}` };
}
