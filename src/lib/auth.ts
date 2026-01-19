import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Email Magic Links
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || "CreatorStays <hello@creatorstays.com>",
      maxAge: 24 * 60 * 60, // 24 hours
    }),
  ],
  
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login/error",
    newUser: "/onboarding",
  },
  
  callbacks: {
    async session({ session, user }) {
      // Add user ID and role to session
      if (session.user) {
        session.user.id = user.id
        
        // Check if user has creator or host profile
        const [creatorProfile, hostProfile] = await Promise.all([
          prisma.creatorProfile.findUnique({ where: { userId: user.id } }),
          prisma.hostProfile.findUnique({ where: { userId: user.id } }),
        ])
        
        session.user.role = creatorProfile ? "creator" : hostProfile ? "host" : null
        session.user.profileId = creatorProfile?.id || hostProfile?.id || null
        session.user.hasProfile = !!(creatorProfile || hostProfile)
      }
      return session
    },
    
    async signIn({ user, account, profile }) {
      // Allow all sign ins
      return true
    },
  },
  
  events: {
    async createUser({ user }) {
      // Log new user creation
      console.log("[CreatorStays] New user created:", user.email)
    },
    
    async signIn({ user, account, isNewUser }) {
      console.log("[CreatorStays] User signed in:", {
        email: user.email,
        provider: account?.provider,
        isNewUser,
      })
    },
  },
  
  debug: process.env.NODE_ENV === "development",
}
