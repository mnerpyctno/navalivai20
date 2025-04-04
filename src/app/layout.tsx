import './globals.css';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import dynamic from 'next/dynamic';

// Логирование загрузки стилей
console.log('[Layout] Загрузка стилей:', {
  globalsLoaded: true
});

const ClientProviders = dynamic(() => import('@/components/ClientProviders'), {
  ssr: false,
  loading: () => null
});

const InitProvider = dynamic(() => import('@/components/InitProvider'), {
  ssr: false,
  loading: () => null
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: 'Navalivaishop',
  description: 'Магазин Navalivaishop',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('[Layout] Рендеринг RootLayout');
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <div id="app-root">
          <ClientProviders>
            <InitProvider>
              {children}
            </InitProvider>
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
