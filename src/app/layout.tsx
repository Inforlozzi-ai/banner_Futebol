import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Banner Futebol | Inforlozzi',
  description: 'Sistema automático de banners diários de futebol',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} bg-[#080d1a] text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
