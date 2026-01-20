"use client"

import { useState } from "react"

interface ReviewModalProps {
  collaborationId: string
  revieweeName: string
  revieweeType: "host" | "creator"
  propertyTitle?: string
  onClose: () => void
  onSuccess: () => void
}

function StarRating({ 
  value, 
  onChange, 
  size = "lg" 
}: { 
  value: number
  onChange: (val: number) => void
  size?: "sm" | "lg"
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className={`transition-transform hover:scale-110 ${size === "lg" ? "text-3xl" : "text-xl"}`}
        >
          {star <= (hovered || value) ? "★" : "☆"}
        </button>
      ))}
    </div>
  )
}

export function ReviewModal({ 
  collaborationId, 
  revieweeName, 
  revieweeType,
  propertyTitle,
  onClose, 
  onSuccess 
}: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [body, setBody] = useState("")
  const [communicationRating, setCommunicationRating] = useState(0)
  const [professionalismRating, setProfessionalismRating] = useState(0)
  const [qualityRating, setQualityRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select an overall rating")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collaborationId,
          rating,
          title: title || null,
          body: body || null,
          communicationRating: communicationRating || null,
          professionalismRating: professionalismRating || null,
          qualityRating: qualityRating || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        onSuccess()
        onClose()
      } else {
        setError(data.error || "Failed to submit review")
      }
    } catch (e) {
      setError("Network error. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-[3px] border-black bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black bg-[#FFD84A] p-4">
          <div>
            <h2 className="font-heading text-lg font-black text-black">LEAVE A REVIEW</h2>
            <p className="text-xs text-black/70">
              Review your collaboration with {revieweeName}
            </p>
          </div>
          <button onClick={onClose} className="text-black hover:text-black/70">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Overall Rating */}
          <div className="text-center">
            <p className="mb-2 text-sm font-bold text-black">Overall Rating *</p>
            <StarRating value={rating} onChange={setRating} />
            <p className="mt-1 text-xs text-black/50">
              {rating === 0 && "Select a rating"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Detailed Ratings */}
          <div className="rounded-xl border-2 border-black/10 bg-black/5 p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">
              Detailed Ratings (optional)
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">Communication</span>
              <StarRating value={communicationRating} onChange={setCommunicationRating} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">Professionalism</span>
              <StarRating value={professionalismRating} onChange={setProfessionalismRating} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-black">
                {revieweeType === "creator" ? "Content Quality" : "Property Accuracy"}
              </span>
              <StarRating value={qualityRating} onChange={setQualityRating} size="sm" />
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
              Review Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Summarize your experience..."
              className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm text-black placeholder:text-black/40"
            />
          </div>

          {/* Review Body */}
          <div>
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-black">
              Your Review (optional)
            </label>
            <textarea
              rows={4}
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder={
                revieweeType === "creator"
                  ? "How was your experience working with this creator? Tell other hosts about the content quality, communication, and professionalism..."
                  : "How was your experience working with this host? Tell other creators about the property, communication, and overall experience..."
              }
              className="w-full rounded-lg border-2 border-black px-3 py-2 text-sm text-black placeholder:text-black/40"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border-2 border-red-500 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border-2 border-black py-3 text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className="flex-1 rounded-full bg-[#28D17C] py-3 text-[11px] font-black uppercase tracking-wider text-black transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Display component for showing reviews
interface ReviewCardProps {
  review: {
    id: string
    rating: number
    title?: string | null
    body?: string | null
    communicationRating?: number | null
    professionalismRating?: number | null
    qualityRating?: number | null
    createdAt: string
  }
  reviewerName: string
  propertyTitle?: string
}

export function ReviewCard({ review, reviewerName, propertyTitle }: ReviewCardProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    })
  }

  return (
    <div className="rounded-xl border-2 border-black bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
            </span>
            <span className="text-xs font-bold text-black">{review.rating}/5</span>
          </div>
          {review.title && (
            <p className="mt-1 font-bold text-black">{review.title}</p>
          )}
        </div>
        <span className="text-xs text-black/50">{formatDate(review.createdAt)}</span>
      </div>
      
      {review.body && (
        <p className="mt-2 text-sm text-black/80">{review.body}</p>
      )}
      
      <div className="mt-3 flex items-center justify-between text-xs text-black/60">
        <span>By {reviewerName}</span>
        {propertyTitle && <span>{propertyTitle}</span>}
      </div>

      {/* Detailed ratings */}
      {(review.communicationRating || review.professionalismRating || review.qualityRating) && (
        <div className="mt-3 flex flex-wrap gap-3 border-t border-black/10 pt-3">
          {review.communicationRating && (
            <span className="text-xs text-black/60">
              Communication: {"★".repeat(review.communicationRating)}
            </span>
          )}
          {review.professionalismRating && (
            <span className="text-xs text-black/60">
              Professionalism: {"★".repeat(review.professionalismRating)}
            </span>
          )}
          {review.qualityRating && (
            <span className="text-xs text-black/60">
              Quality: {"★".repeat(review.qualityRating)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// Rating summary component
interface RatingSummaryProps {
  avgRating: number | null
  count: number
}

export function RatingSummary({ avgRating, count }: RatingSummaryProps) {
  if (count === 0) {
    return (
      <div className="text-sm text-black/50">No reviews yet</div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-black text-black">{avgRating?.toFixed(1)}</span>
      <div>
        <div className="text-sm">
          {"★".repeat(Math.round(avgRating || 0))}{"☆".repeat(5 - Math.round(avgRating || 0))}
        </div>
        <span className="text-xs text-black/60">{count} review{count !== 1 ? "s" : ""}</span>
      </div>
    </div>
  )
}
