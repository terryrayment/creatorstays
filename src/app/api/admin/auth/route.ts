import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'cs_admin_session'
const SESSION_DURATION = 60 * 60 * 24 * 7 // 7 days

// GET - Check if authenticated
export async function GET() {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)
  
  if (!session?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  
  // Verify session token matches expected hash
  const expectedHash = hashPassword(process.env.ADMIN_PASSWORD || '')
  if (session.value !== expectedHash) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  
  return NextResponse.json({ authenticated: true })
}

// POST - Login
export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD not set in environment')
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
  }
  
  try {
    const { password } = await request.json()
    
    if (password !== adminPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }
    
    // Create session
    const sessionToken = hashPassword(adminPassword)
    
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION,
      path: '/',
    })
    
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

// DELETE - Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(COOKIE_NAME)
  return response
}

// Simple hash function for session token (not for password storage!)
function hashPassword(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return `cs_admin_${Math.abs(hash).toString(36)}`
}
