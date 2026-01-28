"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

interface UploadedFile {
  url: string
  publicId?: string
  name: string
  type: "video" | "image"
  size?: number
  thumbnailUrl?: string
  uploaded: boolean // true = uploaded to Cloudinary, false = local preview only
}

export default function UploadContentPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const collaborationId = params.id as string

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [notes, setNotes] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "" as "success" | "error" | "" })
  const [collaboration, setCollaboration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dragActive, setDragActive] = useState(false)

  // Load collaboration details
  useEffect(() => {
    async function loadCollaboration() {
      try {
        const res = await fetch(`/api/collaborations/${collaborationId}`)
        if (res.ok) {
          const data = await res.json()
          setCollaboration(data.collaboration)
          // If content was already uploaded, pre-fill
          if (data.collaboration?.uploadedContentUrls?.length > 0) {
            setUploadedFiles(
              data.collaboration.uploadedContentUrls.map((url: string, i: number) => ({
                url,
                name: `Content ${i + 1}`,
                type: url.includes("video") ? "video" : "image",
                uploaded: true,
              }))
            )
          }
          if (data.collaboration?.uploadedContentNotes) {
            setNotes(data.collaboration.uploadedContentNotes)
          }
        }
      } catch (e) {
        console.error("Failed to load collaboration:", e)
      }
      setLoading(false)
    }
    loadCollaboration()
  }, [collaborationId])

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = error => reject(error)
    })
  }

  // Upload a single file to Cloudinary
  const uploadFileToCloudinary = async (file: File): Promise<UploadedFile | null> => {
    try {
      const base64 = await fileToBase64(file)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          collaborationId,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      const data = await res.json()
      
      return {
        url: data.file.url,
        publicId: data.file.publicId,
        name: file.name,
        type: data.file.type as "video" | "image",
        size: data.file.size,
        thumbnailUrl: data.file.thumbnailUrl,
        uploaded: true,
      }
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  // Handle file input change
  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    setUploading(true)
    const fileArray = Array.from(files)
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}: ${file.name}`)
      
      // Validate file type
      const isVideo = file.type.startsWith("video/")
      const isImage = file.type.startsWith("image/")
      
      if (!isVideo && !isImage) {
        setToast({ message: `Invalid file type: ${file.name}. Please upload images or videos.`, type: "error" })
        continue
      }
      
      // Validate file size (100MB max for videos, 10MB for images)
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        setToast({ 
          message: `File too large: ${file.name}. Max ${isVideo ? "100MB" : "10MB"}.`, 
          type: "error" 
        })
        continue
      }
      
      // Upload to Cloudinary
      const uploadedFile = await uploadFileToCloudinary(file)
      
      if (uploadedFile) {
        setUploadedFiles(prev => [...prev, uploadedFile])
      } else {
        setToast({ message: `Failed to upload ${file.name}`, type: "error" })
      }
    }
    
    setUploading(false)
    setUploadProgress("")
    setToast({ message: `${fileArray.length} file(s) uploaded successfully!`, type: "success" })
    setTimeout(() => setToast({ message: "", type: "" }), 3000)
  }

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }, [collaborationId])

  // Remove a file
  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index))
  }

  // Submit content for review
  const handleSubmit = async () => {
    if (uploadedFiles.length === 0) {
      setToast({ message: "Please upload at least one content file", type: "error" })
      return
    }

    // Make sure all files are uploaded to Cloudinary
    const allUploaded = uploadedFiles.every(f => f.uploaded)
    if (!allUploaded) {
      setToast({ message: "Some files are still uploading. Please wait.", type: "error" })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/content/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          contentUrls: uploadedFiles.map(f => f.url),
          notes: notes.trim() || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setToast({ message: "Content uploaded! Waiting for host approval.", type: "success" })
        setTimeout(() => {
          router.push(`/dashboard/collaborations/${collaborationId}`)
        }, 2000)
      } else {
        setToast({ message: data.error || "Failed to submit content", type: "error" })
      }
    } catch (e) {
      console.error("Submit error:", e)
      setToast({ message: "Network error. Please try again.", type: "error" })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="mt-4 text-sm text-black/60">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-[#FF7A00]">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Upload Content
            </span>
          </div>
          <Link 
            href={`/dashboard/collaborations/${collaborationId}`}
            className="rounded-full border-2 border-black bg-white px-4 py-1 text-[10px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
          >
            ← Back
          </Link>
        </div>
      </div>

      <Container className="py-8">
        <div className="mx-auto max-w-xl space-y-6">
          {/* Toast */}
          {toast.message && (
            <div className={`rounded-xl border-2 border-black px-4 py-3 text-sm font-bold ${
              toast.type === "success" ? "bg-[#28D17C] text-black" : "bg-red-100 text-red-700"
            }`}>
              {toast.type === "success" ? "✓ " : "⚠ "}{toast.message}
            </div>
          )}

          {/* Header */}
          <div>
            <h1 className="font-heading text-[2rem] font-black tracking-tight text-black">
              UPLOAD CONTENT
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Upload your content files for host approval before posting.
            </p>
          </div>

          {/* How it works */}
          <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">How This Works</p>
            <ul className="mt-3 space-y-2 text-sm text-black">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">1</span>
                <span><strong>Upload</strong> your finished video/image content here</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">2</span>
                <span><strong>Host reviews</strong> and approves (or requests changes)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">3</span>
                <span><strong>Once approved</strong>, you get your tracking link</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">4</span>
                <span><strong>Post live</strong> with the tracking link, then confirm</span>
              </li>
            </ul>
          </div>

          {/* Deliverables reminder */}
          {collaboration?.offer?.deliverables && (
            <div className="rounded-2xl border-[3px] border-black bg-white p-5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Required Deliverables</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {collaboration.offer.deliverables.map((d: string) => (
                  <span key={d} className="rounded-full border-2 border-black bg-[#FFD84A] px-3 py-1 text-xs font-bold text-black">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Content Files</p>
            <p className="text-xs text-black/60 mt-1">Upload videos and images for approval</p>

            {/* Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`mt-4 relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragActive 
                  ? "border-[#4AA3FF] bg-[#4AA3FF]" 
                  : uploading
                    ? "border-[#FF7A00] bg-[#FF7A00]"
                    : "border-black/30 hover:border-black"
              }`}
            >
              {uploading ? (
                <>
                  <div className="h-10 w-10 mx-auto animate-spin rounded-full border-3 border-white border-t-black" />
                  <p className="mt-3 font-bold text-black">Uploading to cloud...</p>
                  <p className="mt-1 text-xs text-black/60">{uploadProgress}</p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black/20 bg-black/5">
                    <svg className="h-6 w-6 text-black/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <p className="font-bold text-black">
                    {dragActive ? "Drop files here" : "Drag & drop files here"}
                  </p>
                  <p className="mt-1 text-xs text-black/60">
                    or click to browse
                  </p>
                  <label className="mt-3 inline-block cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="video/*,image/*"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                      disabled={uploading}
                    />
                    <span className="rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-bold text-white hover:bg-black/80">
                      Select Files
                    </span>
                  </label>
                  <p className="mt-3 text-[10px] text-black/40">
                    Videos up to 100MB • Images up to 10MB
                  </p>
                </>
              )}
            </div>

            {/* Uploaded files preview */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold text-black/60">{uploadedFiles.length} file(s) uploaded ✓</p>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-xl border-2 border-[#28D17C] bg-[#28D17C]/10 p-3">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-black bg-black">
                      {file.type === "video" ? (
                        file.thumbnailUrl ? (
                          <img src={file.thumbnailUrl} alt={file.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-white text-xs">🎬</div>
                        )
                      ) : (
                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-bold text-black text-sm">{file.name}</p>
                      <p className="text-xs text-black/60">
                        {file.type === "video" ? "🎬 Video" : "📸 Image"}
                        {file.size && ` • ${(file.size / 1024 / 1024).toFixed(1)}MB`}
                        <span className="ml-2 text-[#28D17C]">✓ Uploaded</span>
                      </p>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-black hover:bg-red-50 disabled:opacity-50"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Notes for Host (Optional)</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything the host should know about this content? Special angles, music choices, etc."
              rows={3}
              className="mt-2 w-full rounded-xl border-2 border-black px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          {/* Tips */}
          <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">💡 Tips for Approval</p>
            <ul className="mt-2 space-y-1 text-sm text-black">
              <li>• Show the property clearly and authentically</li>
              <li>• Mention where you'll add the tracking link</li>
              <li>• Include #ad or #sponsored in your caption plan</li>
              <li>• Higher quality = faster approval</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={uploadedFiles.length === 0 || submitting || uploading}
            className="w-full rounded-full border-[3px] border-black bg-[#28D17C] py-6 text-sm font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-1 hover:bg-[#28D17C]/90 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : uploading ? "Uploading..." : `Submit ${uploadedFiles.length} File(s) for Approval`}
          </Button>

          <p className="text-center text-xs text-black/60">
            The host will review your content and approve or request changes.
            <br />You'll get your tracking link once approved.
          </p>
        </div>
      </Container>
    </div>
  )
}
