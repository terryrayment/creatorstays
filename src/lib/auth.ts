import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import prisma from '@/lib/prisma';
import { createLogger } from '@/lib/logger';
import type { Adapter } from 'next-auth/adapters';

const logger = createLogger('auth');

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: 'jwt',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST || 'smtp.resend.com',
        port: Number(process.env.EMAIL_SERVER_PORT) || 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER || 'resend',
          pass: process.env.RESEND_API_KEY || '',
        },
      },
      from: process.env.EMAIL_FROM || 'CreatorStays <noreply@creatorstays.com>',
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
};
