import NextAuth, { type DefaultSession } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';
import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('auth');

// Type augmentation for next-auth v5
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role?: 'HOST' | 'CREATOR' | 'ADMIN';
    } & DefaultSession['user'];
  }

  interface User {
    role?: 'HOST' | 'CREATOR' | 'ADMIN';
  }
}

// Augment the JWT type from @auth/core
declare module '@auth/core/jwt' {
  interface JWT {
    id?: string;
    role?: 'HOST' | 'CREATOR' | 'ADMIN';
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'CreatorStays <noreply@creatorstays.com>',
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
    verifyRequest: '/verify-email',
    newUser: '/onboarding',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Fetch the user's role from the database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role as 'HOST' | 'CREATOR' | 'ADMIN' | undefined;
      }

      // Handle updates from the client
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
      }
      return session;
    },
    async signIn({ user, account }) {
      logger.info({ email: user.email, provider: account?.provider }, 'User sign in');
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      logger.info({ userId: user.id, email: user.email }, 'New user created');
    },
    async linkAccount({ user, account }) {
      logger.info({ userId: user.id, provider: account.provider }, 'Account linked');
    },
  },
  debug: process.env.NODE_ENV === 'development',
});
