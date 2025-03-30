import './globals.css';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";
import { CartProvider } from "../context/CartContext";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <div className="app-container">
          <CartProvider>
            {children}
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
