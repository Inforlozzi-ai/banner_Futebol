import fs from 'fs';
import path from 'path';
import https from 'https';

const MASCOTE_URL = 'https://i.ibb.co/N2bdxS3M/Chat-GPT-Image-13-de-jun-de-2026-17-43-00.png';
const MASCOTE_PATH = path.join(process.cwd(), 'public', 'assets', 'mascote.png');

export async function ensureMascote(): Promise<void> {
  if (fs.existsSync(MASCOTE_PATH)) return;

  const dir = path.dirname(MASCOTE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(MASCOTE_PATH);
    https.get(MASCOTE_URL, (res) => {
      // Seguir redirect se necessário
      if (res.statusCode === 301 || res.statusCode === 302) {
        fs.unlinkSync(MASCOTE_PATH);
        https.get(res.headers.location!, (res2) => {
          const file2 = fs.createWriteStream(MASCOTE_PATH);
          res2.pipe(file2);
          file2.on('finish', () => { file2.close(); console.log('Mascote baixado com sucesso!'); resolve(); });
          file2.on('error', reject);
        }).on('error', reject);
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log('Mascote baixado com sucesso!'); resolve(); });
      file.on('error', (err) => { fs.unlinkSync(MASCOTE_PATH); reject(err); });
    }).on('error', (err) => { reject(err); });
  });
}
