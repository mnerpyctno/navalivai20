import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { ClientProviders } from '@/components/ClientProviders';
import { InitProvider } from '@/components/InitProvider';
import { TelegramAuthModal } from '@/components/TelegramAuthModal';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Наваливай',
  description: 'Магазин электронных сигарет',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBAPP_URL || 'http://localhost:3000'),
  other: {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org https://*.telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self' https://api.moysklad.ru https://telegram.org https://*.telegram.org;"
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
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        <ClientProviders>
          <InitProvider>
            <main>
              {children}
            </main>
            <TelegramAuthModal />
          </InitProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
