"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"

export default function SubmitContentPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const collaborationId = params.id as string

  const [links, setLinks] = useState<string[]>([""])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState({ message: "", type: "" as "success" | "error" | "" })
  const [checklist, setChecklist] = useState([false, false, false, false])

  // Add another link field
  const addLink = () => {
    setLinks([...links, ""])
  }

  // Remove a link field
  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  // Update a link
  const updateLink = (index: number, value: string) => {
    const newLinks = [...links]
    newLinks[index] = value
    setLinks(newLinks)
  }

  // Submit content
  const handleSubmit = async () => {
    const validLinks = links.filter(l => l.trim() !== "")
    
    if (validLinks.length === 0) {
      setToast({ message: "Please add at least one content link", type: "error" })
      return
    }

    // Validate URLs
    for (const link of validLinks) {
      try {
        new URL(link)
      } catch {
        setToast({ message: `Invalid URL: ${link}`, type: "error" })
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/collaborations/${collaborationId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentLinks: validLinks }),
      })

      const data = await res.json()

      if (res.ok) {
        setToast({ message: "Content submitted! Waiting for host review.", type: "success" })
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

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Top bar */}
      <div className="border-b-2 border-black bg-[#28D17C]">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full border-2 border-black bg-white px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-black">
              Submit Content
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
              SUBMIT CONTENT
            </h1>
            <p className="mt-1 text-sm text-black/70">
              Add links to your posted content for host review.
            </p>
          </div>

          {/* Instructions */}
          <div className="rounded-2xl border-[3px] border-black bg-[#4AA3FF] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Instructions</p>
            <ul className="mt-3 space-y-2 text-sm text-black">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">1</span>
                <span>Post your content on Instagram, TikTok, or other platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">2</span>
                <span>Make sure you used your tracking link in the content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">3</span>
                <span>Copy the URL of each post and paste it below</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-black bg-white text-[10px] font-bold">4</span>
                <span>Include #ad or #sponsored as required by FTC guidelines</span>
              </li>
            </ul>
          </div>

          {/* Content Links */}
          <div className="rounded-2xl border-[3px] border-black bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Content Links</p>
            <p className="text-xs text-black/60">Paste the URLs of your posted content</p>

            <div className="mt-4 space-y-3">
              {links.map((link, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="https://instagram.com/p/..."
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    className="flex-1 rounded-xl border-2 border-black px-4 py-3 text-sm text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                  {links.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-black bg-white text-black hover:bg-red-50"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLink}
              className="mt-3 flex items-center gap-2 rounded-full border-2 border-dashed border-black/30 px-4 py-2 text-xs font-bold text-black/60 hover:border-black hover:text-black"
            >
              + Add Another Link
            </button>
          </div>

          {/* Checklist */}
          <div className="rounded-2xl border-[3px] border-black bg-[#FFD84A] p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/60">Before Submitting</p>
            <div className="mt-3 space-y-2">
              {[
                "Content is live and publicly visible",
                "Tracking link is included (link in bio, swipe up, etc.)",
                "FTC disclosure is included (#ad, #sponsored)",
                "All deliverables are completed",
              ].map((item, i) => (
                <label key={i} className="flex items-center gap-3 text-sm text-black cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={checklist[i]}
                    onChange={(e) => {
                      const newChecklist = [...checklist]
                      newChecklist[i] = e.target.checked
                      setChecklist(newChecklist)
                    }}
                    className="h-4 w-4 rounded border-2 border-black" 
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          {(() => {
            const hasLinks = links.filter(l => l.trim()).length > 0
            const allChecked = checklist.every(Boolean)
            const canSubmit = hasLinks && allChecked && !submitting
            
            return (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="w-full rounded-full border-[3px] border-black bg-black py-6 text-sm font-black uppercase tracking-wider text-white transition-transform hover:-translate-y-1 hover:bg-black/90 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit for Review"}
                </Button>
                
                {!canSubmit && !submitting && (
                  <p className="text-center text-xs text-red-600 font-medium">
                    {!hasLinks && "Add at least one content link"}
                    {hasLinks && !allChecked && "Complete all checklist items above"}
                  </p>
                )}
              </>
            )
          })()}

          <p className="text-center text-xs text-black/60">
            The host will review your content and approve or request changes.
          </p>
        </div>
      </Container>
    </div>
  )
}
