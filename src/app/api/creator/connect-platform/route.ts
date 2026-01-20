import { NextRequest, NextResponse } from 'next/server'

type Platform = 'instagram' | 'tiktok' | 'youtube'

interface ConnectRequest {
  platform: Platform
  url: string
}

interface ConnectResponse {
  ok: boolean
  error?: string
  handle?: string
}

const platformPatterns: Record<Platform, RegExp> = {
  instagram: /^https?:\/\/(www\.)?instagram\.com\/([a-zA-Z0-9_.]+)\/?$/,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/@([a-zA-Z0-9_.]+)\/?$/,
  youtube: /^https?:\/\/(www\.)?(youtube\.com\/(c\/|channel\/|@)?|youtu\.be\/)([a-zA-Z0-9_-]+)\/?$/,
}

function extractHandle(platform: Platform, url: string): string | null {
  const match = url.match(platformPatterns[platform])
  if (!match) return null
  
  if (platform === 'instagram') return `@${match[2]}`
  if (platform === 'tiktok') return `@${match[2]}`
  if (platform === 'youtube') return match[4].startsWith('@') ? match[4] : `@${match[4]}`
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body: ConnectRequest = await request.json()
    const { platform, url } = body

    // Validate platform
    if (!['instagram', 'tiktok', 'youtube'].includes(platform)) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Invalid platform. Must be instagram, tiktok, or youtube.' 
      } as ConnectResponse)
    }

    // Validate URL format
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ 
        ok: false, 
        error: 'URL is required.' 
      } as ConnectResponse)
    }

    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Extract and validate handle
    const handle = extractHandle(platform, normalizedUrl)
    if (!handle) {
      const examples: Record<Platform, string> = {
        instagram: 'instagram.com/username',
        tiktok: 'tiktok.com/@username',
        youtube: 'youtube.com/@channel',
      }
      return NextResponse.json({ 
        ok: false, 
        error: `Invalid ${platform} URL. Example: ${examples[platform]}` 
      } as ConnectResponse)
    }

    // In a real implementation, we would:
    // 1. Verify the URL is accessible
    // 2. Store in database with user association
    // 3. Queue analytics sync job
    
    // For now, just return success with the extracted handle
    return NextResponse.json({ 
      ok: true,
      handle,
    } as ConnectResponse)

  } catch {
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid request body.' 
    } as ConnectResponse)
  }
}
