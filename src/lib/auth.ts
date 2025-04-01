import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
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

        // Здесь можно добавить дополнительную валидацию
        return {
          id: credentials.telegramId,
          name: `${credentials.firstName} ${credentials.lastName || ''}`,
          email: credentials.username ? `${credentials.username}@telegram.com` : undefined,
          image: credentials.photoUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
  session: {
    strategy: 'jwt',
  },
}; 