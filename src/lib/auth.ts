import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { prisma } from "@/lib/prisma"

// Custom sendVerificationRequest using Resend API
async function sendVerificationRequest({
  identifier: email,
  url,
  provider: { from },
}: {
  identifier: string
  url: string
  provider: { from: string }
}) {
  // Try Resend first if API key exists
  if (process.env.RESEND_API_KEY) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from,
        to: email,
        subject: "Sign in to CreatorStays",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Sign in to CreatorStays</h1>
            <p style="color: #333; font-size: 16px; line-height: 1.5;">
              Click the button below to sign in to your account. This link expires in 24 hours.
            </p>
            <div style="margin: 30px 0;">
              <a href="${url}" style="background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
                Sign In →
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this email, you can safely ignore it.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              CreatorStays - Connecting creators with vacation rental hosts
            </p>
          </div>
        `,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[Auth] Resend error:", error)
      throw new Error(`Failed to send email: ${error}`)
    }
    
    console.log("[Auth] Magic link sent via Resend to:", email)
    return
  }

  // Fallback to nodemailer/SMTP
  const nodemailer = await import("nodemailer")
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT),
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  })

  await transport.sendMail({
    from,
    to: email,
    subject: "Sign in to CreatorStays",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000; font-size: 24px; margin-bottom: 20px;">Sign in to CreatorStays</h1>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">
          Click the button below to sign in to your account. This link expires in 24 hours.
        </p>
        <div style="margin: 30px 0;">
          <a href="${url}" style="background: #000; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
            Sign In →
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this email, you can safely ignore it.
        </p>
      </div>
    `,
  })
  
  console.log("[Auth] Magic link sent via SMTP to:", email)
}

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
      sendVerificationRequest, // Use our custom function
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
    newUser: "/onboarding", // Onboarding handles routing to /beta/dashboard/...
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
      
      // Track last login time (non-blocking, fails silently if column doesn't exist yet)
      if (user.id) {
        prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        }).catch(() => {
          // Silently ignore - lastLoginAt column might not exist yet
        })
      }
    },
  },
  
  debug: process.env.NODE_ENV === "development",
}
