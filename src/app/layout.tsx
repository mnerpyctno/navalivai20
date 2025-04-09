import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import InitProvider from '@/components/InitProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Navalivai20',
  description: 'Интернет-магазин Navalivai20',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <InitProvider>
          {children}
        </InitProvider>
      </body>
    </html>
  );
}
