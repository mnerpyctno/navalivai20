import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import Script from 'next/script';
import { ClientProviders } from '@/components/ClientProviders';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: 'Наваливай',
  description: 'Интернет-магазин Наваливай',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
