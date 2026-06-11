import { createCanvas, loadImage } from 'canvas';
import type { CanvasRenderingContext2D } from 'canvas';
import path from 'path';
import fs from 'fs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Game } from './football-api';

const BANNERS_DIR = path.join(process.cwd(), 'public', 'banners');
if (!fs.existsSync(BANNERS_DIR)) fs.mkdirSync(BANNERS_DIR, { recursive: true });

const C = {
  bg:       '#080d1a',
  card:     '#0d1530',
  card2:    '#0f1938',
  border:   '#1a3060',
  accent:   '#00d4ff',
  neon:     '#00ff88',
  yellow:   '#ffd700',
  white:    '#ffffff',
  gray:     '#8892a4',
  grayL:    '#c4cdd8',
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

function drawHeader(ctx: CanvasRenderingContext2D, w: number, date: Date) {
  const H = 170;
  const g = ctx.createLinearGradient(0, 0, w, H);
  g.addColorStop(0, '#0a1628');
  g.addColorStop(1, '#0d2044');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, H);

  // topo accent line
  ctx.fillStyle = C.accent;
  ctx.fillRect(0, 0, w, 5);

  // base accent line
  ctx.fillStyle = 'rgba(0,212,255,0.25)';
  ctx.fillRect(0, H - 2, w, 2);

  // INFORLOZZI
  ctx.textAlign = 'center';
  ctx.shadowColor = C.accent;
  ctx.shadowBlur = 24;
  ctx.fillStyle = C.white;
  ctx.font = 'bold 58px Arial';
  ctx.fillText('INFORLOZZI', w / 2, 76);
  ctx.shadowBlur = 0;

  // linha decorativa
  const lg = ctx.createLinearGradient(w / 2 - 200, 0, w / 2 + 200, 0);
  lg.addColorStop(0, 'transparent');
  lg.addColorStop(0.3, C.accent);
  lg.addColorStop(0.7, C.accent);
  lg.addColorStop(1, 'transparent');
  ctx.strokeStyle = lg;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 200, 88);
  ctx.lineTo(w / 2 + 200, 88);
  ctx.stroke();

  // JOGOS DE HOJE
  ctx.font = 'bold 30px Arial';
  ctx.fillStyle = C.neon;
  ctx.shadowColor = C.neon;
  ctx.shadowBlur = 12;
  ctx.fillText('⚽  JOGOS DE HOJE', w / 2, 132);
  ctx.shadowBlur = 0;

  // data
  const ds = format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  ctx.font = '19px Arial';
  ctx.fillStyle = C.gray;
  ctx.fillText(ds.toUpperCase(), w / 2, 160);
}

function drawFooter(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const fH = 95;
  const fY = h - fH;
  const g = ctx.createLinearGradient(0, fY, 0, h);
  g.addColorStop(0, '#0a1628');
  g.addColorStop(1, '#060b18');
  ctx.fillStyle = g;
  ctx.fillRect(0, fY, w, fH);

  ctx.fillStyle = 'rgba(0,212,255,0.4)';
  ctx.fillRect(0, fY, w, 2);

  ctx.textAlign = 'center';
  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = C.accent;
  ctx.shadowColor = C.accent;
  ctx.shadowBlur = 16;
  ctx.fillText('@Inforlozzi', w / 2, fY + 42);
  ctx.shadowBlur = 0;

  ctx.font = '17px Arial';
  ctx.fillStyle = C.gray;
  ctx.fillText('Jogos do Dia • Futebol 24h', w / 2, fY + 72);
}

async function drawCard(
  ctx: CanvasRenderingContext2D,
  game: Game,
  x: number,
  y: number,
  cW: number,
  cH: number,
  idx: number
) {
  // card bg
  roundRect(ctx, x, y, cW, cH, 12);
  const bg = ctx.createLinearGradient(x, y, x + cW, y + cH);
  bg.addColorStop(0, idx % 2 === 0 ? C.card : C.card2);
  bg.addColorStop(1, idx % 2 === 0 ? '#111d40' : '#131f42');
  ctx.fillStyle = bg;
  ctx.fill();

  // borda esquerda colorida
  const accentColors = [C.accent, C.neon, C.yellow];
  ctx.fillStyle = accentColors[idx % 3];
  ctx.fillRect(x, y + 8, 4, cH - 16);

  // borda card
  roundRect(ctx, x, y, cW, cH, 12);
  ctx.strokeStyle = 'rgba(26,48,96,0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();

  const cx = x + cW / 2;
  const cy = y + cH / 2;
  const logoSz = Math.min(50, cH - 20);

  // logos
  try {
    if (game.home_logo) {
      const img = await loadImage(game.home_logo);
      ctx.drawImage(img, cx - 130, cy - logoSz / 2, logoSz, logoSz);
    }
  } catch { /* sem logo */ }
  try {
    if (game.away_logo) {
      const img = await loadImage(game.away_logo);
      ctx.drawImage(img, cx + 80, cy - logoSz / 2, logoSz, logoSz);
    }
  } catch { /* sem logo */ }

  // horário
  const { formatInTimeZone } = require('date-fns-tz');
  const time = formatInTimeZone(new Date(game.datetime_brasilia), 'America/Sao_Paulo', 'HH:mm');
  ctx.textAlign = 'center';
  ctx.font = 'bold 15px Arial';
  ctx.fillStyle = C.yellow;
  ctx.fillText(time, cx, cy - 12);

  // VS
  ctx.font = 'bold 18px Arial';
  ctx.fillStyle = C.accent;
  ctx.fillText('VS', cx, cy + 8);

  // nomes
  ctx.font = 'bold 14px Arial';
  ctx.fillStyle = C.white;
  ctx.textAlign = 'right';
  const hn = game.home_team.length > 13 ? game.home_team.substring(0, 12) + '.' : game.home_team;
  ctx.fillText(hn, cx - 140, cy + 6);

  ctx.textAlign = 'left';
  const an = game.away_team.length > 13 ? game.away_team.substring(0, 12) + '.' : game.away_team;
  ctx.fillText(an, cx + 140, cy + 6);

  // campeonato
  ctx.textAlign = 'left';
  ctx.font = '11px Arial';
  ctx.fillStyle = C.gray;
  const lg = game.league.length > 32 ? game.league.substring(0, 31) + '...' : game.league;
  ctx.fillText('🏆 ' + lg, x + 20, y + cH - 10);
}

export async function generateBanner(options: {
  games: Game[];
  date: Date;
  format: 'post' | 'stories';
}): Promise<{ filePath: string; publicPath: string }> {
  const W = 1080;
  const H = options.format === 'stories' ? 1920 : 1350;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;

  await drawBg(ctx, W, H);
  drawHeader(ctx, W, options.date);
  drawFooter(ctx, W, H);

  const headerH = 175;
  const footerH = 100;
  const usableH = H - headerH - footerH;
  const pad = 22;
  const cW = W - pad * 2;
  const maxGames = Math.min(options.games.length, options.format === 'stories' ? 14 : 10);
  const cH = Math.min(90, Math.floor((usableH - pad) / maxGames) - 10);
  const gap = Math.floor((usableH - maxGames * cH) / (maxGames + 1));

  for (let i = 0; i < maxGames; i++) {
    const cY = headerH + gap + i * (cH + gap);
    await drawCard(ctx, options.games[i], pad, cY, cW, cH, i);
  }

  const ds = format(options.date, 'yyyy-MM-dd');
  const suf = options.format === 'stories' ? '_stories' : '_post';
  const fileName = `banner_${ds}${suf}.png`;
  const filePath = path.join(BANNERS_DIR, fileName);
  fs.writeFileSync(filePath, canvas.toBuffer('image/png'));

  return { filePath, publicPath: `/banners/${fileName}` };
}
