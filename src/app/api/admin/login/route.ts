import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Admin credentials - hardcoded for reliability
const ADMIN_EMAIL = 'terry@creatorpays.com'
const ADMIN_PASSWORD = 'Rapp195312!'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = (body.email || '').trim().toLowerCase()
    const password = (body.password || '').trim()

    // Debug logging (remove in production)
    console.log('[Admin Login] Attempt:', { 
      emailProvided: email, 
      emailExpected: ADMIN_EMAIL.toLowerCase(),
      passwordMatch: password === ADMIN_PASSWORD 
    })

    if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      // Set secure HTTP-only cookie
      const cookieStore = await cookies()
      cookieStore.set('admin_session', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
