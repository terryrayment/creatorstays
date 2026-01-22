import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadToCloudinary, type UploadResult } from '@/lib/cloudinary'

export const dynamic = 'force-dynamic'

// For large file uploads, body size is handled by vercel.json or next.config.js
// In App Router, we don't use the old `config` export

// POST /api/upload - Upload a file to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { file, collaborationId } = body

    // file should be a base64 data URL (data:video/mp4;base64,...)
    if (!file || typeof file !== 'string') {
      return NextResponse.json({ error: 'File data required' }, { status: 400 })
    }

    // Validate it's a data URL
    if (!file.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid file format. Expected base64 data URL.' }, { status: 400 })
    }

    // Check file type from data URL
    const mimeMatch = file.match(/^data:([^;]+);/)
    const mimeType = mimeMatch ? mimeMatch[1] : ''
    
    const isVideo = mimeType.startsWith('video/')
    const isImage = mimeType.startsWith('image/')

    if (!isVideo && !isImage) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images and videos are allowed.' 
      }, { status: 400 })
    }

    // Upload to Cloudinary
    const result: UploadResult = await uploadToCloudinary(file, {
      folder: `creatorstays/content/${collaborationId || 'general'}`,
      collaborationId,
    })

    return NextResponse.json({
      success: true,
      file: {
        url: result.url,
        publicId: result.publicId,
        type: result.resourceType,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
        thumbnailUrl: result.thumbnailUrl,
        size: result.bytes,
      }
    })
  } catch (error) {
    console.error('[Upload API] Error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
