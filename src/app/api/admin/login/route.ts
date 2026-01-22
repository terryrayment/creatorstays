import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple 4-digit admin passcode
const ADMIN_PASSCODE = '0606'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const passcode = (body.passcode || '').trim()

    if (passcode === ADMIN_PASSCODE) {
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

    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
