import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import Script from 'next/script';
import { ClientProviders } from '@/components/ClientProviders';

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const metadata: Metadata = {
  title: 'Наваливай',
  description: 'Магазин электронных сигарет',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBAPP_URL || 'http://localhost:3000'),
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.moysklad.ru;"
  }
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
