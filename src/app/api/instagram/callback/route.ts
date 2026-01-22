import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Instagram OAuth - Step 2: Handle callback, exchange code for token
 */

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
  error?: {
    message: string
    type: string
    code: number
  }
}

interface UserResponse {
  id: string
  name?: string
  email?: string
  error?: {
    message: string
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('Instagram OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/beta/dashboard/creator?error=instagram_denied&message=${encodeURIComponent(errorDescription || error)}`, request.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/beta/dashboard/creator?error=instagram_invalid', request.url)
    )
  }

  // Validate state for CSRF protection
  const cookieStore = await cookies()
  const storedState = cookieStore.get('cs_oauth_state')?.value

  if (!storedState || storedState !== state) {
    console.error('State mismatch:', { storedState, receivedState: state })
    return NextResponse.redirect(
      new URL('/beta/dashboard/creator?error=instagram_csrf', request.url)
    )
  }

  // Clear the state cookie
  cookieStore.delete('cs_oauth_state')

  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_REDIRECT_URI || 'http://localhost:3000/api/instagram/callback'

  if (!appId || !appSecret) {
    return NextResponse.redirect(
      new URL('/beta/dashboard/creator?error=instagram_config', request.url)
    )
  }

  try {
    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', appId)
    tokenUrl.searchParams.set('client_secret', appSecret)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())
    const tokenData: TokenResponse = await tokenResponse.json()

    if (tokenData.error || !tokenData.access_token) {
      console.error('Token exchange failed:', tokenData.error)
      return NextResponse.redirect(
        new URL('/beta/dashboard/creator?error=instagram_token', request.url)
      )
    }

    // Get basic user info
    const userUrl = new URL('https://graph.facebook.com/v18.0/me')
    userUrl.searchParams.set('access_token', tokenData.access_token)
    userUrl.searchParams.set('fields', 'id,name,email')

    const userResponse = await fetch(userUrl.toString())
    const userData: UserResponse = await userResponse.json()

    if (userData.error) {
      console.error('User fetch failed:', userData.error)
    }

    // Store token in cookie (dev-only, in production use encrypted DB storage)
    // This is a simplified approach for scaffolding
    const connectionData = JSON.stringify({
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      userId: userData.id,
      userName: userData.name,
      connectedAt: new Date().toISOString(),
    })

    // Create response with redirect
    const response = NextResponse.redirect(
      new URL('/beta/dashboard/creator?connected=instagram', request.url)
    )

    // Set the token cookie
    response.cookies.set('cs_ig_token', connectionData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    })

    // Also set a non-httpOnly cookie for UI state (no sensitive data)
    response.cookies.set('cs_ig_connected', JSON.stringify({
      connected: true,
      userName: userData.name,
      connectedAt: new Date().toISOString(),
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 60, // 60 days
      path: '/',
    })

    return response
  } catch (err) {
    console.error('Instagram OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/beta/dashboard/creator?error=instagram_failed', request.url)
    )
  }
}
