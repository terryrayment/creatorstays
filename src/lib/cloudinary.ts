import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

// Upload types
export type UploadResult = {
  url: string
  publicId: string
  format: string
  resourceType: 'image' | 'video'
  width?: number
  height?: number
  duration?: number // for videos, in seconds
  thumbnailUrl?: string
  bytes: number
}

/**
 * Upload a file to Cloudinary
 * Accepts base64 data URL or a remote URL
 */
export async function uploadToCloudinary(
  file: string, // base64 data URL or remote URL
  options?: {
    folder?: string
    resourceType?: 'image' | 'video' | 'auto'
    collaborationId?: string
  }
): Promise<UploadResult> {
  const { folder = 'creatorstays/content', resourceType = 'auto', collaborationId } = options || {}

  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: resourceType,
      // Add collaboration ID as context for organization
      context: collaborationId ? `collaboration=${collaborationId}` : undefined,
      // For videos: generate thumbnail, optimize
      eager: resourceType === 'video' || resourceType === 'auto' ? [
        { format: 'jpg', transformation: [{ width: 400, height: 300, crop: 'fill' }] }
      ] : undefined,
      eager_async: true,
    })

    // Build thumbnail URL for videos
    let thumbnailUrl: string | undefined
    if (result.resource_type === 'video') {
      thumbnailUrl = cloudinary.url(result.public_id, {
        resource_type: 'video',
        format: 'jpg',
        transformation: [{ width: 400, height: 300, crop: 'fill' }]
      })
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      resourceType: result.resource_type as 'image' | 'video',
      width: result.width,
      height: result.height,
      duration: result.duration,
      thumbnailUrl,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

/**
 * Upload multiple files to Cloudinary
 */
export async function uploadMultipleToCloudinary(
  files: string[],
  options?: {
    folder?: string
    collaborationId?: string
  }
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(file => uploadToCloudinary(file, options))
  )
  return results
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' = 'image'): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
    return true
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error)
    return false
  }
}

/**
 * Get optimized video URL with transformations
 */
export function getOptimizedVideoUrl(publicId: string): string {
  return cloudinary.url(publicId, {
    resource_type: 'video',
    transformation: [
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  })
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(publicId: string, width?: number, height?: number): string {
  return cloudinary.url(publicId, {
    transformation: [
      { width: width || 800, crop: 'limit' },
      { quality: 'auto' },
      { fetch_format: 'auto' }
    ]
  })
}
