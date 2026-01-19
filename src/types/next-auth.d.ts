import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "creator" | "host" | null
      profileId: string | null
      hasProfile: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role?: "creator" | "host" | null
    profileId?: string | null
    hasProfile?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    role?: "creator" | "host" | null
    profileId?: string | null
    hasProfile?: boolean
  }
}
