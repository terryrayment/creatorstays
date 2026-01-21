"use client"

import { useState } from "react"

interface PropertyGalleryProps {
  photos: string[]
  heroImage?: string
  title?: string
  size?: "sm" | "md" | "lg"
}

export function PropertyGallery({ photos, heroImage, title, size = "md" }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  // Combine hero image with photos, deduplicate
  const allPhotos = heroImage 
    ? [heroImage, ...photos.filter(p => p !== heroImage)]
    : photos

  if (allPhotos.length === 0) {
    return (
      <div className={`flex items-center justify-center rounded-xl border-2 border-dashed border-black/20 bg-black/5 ${
        size === "sm" ? "h-24" : size === "lg" ? "h-80" : "h-48"
      }`}>
        <span className="text-2xl"></span>
      </div>
    )
  }

  const sizeClasses = {
    sm: "h-24",
    md: "h-48",
    lg: "h-80",
  }

  // Single photo
  if (allPhotos.length === 1) {
    return (
      <div 
        className={`overflow-hidden rounded-xl border-2 border-black ${sizeClasses[size]} cursor-pointer`}
        onClick={() => setShowLightbox(true)}
      >
        <img 
          src={allPhotos[0]} 
          alt={title || "Property"} 
          className="h-full w-full object-cover transition-transform hover:scale-105"
        />
      </div>
    )
  }

  // Multiple photos - grid layout
  return (
    <>
      <div className={`grid gap-1 overflow-hidden rounded-xl border-2 border-black ${sizeClasses[size]} ${
        allPhotos.length === 2 ? "grid-cols-2" : 
        allPhotos.length === 3 ? "grid-cols-3" : 
        "grid-cols-4"
      }`}>
        {/* Main large image */}
        <div 
          className={`relative cursor-pointer overflow-hidden ${
            allPhotos.length <= 3 ? "col-span-2 row-span-1" : "col-span-2 row-span-2"
          }`}
          onClick={() => { setSelectedIndex(0); setShowLightbox(true) }}
        >
          <img 
            src={allPhotos[0]} 
            alt={title || "Property"} 
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>

        {/* Thumbnails */}
        {allPhotos.slice(1, size === "sm" ? 2 : size === "md" ? 3 : 5).map((photo, idx) => (
          <div 
            key={idx}
            className="relative cursor-pointer overflow-hidden"
            onClick={() => { setSelectedIndex(idx + 1); setShowLightbox(true) }}
          >
            <img 
              src={photo} 
              alt={`${title || "Property"} ${idx + 2}`} 
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            {/* Show +N overlay on last visible thumbnail if more photos */}
            {idx === (size === "sm" ? 0 : size === "md" ? 1 : 3) && allPhotos.length > (size === "sm" ? 2 : size === "md" ? 3 : 5) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-lg font-bold text-white">
                +{allPhotos.length - (size === "sm" ? 2 : size === "md" ? 3 : 5)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button 
            className="absolute right-4 top-4 text-3xl text-white hover:text-white/80"
            onClick={() => setShowLightbox(false)}
          >
            ✕
          </button>

          {/* Previous button */}
          {selectedIndex > 0 && (
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-2xl text-white hover:bg-white/30"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(i => i - 1) }}
            >
              ←
            </button>
          )}

          {/* Main image */}
          <img 
            src={allPhotos[selectedIndex]} 
            alt={`${title || "Property"} ${selectedIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next button */}
          {selectedIndex < allPhotos.length - 1 && (
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-2xl text-white hover:bg-white/30"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(i => i + 1) }}
            >
              →
            </button>
          )}

          {/* Thumbnail strip */}
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {allPhotos.map((photo, idx) => (
              <button
                key={idx}
                className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${
                  idx === selectedIndex ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                onClick={(e) => { e.stopPropagation(); setSelectedIndex(idx) }}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {selectedIndex + 1} / {allPhotos.length}
          </div>
        </div>
      )}
    </>
  )
}

// Compact version for cards
export function PropertyThumbnail({ 
  photo, 
  title,
  className = "" 
}: { 
  photo?: string
  title?: string
  className?: string 
}) {
  if (!photo) {
    return (
      <div className={`flex items-center justify-center rounded-lg border-2 border-dashed border-black/20 bg-black/5 ${className}`}>
        <span className="text-xl"></span>
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-lg border-2 border-black ${className}`}>
      <img src={photo} alt={title || "Property"} className="h-full w-full object-cover" />
    </div>
  )
}
