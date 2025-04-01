import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  telegramId: string | null;
  moySkladId: string | null;
  ordersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Telegram',
      credentials: {
        telegramId: { label: 'Telegram ID', type: 'text' },
        firstName: { label: 'First Name', type: 'text' },
        lastName: { label: 'Last Name', type: 'text' },
        username: { label: 'Username', type: 'text' },
        photoUrl: { label: 'Photo URL', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.telegramId) {
          return null;
        }

        try {
          // Создаем или обновляем пользователя
          const user = await prisma.user.upsert({
            where: { telegramId: credentials.telegramId },
            update: {
              name: credentials.firstName,
              image: credentials.photoUrl,
            },
            create: {
              telegramId: credentials.telegramId,
              name: credentials.firstName,
              image: credentials.photoUrl,
              ordersCount: 0,
            },
          });

          return {
            id: user.id,
            name: user.name || '',
            email: user.email,
            image: user.image,
          };
        } catch (error) {
          console.error('Error in authorize:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
}; 