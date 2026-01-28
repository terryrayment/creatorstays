"use client"

import { useState } from "react"
import { Select } from "@/components/ui/select"

export interface UGCItem {
  id: string
  type: "image" | "video"
  mediaUrl: string
  title: string
  description: string
  tags: string[]
  createdAt: string
}

const STORAGE_KEY = "cs_creator_portfolio_v1"

// Load from localStorage
export function loadPortfolio(): UGCItem[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Save to localStorage
export function savePortfolio(items: UGCItem[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Modal component
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div 
        className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border-[3px] border-black bg-white p-5"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border-[2px] border-black bg-white text-black hover:bg-black hover:text-white"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

// Gallery item card
function GalleryCard({ 
  item, 
  onView, 
  onEdit, 
  onDelete,
  editable = false 
}: { 
  item: UGCItem
  onView: () => void
  onEdit?: () => void
  onDelete?: () => void
  editable?: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className="group relative overflow-hidden rounded-xl border-[2px] border-black bg-white transition-transform duration-200 hover:-translate-y-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media */}
      <div className="relative aspect-[4/3] cursor-pointer bg-black/5" onClick={onView}>
        {item.type === "image" ? (
          <img 
            src={item.mediaUrl} 
            alt={item.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E"
            }}
          />
        ) : (
          <video 
            src={item.mediaUrl}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            {...(isHovered ? { autoPlay: true } : {})}
            onError={(e) => {
              (e.target as HTMLVideoElement).poster = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23f0f0f0' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%23999'%3ENo video%3C/text%3E%3C/svg%3E"
            }}
          />
        )}
        {item.type === "video" && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black px-2 py-0.5 text-[9px] font-bold text-white">
            VIDEO
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h4 className="text-[12px] font-bold text-black line-clamp-1">{item.title}</h4>
        {item.description && (
          <p className="mt-1 text-[10px] text-black/70 line-clamp-2">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="rounded-full border border-black/20 px-2 py-0.5 text-[9px] font-medium text-black">
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-[9px] text-black/50">+{item.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Edit/Delete buttons */}
      {editable && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-black bg-white text-[10px] hover:bg-[#4AA3FF]"
            >
              ✎
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-black bg-white text-[10px] hover:bg-[#FF6B6B]"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Item detail modal
function ItemDetailModal({ item, onClose }: { item: UGCItem; onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="pr-8">
        {item.type === "image" ? (
          <img 
            src={item.mediaUrl} 
            alt={item.title}
            className="w-full rounded-lg border-[2px] border-black object-contain max-h-[50vh]"
          />
        ) : (
          <video 
            src={item.mediaUrl}
            className="w-full rounded-lg border-[2px] border-black max-h-[50vh]"
            controls
            autoPlay
            muted
          />
        )}
        <h3 className="mt-4 text-[16px] font-bold text-black">{item.title}</h3>
        {item.description && (
          <p className="mt-2 text-[13px] text-black/80 leading-relaxed">{item.description}</p>
        )}
        {item.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {item.tags.map(tag => (
              <span key={tag} className="rounded-full border-[2px] border-black px-3 py-1 text-[10px] font-bold text-black">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}

// Add/Edit form modal
function ItemFormModal({ 
  item, 
  onSave, 
  onClose 
}: { 
  item?: UGCItem
  onSave: (item: Omit<UGCItem, "id" | "createdAt">) => void
  onClose: () => void
}) {
  const [type, setType] = useState<"image" | "video">(item?.type || "image")
  const [mediaUrl, setMediaUrl] = useState(item?.mediaUrl || "")
  const [title, setTitle] = useState(item?.title || "")
  const [description, setDescription] = useState(item?.description || "")
  const [tagsInput, setTagsInput] = useState(item?.tags.join(", ") || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaUrl || !title) return
    
    const tags = tagsInput.split(",").map(t => t.trim()).filter(Boolean)
    onSave({ type, mediaUrl, title, description, tags })
    onClose()
  }

  const inputClass = "h-10 w-full rounded-lg border-[2px] border-black bg-white px-3 text-[13px] font-medium text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"

  return (
    <Modal onClose={onClose}>
      <h3 className="text-[16px] font-bold text-black pr-8">
        {item ? "Edit Portfolio Item" : "Add Portfolio Item"}
      </h3>
      
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Type</label>
          <Select
            value={type}
            onChange={e => setType(e.target.value as "image" | "video")}
            options={[
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
            ]}
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Media URL *</label>
          <input
            required
            type="url"
            placeholder="https://..."
            value={mediaUrl}
            onChange={e => setMediaUrl(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-[9px] text-black/50">Direct link to image or video file</p>
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Title *</label>
          <input
            required
            placeholder="e.g., Mountain Retreat Reel"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Description</label>
          <textarea
            placeholder="Brief description of the content..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className={`${inputClass} h-auto py-2`}
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-black uppercase tracking-wider text-black">Tags</label>
          <input
            placeholder="travel, cabin, cozy (comma separated)"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-full border-[2px] border-black bg-white text-[11px] font-black uppercase tracking-wider text-black transition-transform duration-200 hover:-translate-y-0.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 h-10 rounded-full bg-black text-[11px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
          >
            {item ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

// Main gallery component for dashboard (editable)
export function UGCGalleryManager() {
  const [items, setItems] = useState<UGCItem[]>([])
  const [loaded, setLoaded] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<UGCItem | null>(null)
  const [viewingItem, setViewingItem] = useState<UGCItem | null>(null)

  // Load on mount
  if (!loaded && typeof window !== "undefined") {
    setItems(loadPortfolio())
    setLoaded(true)
  }

  const handleAdd = (data: Omit<UGCItem, "id" | "createdAt">) => {
    const newItem: UGCItem = {
      ...data,
      id: `ugc_${Date.now()}`,
      createdAt: new Date().toISOString()
    }
    const updated = [newItem, ...items]
    setItems(updated)
    savePortfolio(updated)
  }

  const handleEdit = (data: Omit<UGCItem, "id" | "createdAt">) => {
    if (!editingItem) return
    const updated = items.map(item => 
      item.id === editingItem.id 
        ? { ...item, ...data }
        : item
    )
    setItems(updated)
    savePortfolio(updated)
    setEditingItem(null)
  }

  const handleDelete = (id: string) => {
    if (!confirm("Delete this portfolio item?")) return
    const updated = items.filter(item => item.id !== id)
    setItems(updated)
    savePortfolio(updated)
  }

  return (
    <div className="rounded-xl border border-foreground/5 bg-white/60 p-5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Portfolio</h2>
          <p className="mt-0.5 text-[10px] text-black/60">Hosts will see this when reviewing your profile.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-8 rounded-full bg-black px-4 text-[10px] font-black uppercase tracking-wider text-white transition-transform duration-200 hover:-translate-y-0.5"
        >
          + Add Item
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border-[2px] border-dashed border-black/20 py-8 text-center">
          <p className="text-[12px] text-black/50">No portfolio items yet.</p>
          <p className="mt-1 text-[10px] text-black/40">Add images or videos to showcase your work.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map(item => (
            <GalleryCard
              key={item.id}
              item={item}
              editable
              onView={() => setViewingItem(item)}
              onEdit={() => setEditingItem(item)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ItemFormModal
          onSave={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingItem && (
        <ItemFormModal
          item={editingItem}
          onSave={handleEdit}
          onClose={() => setEditingItem(null)}
        />
      )}
      {viewingItem && (
        <ItemDetailModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}
    </div>
  )
}

// Public gallery component (read-only)
export function UGCGalleryPublic({ items }: { items: UGCItem[] }) {
  const [viewingItem, setViewingItem] = useState<UGCItem | null>(null)

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-foreground/5 bg-white/60 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-black">Portfolio</h2>
        <div className="mt-4 rounded-lg border-[2px] border-dashed border-black/20 py-6 text-center">
          <p className="text-[12px] text-black/50">No portfolio yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-foreground/5 bg-white/60 p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-black">Portfolio</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(item => (
          <GalleryCard
            key={item.id}
            item={item}
            onView={() => setViewingItem(item)}
          />
        ))}
      </div>

      {viewingItem && (
        <ItemDetailModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}
    </div>
  )
}
