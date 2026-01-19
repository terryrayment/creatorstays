"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navigation/navbar"
import { Footer } from "@/components/navigation/footer"

interface Property {
  id: string
  title: string
  description?: string
  listingUrl?: string
  city?: string
  region?: string
  country?: string
  heroImageUrl?: string
  isActive: boolean
  isDraft: boolean
  airbnbLastFetchedAt?: string
  updatedAt: string
  createdAt: string
}

type EditingProperty = Partial<Property> & { isNew?: boolean }

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

function PropertyCard({ 
  property, 
  onEdit, 
  onDelete 
}: { 
  property: Property
  onEdit: () => void
  onDelete: () => void 
}) {
  return (
    <div className="group rounded-xl border border-foreground/5 bg-white/50 p-4 transition-all hover:bg-white/70">
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-foreground/5">
          {property.heroImageUrl ? (
            <img src={property.heroImageUrl} alt={property.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl text-muted-foreground/30">🏠</div>
          )}
        </div>
        
        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">{property.title}</h3>
              <p className="text-[11px] text-muted-foreground">
                {[property.city, property.region].filter(Boolean).join(', ') || 'No location'}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {property.isDraft && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-700">Draft</span>
              )}
              {!property.isActive && !property.isDraft && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-medium text-gray-600">Inactive</span>
              )}
              {property.isActive && !property.isDraft && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-medium text-emerald-700">Active</span>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
            <span>Updated {formatDate(property.updatedAt)}</span>
            {property.airbnbLastFetchedAt && (
              <span>• Synced {formatDate(property.airbnbLastFetchedAt)}</span>
            )}
          </div>
          
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-[10px]" onClick={onEdit}>Edit</Button>
            <Button size="sm" variant="ghost" className="h-7 text-[10px] text-red-600 hover:bg-red-50 hover:text-red-700" onClick={onDelete}>Delete</Button>
            {property.listingUrl && (
              <a href={property.listingUrl} target="_blank" rel="noopener noreferrer" 
                className="ml-auto flex h-7 items-center rounded-md px-2 text-[10px] text-muted-foreground hover:bg-foreground/5">
                View on Airbnb ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function PropertyEditor({ 
  property, 
  onSave, 
  onCancel,
  isSaving 
}: { 
  property: EditingProperty
  onSave: (data: EditingProperty) => void
  onCancel: () => void
  isSaving: boolean
}) {
  const [form, setForm] = useState<EditingProperty>(property)
  const [isPrefilling, setIsPrefilling] = useState(false)
  const [prefillError, setPrefillError] = useState<string | null>(null)

  const handlePrefill = async () => {
    if (!form.listingUrl) return
    setIsPrefilling(true)
    setPrefillError(null)
    
    try {
      const res = await fetch(`/api/airbnb/prefill?url=${encodeURIComponent(form.listingUrl)}`)
      if (res.ok) {
        const data = await res.json()
        setForm(prev => ({
          ...prev,
          title: data.title || prev.title,
          heroImageUrl: data.imageUrl || prev.heroImageUrl,
          city: data.cityRegion?.split(',')[0]?.trim() || prev.city,
          region: data.cityRegion?.split(',')[1]?.trim() || prev.region,
        }))
      } else {
        setPrefillError('Could not fetch listing details. You can enter them manually.')
      }
    } catch {
      setPrefillError('Prefill failed. Please enter details manually.')
    } finally {
      setIsPrefilling(false)
    }
  }

  const handleSubmit = (e: React.FormEvent, asDraft = false) => {
    e.preventDefault()
    onSave({ ...form, isDraft: asDraft })
  }

  return (
    <div className="rounded-xl border border-primary/10 bg-white/70 p-6">
      <h2 className="text-lg font-semibold">{property.isNew ? 'Add Property' : 'Edit Property'}</h2>
      
      <form onSubmit={(e) => handleSubmit(e, false)} className="mt-4 space-y-4">
        {/* Airbnb URL */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Airbnb URL</label>
          <div className="flex gap-2">
            <Input
              value={form.listingUrl || ''}
              onChange={e => setForm({ ...form, listingUrl: e.target.value })}
              placeholder="https://airbnb.com/rooms/123456"
              className="flex-1"
            />
            <Button type="button" variant="outline" size="sm" onClick={handlePrefill} disabled={!form.listingUrl || isPrefilling}>
              {isPrefilling ? 'Fetching...' : form.id ? 'Refresh' : 'Prefill'}
            </Button>
          </div>
          {prefillError && <p className="mt-1 text-[11px] text-amber-600">{prefillError}</p>}
          <p className="mt-1 text-[10px] text-muted-foreground">Paste your Airbnb listing URL to auto-fill details</p>
        </div>

        {/* Hero Image Preview */}
        {form.heroImageUrl && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Preview</label>
            <div className="h-32 w-48 overflow-hidden rounded-lg bg-foreground/5">
              <img src={form.heroImageUrl} alt="Property" className="h-full w-full object-cover" />
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Title *</label>
          <Input
            value={form.title || ''}
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="Cozy Mountain Cabin"
            required
          />
        </div>

        {/* Location */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">City</label>
            <Input
              value={form.city || ''}
              onChange={e => setForm({ ...form, city: e.target.value })}
              placeholder="Aspen"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Region / State</label>
            <Input
              value={form.region || ''}
              onChange={e => setForm({ ...form, region: e.target.value })}
              placeholder="Colorado"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Country</label>
            <Input
              value={form.country || ''}
              onChange={e => setForm({ ...form, country: e.target.value })}
              placeholder="USA"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Description</label>
          <textarea
            value={form.description || ''}
            onChange={e => setForm({ ...form, description: e.target.value })}
            placeholder="Describe your property..."
            rows={3}
            className="w-full resize-none rounded-lg border border-foreground/10 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Status */}
        {form.id && (
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">Status</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...form, isActive: true })}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${form.isActive ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-foreground/10 bg-white'}`}>
                Active
              </button>
              <button type="button" onClick={() => setForm({ ...form, isActive: false })}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${!form.isActive ? 'border-gray-400 bg-gray-50 text-gray-700' : 'border-foreground/10 bg-white'}`}>
                Inactive
              </button>
            </div>
          </div>
        )}

        {/* Last updated info */}
        {form.updatedAt && (
          <p className="text-[10px] text-muted-foreground">
            Last updated: {formatDate(form.updatedAt)}
            {form.airbnbLastFetchedAt && ` • Last synced from Airbnb: ${formatDate(form.airbnbLastFetchedAt)}`}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSaving || !form.title}>
            {isSaving ? 'Saving...' : 'Save Property'}
          </Button>
          {property.isNew && (
            <Button type="button" variant="outline" onClick={(e) => handleSubmit(e as unknown as React.FormEvent, true)} disabled={isSaving || !form.title}>
              Save as Draft
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}

export default function HostPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editing, setEditing] = useState<EditingProperty | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch properties
  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties')
      if (res.ok) {
        const data = await res.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (data: EditingProperty) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        await fetchProperties()
        setEditing(null)
      }
    } catch (error) {
      console.error('Failed to save property:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property? This cannot be undone.')) return
    
    try {
      const res = await fetch('/api/properties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete property:', error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Navbar />
      
      <main className="flex-1 py-8">
        <Container>
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Link href="/dashboard/host" className="text-xs text-muted-foreground hover:text-foreground">← Dashboard</Link>
              </div>
              <h1 className="mt-1 text-2xl font-semibold">My Properties</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Manage your vacation rental listings</p>
            </div>
            {!editing && (
              <Button onClick={() => setEditing({ isNew: true, isActive: true, isDraft: true })}>
                + Add Property
              </Button>
            )}
          </div>

          {/* Editor */}
          {editing && (
            <div className="mb-6">
              <PropertyEditor
                property={editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                isSaving={isSaving}
              />
            </div>
          )}

          {/* Properties List */}
          {isLoading ? (
            <div className="rounded-xl border border-foreground/5 bg-white/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">Loading properties...</p>
            </div>
          ) : properties.length === 0 && !editing ? (
            <div className="rounded-xl border border-dashed border-foreground/10 bg-white/30 p-12 text-center">
              <p className="text-lg font-medium">No properties yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Add your first Airbnb listing to get started</p>
              <Button className="mt-4" onClick={() => setEditing({ isNew: true, isActive: true, isDraft: true })}>
                + Add Your First Property
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map(property => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onEdit={() => setEditing(property)}
                  onDelete={() => handleDelete(property.id)}
                />
              ))}
            </div>
          )}

          {/* Help text */}
          <div className="mt-8 text-center">
            <p className="text-[11px] text-muted-foreground">
              Need help? <Link href="/help" className="text-primary hover:underline">Visit Help Center</Link>
            </p>
          </div>
        </Container>
      </main>

      <Footer />
    </div>
  )
}
