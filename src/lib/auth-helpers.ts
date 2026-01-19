import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"

/**
 * Get the current session on the server
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/**
 * Get the current user or redirect to login
 */
export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  return session.user
}

/**
 * Require host role or redirect
 */
export async function requireHost() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  if (session.user.role !== "host") {
    redirect("/onboarding")
  }
  
  return session.user
}

/**
 * Require creator role or redirect
 */
export async function requireCreator() {
  const session = await getSession()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  if (session.user.role !== "creator") {
    redirect("/onboarding")
  }
  
  return session.user
}

/**
 * Check if user is authenticated (no redirect)
 */
export async function isAuthenticated() {
  const session = await getSession()
  return !!session?.user
}
