import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { CartProvider } from "../context/CartContext";
import Script from 'next/script';
import dynamic from 'next/dynamic';

const TelegramProvider = dynamic(
  () => import('@/context/TelegramProvider').then(mod => mod.TelegramProvider),
  { ssr: false }
);

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
        <TelegramProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
